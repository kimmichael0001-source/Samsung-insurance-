import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { initialOrders } from '../data/orders';
import { ensureUserId } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import * as cartService from '../services/cart';
import * as favoritesService from '../services/favorites';
import * as ordersService from '../services/orders';
import { fetchProducts } from '../services/products';
import type { CartItem, Order, Product } from '../types';

interface CreateOrderInput {
  productId: string;
  size: string;
}

interface AppStateValue {
  isReady: boolean;
  isBackendConnected: boolean;
  products: Product[];
  getProductById: (productId: string) => Product | undefined;
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Promise<Order | null>;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (input: CreateOrderInput, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  checkoutCart: () => Promise<Order[]>;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

let localOrderCounter = 10300;
function nextLocalOrderNumber(): string {
  localOrderCounter += 1;
  return `CODE-${localOrderCounter}`;
}

function buildLocalOrder(product: Product, size: string): Order {
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
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const loadedProducts = await fetchProducts();
      if (cancelled) return;
      setProducts(loadedProducts);

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

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<Order | null> => {
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
          },
        ]);
        if (created) {
          setOrders((current) => [created, ...current]);
          return created;
        }
        // Falls through to the local order below if the insert failed.
      }

      const order = buildLocalOrder(product, input.size);
      setOrders((current) => [order, ...current]);
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

  const checkoutCart = useCallback(async (): Promise<Order[]> => {
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

    let createdOrders: Order[] = [];

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
        })),
      );
      void cartService.clearCartItems(userId);
    }

    if (createdOrders.length === 0) {
      createdOrders = lineItems.map(({ product, size }) => buildLocalOrder(product, size));
    }

    setOrders((current) => [...createdOrders, ...current]);
    setCartItems([]);

    return createdOrders;
  }, [cartItems, getProductById]);

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
