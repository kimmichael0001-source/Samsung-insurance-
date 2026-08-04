import type { OrderStatus, ProductCategory, ProductCondition } from '../types';

export const categoryLabels: Record<ProductCategory, string> = {
  clothing: 'Одежда',
  shoes: 'Обувь',
  bags: 'Сумки',
  accessories: 'Аксессуары',
};

export const conditionLabels: Record<ProductCondition, string> = {
  new: 'Новое, с биркой',
  like_new: 'Как новое',
  excellent: 'Отличное состояние',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_confirmation: 'Ожидает подтверждения',
  purchased: 'Выкуплен',
  in_stock_korea: 'На складе в Корее',
  in_transit: 'В пути',
  ready_for_pickup: 'Готов к выдаче',
  cancelled: 'Отменён',
  out_of_stock: 'Нет в наличии',
};

export const orderStatusPipeline: OrderStatus[] = [
  'pending_confirmation',
  'purchased',
  'in_stock_korea',
  'in_transit',
  'ready_for_pickup',
];
