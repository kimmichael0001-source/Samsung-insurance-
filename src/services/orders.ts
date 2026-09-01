import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types';

interface OrderRow {
  id: string;
  order_number: string;
  product_id: string;
  product_title: string;
  product_brand: string;
  product_image: string;
  size: string;
  price: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
}

function mapRow(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    productId: row.product_id,
    productTitle: row.product_title,
    productBrand: row.product_brand,
    productImage: row.product_image,
    size: row.size,
    price: row.price,
    currency: row.currency,
    createdAt: row.created_at,
    status: row.status,
  };
}

export async function fetchOrders(userId: string): Promise<Order[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Supabase fetchOrders failed:', error?.message);
    return [];
  }

  return (data as OrderRow[]).map(mapRow);
}

export interface NewOrderInput {
  id: string;
  productId: string;
  productTitle: string;
  productBrand: string;
  productImage: string;
  size: string;
  price: number;
  currency: string;
}

/** Inserts one or more orders and returns them as stored (order_number is assigned by the DB). */
export async function insertOrders(userId: string, orders: NewOrderInput[]): Promise<Order[]> {
  if (!supabase || orders.length === 0) return [];

  const { data, error } = await supabase
    .from('orders')
    .insert(
      orders.map((order) => ({
        id: order.id,
        user_id: userId,
        product_id: order.productId,
        product_title: order.productTitle,
        product_brand: order.productBrand,
        product_image: order.productImage,
        size: order.size,
        price: order.price,
        currency: order.currency,
        status: 'pending_confirmation',
      })),
    )
    .select();

  if (error || !data) {
    console.warn('Supabase insertOrders failed:', error?.message);
    return [];
  }

  return (data as OrderRow[]).map(mapRow);
}
