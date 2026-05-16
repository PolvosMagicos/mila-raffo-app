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
  color?: { name: string; hex: string };
}

export interface ProductCharacteristic {
  id: string;
  name: string;
  dataType: string;
  units?: string;
  value: string;
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
  characteristics: ProductCharacteristic[];
  variants: ProductVariant[];
}
