import { create } from 'zustand';
import type { Product } from '../../domain/entities/product.entity';
import type { ProductsFilters } from '../../domain/repositories/products.repository';
import { productsModule } from '../../di';

interface ProductsState {
  items: Product[];
  homeItems: Product[];
  selectedProduct: Product | null;
  total: number;
  homeTotal: number;
  page: number;
  isLoading: boolean;
  isHomeLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  homeError: string | null;
}

interface ProductsActions {
  fetchProducts: (filters?: ProductsFilters) => Promise<void>;
  fetchHomeProducts: (filters?: ProductsFilters) => Promise<void>;
  loadMoreProducts: (filters?: ProductsFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
}

function onlyProductsWithVariants(products: Product[]): Product[] {
  return products.filter((product) => product.variants.length > 0);
}

export const useProductsStore = create<ProductsState & ProductsActions>((set, get) => ({
  items: [],
  homeItems: [],
  selectedProduct: null,
  total: 0,
  homeTotal: 0,
  page: 1,
  isLoading: false,
  isHomeLoading: false,
  isLoadingMore: false,
  hasMore: false,
  error: null,
  homeError: null,

  fetchProducts: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const result = await productsModule.getProductsUseCase.execute({
        ...filters,
        page: 1,
        offset: 0,
      });
      const withVariants = onlyProductsWithVariants(result.data);
      set({
        items: withVariants,
        total: result.total,
        page: 1,
        hasMore: result.data.length >= (filters?.limit ?? 12),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading products' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHomeProducts: async (filters) => {
    set({ isHomeLoading: true, homeError: null });
    try {
      const result = await productsModule.getProductsUseCase.execute({
        ...filters,
        page: 1,
        offset: 0,
      });
      const withVariants = onlyProductsWithVariants(result.data);
      set({
        homeItems: withVariants,
        homeTotal: result.total,
      });
    } catch (err) {
      set({ homeError: err instanceof Error ? err.message : 'Error loading products' });
    } finally {
      set({ isHomeLoading: false });
    }
  },

  loadMoreProducts: async (filters) => {
    const { items, isLoadingMore, hasMore } = get();
    if (isLoadingMore || !hasMore) return;
    set({ isLoadingMore: true });
    try {
      const result = await productsModule.getProductsUseCase.execute({
        ...filters,
        offset: items.length,
        page: undefined,
      });
      const withVariants = onlyProductsWithVariants(result.data);
      set((s) => ({
        items: [...s.items, ...withVariants],
        hasMore: result.data.length >= (filters?.limit ?? 12),
      }));
    } catch {
      // silently fail on load-more; existing items stay
    } finally {
      set({ isLoadingMore: false });
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
  clearError: () => set({ error: null, homeError: null }),
}));
