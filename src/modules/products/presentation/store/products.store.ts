import { create } from 'zustand';
import type { Product } from '../../domain/entities/product.entity';
import type { PaginatedProducts, ProductsFilters } from '../../domain/repositories/products.repository';
import { productsModule } from '../../di';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
}

interface ProductsActions {
  fetchProducts: (filters?: ProductsFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
}

export const useProductsStore = create<ProductsState & ProductsActions>((set) => ({
  items: [],
  selectedProduct: null,
  total: 0,
  page: 1,
  isLoading: false,
  error: null,

  fetchProducts: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const result = await productsModule.getProductsUseCase.execute(filters);
      set({ items: result.data, total: result.total, page: result.page });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading products' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productsModule.getProductDetailUseCase.execute(id);
      set({ selectedProduct: product });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading product' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedProduct: null }),
  clearError: () => set({ error: null }),
}));
