export type OrderStatus =
  | 'pending_confirmation'
  | 'purchased'
  | 'in_stock_korea'
  | 'in_transit'
  | 'ready_for_pickup'
  | 'cancelled'
  | 'out_of_stock';

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productBrand: string;
  productImage: string;
  size: string;
  price: number;
  currency: string;
  createdAt: string;
  status: OrderStatus;
}
