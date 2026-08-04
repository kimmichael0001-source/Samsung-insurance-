import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { initialOrders } from '../data/orders';
import { getProductById } from '../data/products';
import type { Order } from '../types';

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
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

let orderCounter = 10300;

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

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

    orderCounter += 1;
    const order: Order = {
      id: `o${Date.now()}`,
      orderNumber: `CODE-${orderCounter}`,
      productId: product.id,
      productTitle: product.title,
      productBrand: product.brand,
      productImage: product.images[0],
      size: input.size,
      price: product.salePrice,
      currency: product.currency,
      createdAt: new Date().toISOString(),
      status: 'pending_confirmation',
    };

    setOrders((current) => [order, ...current]);
    return order;
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({ favoriteIds, isFavorite, toggleFavorite, orders, createOrder }),
    [favoriteIds, isFavorite, toggleFavorite, orders, createOrder],
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
