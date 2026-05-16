export interface WishlistItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  colorName: string | null;
  colorHex: string | null;
  price: number;
  imageUrl: string | null;
  stockAvailable: number;
  isAvailable: boolean;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
  count: number;
}
