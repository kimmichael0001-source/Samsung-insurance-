import { getProductById } from '../data/products';
import { supabase } from '../lib/supabase';

const FALLBACK_STOCK_PER_SIZE = 99;

interface VariantRow {
  size: string;
  stock: number;
}

/** Maps size -> stock for one product. Falls back to "always in stock" locally. */
export async function fetchVariantStock(productId: string): Promise<Record<string, number>> {
  if (!supabase) {
    const product = getProductById(productId);
    if (!product) return {};
    return Object.fromEntries(product.availableSizes.map((size) => [size, FALLBACK_STOCK_PER_SIZE]));
  }

  const { data, error } = await supabase
    .from('product_variants')
    .select('size, stock')
    .eq('product_id', productId);

  if (error || !data) {
    console.warn('Supabase fetchVariantStock failed:', error?.message);
    return {};
  }

  return Object.fromEntries((data as VariantRow[]).map((row) => [row.size, row.stock]));
}
