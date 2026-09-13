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
  shipping_country: string | null;
  shipping_cost: number;
  estimated_delivery_min_days: number | null;
  estimated_delivery_max_days: number | null;
  tracking_number: string | null;
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
    shippingCountry: row.shipping_country,
    shippingCost: row.shipping_cost,
    estimatedDeliveryMinDays: row.estimated_delivery_min_days,
    estimatedDeliveryMaxDays: row.estimated_delivery_max_days,
    trackingNumber: row.tracking_number,
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
  shippingCountry: string | null;
  shippingCost: number;
  estimatedDeliveryMinDays: number | null;
  estimatedDeliveryMaxDays: number | null;
}

/**
 * Inserts one or more orders and returns them as stored (order_number is
 * assigned by the DB). Insert is one transaction: if any line is out of
 * stock, the whole batch is rejected and this throws — callers must not
 * treat a thrown error as "no backend, fall back to local", since it means
 * a real, configured backend refused the order (most commonly: an
 * out-of-stock size, surfaced via the decrement_variant_stock trigger).
 */
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
        shipping_country: order.shippingCountry,
        shipping_cost: order.shippingCost,
        estimated_delivery_min_days: order.estimatedDeliveryMinDays,
        estimated_delivery_max_days: order.estimatedDeliveryMaxDays,
      })),
    )
    .select();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error('Не удалось создать заказ. Попробуйте ещё раз.');
  }

  return (data as OrderRow[]).map(mapRow);
}
