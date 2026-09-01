import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';

interface CartItemRow {
  id: string;
  product_id: string;
  brand: string;
  title: string;
  image: string;
  size: string;
  price: number;
  currency: string;
  quantity: number;
}

function mapRow(row: CartItemRow): CartItem {
  return {
    id: row.id,
    productId: row.product_id,
    brand: row.brand,
    title: row.title,
    image: row.image,
    size: row.size,
    price: row.price,
    currency: row.currency,
    quantity: row.quantity,
  };
}

export async function fetchCartItems(userId: string): Promise<CartItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Supabase fetchCartItems failed:', error?.message);
    return [];
  }

  return (data as CartItemRow[]).map(mapRow);
}

export async function upsertCartItem(userId: string, item: CartItem): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('cart_items').upsert({
    id: item.id,
    user_id: userId,
    product_id: item.productId,
    brand: item.brand,
    title: item.title,
    image: item.image,
    size: item.size,
    price: item.price,
    currency: item.currency,
    quantity: item.quantity,
  });
  if (error) console.warn('Supabase upsertCartItem failed:', error.message);
}

export async function updateCartItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('id', cartItemId);
  if (error) console.warn('Supabase updateCartItemQuantity failed:', error.message);
}

export async function removeCartItem(userId: string, cartItemId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('id', cartItemId);
  if (error) console.warn('Supabase removeCartItem failed:', error.message);
}

export async function clearCartItems(userId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) console.warn('Supabase clearCartItems failed:', error.message);
}
