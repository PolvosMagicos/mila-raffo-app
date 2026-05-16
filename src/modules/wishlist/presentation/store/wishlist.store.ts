import { create } from 'zustand';
import type { Wishlist } from '../../domain/entities/wishlist.entity';
import { wishlistModule } from '../../di';

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
}

interface WishlistActions {
  fetchWishlist: () => Promise<void>;
  addToWishlist: (variantId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (variantId: string) => boolean;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState & WishlistActions>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await wishlistModule.getWishlistUseCase.execute();
      set({ wishlist });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar la wishlist' });
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (variantId) => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await wishlistModule.addToWishlistUseCase.execute(variantId);
      set({ wishlist });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al agregar a la wishlist' });
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromWishlist: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistModule.removeFromWishlistUseCase.execute(itemId);
      const wishlist = await wishlistModule.getWishlistUseCase.execute();
      set({ wishlist });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar de la wishlist' });
    } finally {
      set({ isLoading: false });
    }
  },

  isInWishlist: (variantId) => {
    return get().wishlist?.items.some((i) => i.variantId === variantId) ?? false;
  },

  clearError: () => set({ error: null }),
}));

export const wishlistStore = {
  getState: () => useWishlistStore.getState(),
};
