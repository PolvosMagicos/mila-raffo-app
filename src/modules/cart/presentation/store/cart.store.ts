import { create } from 'zustand';
import type { Cart } from '../../domain/entities/cart.entity';
import { cartModule } from '../../di';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  loadCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

const EMPTY_CART: Cart = { items: [], total: 0, itemCount: 0 };

export const useCartStore = create<CartState & CartActions>((set) => ({
  cart: EMPTY_CART,
  isLoading: false,
  error: null,

  loadCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartModule.cartRepository.getCart();
      set({ cart });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar el carrito' });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartModule.cartRepository.addItem(variantId, quantity);
      set({ cart });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al agregar al carrito' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartModule.cartRepository.updateItem(itemId, quantity);
      set({ cart });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar el carrito' });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await cartModule.cartRepository.removeItem(itemId);
      const cart = await cartModule.cartRepository.getCart();
      set({ cart });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar del carrito' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartModule.cartRepository.clearCart();
      set({ cart: EMPTY_CART });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al vaciar el carrito' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export const cartStore = {
  getState: () => useCartStore.getState(),
  getItemCount: () => useCartStore.getState().cart.itemCount,
};
