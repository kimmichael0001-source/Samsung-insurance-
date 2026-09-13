import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { initialOrders } from '../data/orders';
import { AnalyticsEvents, track } from '../lib/analytics';
import { ensureUserId } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import * as cartService from '../services/cart';
import * as favoritesService from '../services/favorites';
import * as ordersService from '../services/orders';
import { fetchProducts } from '../services/products';
import { fetchShippingDestinations } from '../services/shipping';
import type { CartItem, Order, Product, ShippingDestination } from '../types';

interface CreateOrderInput {
  productId: string;
  size: string;
}

export interface ShippingSelection {
  countryCode: string;
  cost: number;
  etaMinDays: number;
  etaMaxDays: number;
}

interface AppStateValue {
  isReady: boolean;
  isBackendConnected: boolean;
  products: Product[];
  getProductById: (productId: string) => Product | undefined;
  shippingDestinations: ShippingDestination[];
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  orders: Order[];
  createOrder: (input: CreateOrderInput, shipping: ShippingSelection) => Promise<Order | null>;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (input: CreateOrderInput, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  checkoutCart: (shipping: ShippingSelection) => Promise<Order[]>;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

let localOrderCounter = 10300;
function nextLocalOrderNumber(): string {
  localOrderCounter += 1;
  return `CODE-${localOrderCounter}`;
}

function buildLocalOrder(product: Product, size: string, shipping: ShippingSelection): Order {
  return {
    id: `o${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    orderNumber: nextLocalOrderNumber(),
    productId: product.id,
    productTitle: product.title,
    productBrand: product.brand,
    productImage: product.images[0],
    size,
    price: product.salePrice,
    currency: product.currency,
    createdAt: new Date().toISOString(),
    status: 'pending_confirmation',
    shippingCountry: shipping.countryCode,
    shippingCost: shipping.cost,
    estimatedDeliveryMinDays: shipping.etaMinDays,
    estimatedDeliveryMaxDays: shipping.etaMaxDays,
    trackingNumber: null,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [shippingDestinations, setShippingDestinations] = useState<ShippingDestination[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [loadedProducts, loadedShipping] = await Promise.all([
        fetchProducts(),
        fetchShippingDestinations(),
      ]);
      if (cancelled) return;
      setProducts(loadedProducts);
      setShippingDestinations(loadedShipping);

      const userId = isSupabaseConfigured ? await ensureUserId() : null;
      if (cancelled) return;
      userIdRef.current = userId;

      if (userId) {
        const [favorites, cart, remoteOrders] = await Promise.all([
          favoritesService.fetchFavoriteIds(userId),
          cartService.fetchCartItems(userId),
          ordersService.fetchOrders(userId),
        ]);
        if (cancelled) return;
        setFavoriteIds(favorites);
        setCartItems(cart);
        setOrders(remoteOrders);
      } else {
        // No backend (or anonymous sign-in unavailable): behave like the
        // original local-only demo — seed a few orders so the Orders screen
        // isn't empty on first launch.
        setOrders(initialOrders);
      }

      setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getProductById = useCallback(
    (productId: string) => products.find((product) => product.id === productId),
    [products],
  );

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((current) => {
      const isCurrentlyFavorite = current.includes(productId);
      const userId = userIdRef.current;

      if (userId) {
        if (isCurrentlyFavorite) {
          void favoritesService.removeFavorite(userId, productId);
        } else {
          void favoritesService.addFavorite(userId, productId);
        }
      }

      return isCurrentlyFavorite
        ? current.filter((id) => id !== productId)
        : [...current, productId];
    });
  }, []);

  /**
   * Creates a single order. When a Supabase backend is configured, a thrown
   * error here is real (e.g. the requested size just sold out) and must
   * reach the screen as an error — never silently swapped for a fake local
   * order, or the customer would believe they bought something they didn't.
   */
  const createOrder = useCallback(
    async (input: CreateOrderInput, shipping: ShippingSelection): Promise<Order | null> => {
      const product = getProductById(input.productId);
      if (!product) return null;

      const userId = userIdRef.current;

      if (userId) {
        const [created] = await ordersService.insertOrders(userId, [
          {
            id: `o${Date.now()}`,
            productId: product.id,
            productTitle: product.title,
            productBrand: product.brand,
            productImage: product.images[0],
            size: input.size,
            price: product.salePrice,
            currency: product.currency,
            shippingCountry: shipping.countryCode,
            shippingCost: shipping.cost,
            estimatedDeliveryMinDays: shipping.etaMinDays,
            estimatedDeliveryMaxDays: shipping.etaMaxDays,
          },
        ]);
        if (!created) return null;
        setOrders((current) => [created, ...current]);
        track(AnalyticsEvents.PURCHASE, { orderId: created.id, productId: product.id, value: created.price });
        return created;
      }

      const order = buildLocalOrder(product, input.size, shipping);
      setOrders((current) => [order, ...current]);
      track(AnalyticsEvents.PURCHASE, { orderId: order.id, productId: product.id, value: order.price });
      return order;
    },
    [getProductById],
  );

  const addToCart = useCallback(
    (input: CreateOrderInput, quantity: number = 1) => {
      const product = getProductById(input.productId);
      if (!product) return;

      setCartItems((current) => {
        const cartItemId = `${product.id}__${input.size}`;
        const existing = current.find((item) => item.id === cartItemId);
        const nextItem: CartItem = existing
          ? { ...existing, quantity: existing.quantity + quantity }
          : {
              id: cartItemId,
              productId: product.id,
              brand: product.brand,
              title: product.title,
              image: product.images[0],
              size: input.size,
              price: product.salePrice,
              currency: product.currency,
              quantity,
            };

        const userId = userIdRef.current;
        if (userId) {
          void cartService.upsertCartItem(userId, nextItem);
        }
        track(AnalyticsEvents.ADD_TO_CART, { productId: product.id, size: input.size, quantity });

        return existing
          ? current.map((item) => (item.id === cartItemId ? nextItem : item))
          : [nextItem, ...current];
      });
    },
    [getProductById],
  );

  const updateCartQuantity = useCallback((cartItemId: string, quantity: number) => {
    const userId = userIdRef.current;

    setCartItems((current) => {
      if (quantity <= 0) {
        if (userId) void cartService.removeCartItem(userId, cartItemId);
        return current.filter((item) => item.id !== cartItemId);
      }
      if (userId) void cartService.updateCartItemQuantity(userId, cartItemId, quantity);
      return current.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    const userId = userIdRef.current;
    if (userId) void cartService.removeCartItem(userId, cartItemId);
    setCartItems((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    const userId = userIdRef.current;
    if (userId) void cartService.clearCartItems(userId);
    setCartItems([]);
  }, []);

  /**
   * Turns the cart into orders (one row per unit). The Supabase insert is one
   * transaction — if any line is out of stock, the whole batch is rejected
   * and insertOrders throws; that error must propagate to the screen instead
   * of being swallowed, and the cart must stay untouched so the customer can
   * fix the offending item and retry (see cartService.clearCartItems below,
   * which — like setOrders/setCartItems — only runs after a successful insert).
   */
  const checkoutCart = useCallback(
    async (shipping: ShippingSelection): Promise<Order[]> => {
      const userId = userIdRef.current;
      const lineItems: { product: Product; size: string }[] = [];

      cartItems.forEach((item) => {
        const product = getProductById(item.productId);
        if (!product) return;
        for (let i = 0; i < item.quantity; i += 1) {
          lineItems.push({ product, size: item.size });
        }
      });

      if (lineItems.length === 0) return [];

      let createdOrders: Order[];

      if (userId) {
        createdOrders = await ordersService.insertOrders(
          userId,
          lineItems.map(({ product, size }, index) => ({
            id: `o${Date.now()}-${index}`,
            productId: product.id,
            productTitle: product.title,
            productBrand: product.brand,
            productImage: product.images[0],
            size,
            price: product.salePrice,
            currency: product.currency,
            shippingCountry: shipping.countryCode,
            shippingCost: shipping.cost,
            estimatedDeliveryMinDays: shipping.etaMinDays,
            estimatedDeliveryMaxDays: shipping.etaMaxDays,
          })),
        );
        void cartService.clearCartItems(userId);
      } else {
        createdOrders = lineItems.map(({ product, size }) => buildLocalOrder(product, size, shipping));
      }

      setOrders((current) => [...createdOrders, ...current]);
      setCartItems([]);
      track(AnalyticsEvents.PURCHASE, {
        orderCount: createdOrders.length,
        value: createdOrders.reduce((sum, order) => sum + order.price, 0),
      });

      return createdOrders;
    },
    [cartItems, getProductById],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      isReady,
      isBackendConnected: isSupabaseConfigured,
      products,
      getProductById,
      shippingDestinations,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      orders,
      createOrder,
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkoutCart,
    }),
    [
      isReady,
      products,
      getProductById,
      shippingDestinations,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      orders,
      createOrder,
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkoutCart,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
