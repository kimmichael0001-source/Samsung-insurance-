import { products as fallbackProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory, ProductCondition } from '../types';

interface ProductRow {
  id: string;
  brand: string;
  title: string;
  description: string;
  category: ProductCategory;
  images: string[];
  original_price: number;
  sale_price: number;
  discount_percent: number;
  currency: string;
  available_sizes: string[];
  condition: ProductCondition;
  outlet_name: string;
  location: string;
  created_at: string;
  expires_at: string;
  is_available: boolean;
  is_featured: boolean;
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    brand: row.brand,
    title: row.title,
    description: row.description,
    category: row.category,
    images: row.images,
    originalPrice: row.original_price,
    salePrice: row.sale_price,
    discountPercent: row.discount_percent,
    currency: row.currency,
    availableSizes: row.available_sizes,
    condition: row.condition,
    outletName: row.outlet_name,
    location: row.location,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    isAvailable: row.is_available,
    isFeatured: row.is_featured,
  };
}

/** Fetches the catalog from Supabase, falling back to the bundled demo data. */
export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) return fallbackProducts;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Supabase fetchProducts failed, using local demo catalog:', error?.message);
    return fallbackProducts;
  }

  return (data as ProductRow[]).map(mapRow);
}
