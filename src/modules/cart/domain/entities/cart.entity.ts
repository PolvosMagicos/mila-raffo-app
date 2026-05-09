import type { Product } from '@/modules/products/domain/entities/product.entity';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
}
