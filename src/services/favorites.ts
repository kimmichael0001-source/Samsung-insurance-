import { supabase } from '../lib/supabase';

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('favorites').select('product_id').eq('user_id', userId);

  if (error || !data) {
    console.warn('Supabase fetchFavoriteIds failed:', error?.message);
    return [];
  }

  return data.map((row) => row.product_id as string);
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('favorites').insert({ user_id: userId, product_id: productId });
  if (error) console.warn('Supabase addFavorite failed:', error.message);
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) console.warn('Supabase removeFavorite failed:', error.message);
}
