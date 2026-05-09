export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  image: ProductImage | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  categories: ProductCategory[];
  category: ProductCategory | null;
  stock: number;
  isActive: boolean;
  slug: string;
  isCustomizable: boolean;
  variants: ProductVariant[];
}
