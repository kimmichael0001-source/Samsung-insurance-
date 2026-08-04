export type ProductCategory = 'clothing' | 'shoes' | 'bags' | 'accessories';

export type ProductCondition = 'new' | 'like_new' | 'excellent';

export interface Product {
  id: string;
  brand: string;
  title: string;
  description: string;
  category: ProductCategory;
  images: string[];
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  availableSizes: string[];
  condition: ProductCondition;
  outletName: string;
  location: string;
  createdAt: string;
  expiresAt: string;
  isAvailable: boolean;
  isFeatured: boolean;
}
