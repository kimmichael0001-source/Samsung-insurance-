import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { initialOrders } from '../data/orders';
import { getProductById } from '../data/products';
import type { CartItem, Order, Product } from '../types';

interface CreateOrderInput {
  productId: string;
  size: string;
}

interface AppStateValue {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Order | null;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (input: CreateOrderInput, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  checkoutCart: () => Order[];
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

let orderCounter = 10300;

function buildOrder(product: Product, size: string): Order {
  orderCounter += 1;
  return {
    id: `o${Date.now()}-${orderCounter}`,
    orderNumber: `CODE-${orderCounter}`,
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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const createOrder = useCallback((input: CreateOrderInput): Order | null => {
    const product = getProductById(input.productId);
    if (!product) return null;

    const order = buildOrder(product, input.size);
    setOrders((current) => [order, ...current]);
    return order;
  }, []);

  const addToCart = useCallback((input: CreateOrderInput, quantity: number = 1) => {
    const product = getProductById(input.productId);
    if (!product) return;

    setCartItems((current) => {
      const cartItemId = `${product.id}__${input.size}`;
      const existing = current.find((item) => item.id === cartItemId);
      if (existing) {
        return current.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      const newItem: CartItem = {
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
      return [newItem, ...current];
    });
  }, []);

  const updateCartQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCartItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.id !== cartItemId);
      }
      return current.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const checkoutCart = useCallback((): Order[] => {
    const createdOrders: Order[] = [];

    cartItems.forEach((item) => {
      const product = getProductById(item.productId);
      if (!product) return;
      for (let i = 0; i < item.quantity; i += 1) {
        createdOrders.push(buildOrder(product, item.size));
      }
    });

    if (createdOrders.length > 0) {
      setOrders((current) => [...createdOrders, ...current]);
      setCartItems([]);
    }

    return createdOrders;
  }, [cartItems]);

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
