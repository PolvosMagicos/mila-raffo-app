import { create } from 'zustand';
import type { Cart } from '../../domain/entities/cart.entity';
import type { Product } from '@/modules/products/domain/entities/product.entity';
import { cartModule } from '../../di';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  loadCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

const EMPTY_CART: Cart = { items: [], subtotal: 0, total: 0 };

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  cart: EMPTY_CART,
  isLoading: false,
  error: null,

  loadCart: async () => {
    const cart = await cartModule.cartRepository.getCart();
    set({ cart });
  },

  addItem: async (product, quantity = 1) => {
    set({ isLoading: true });
    try {
      const { cart } = get();
      const existing = cart.items.find((i) => i.product.id === product.id);
      let updatedItems = existing
        ? cart.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...cart.items, { product, quantity }];

      const subtotal = updatedItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const updated: Cart = { items: updatedItems, subtotal, total: subtotal };
      await cartModule.cartRepository.updateItem(product.id, existing ? existing.quantity + quantity : quantity);
      set({ cart: updated });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error updating cart' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      const cart = await cartModule.cartRepository.updateItem(productId, quantity);
      set({ cart });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true });
    try {
      const cart = await cartModule.removeFromCartUseCase.execute(productId);
      set({ cart });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    await cartModule.cartRepository.clearCart();
    set({ cart: EMPTY_CART });
  },

  clearError: () => set({ error: null }),
}));

export const cartStore = {
  getState: () => useCartStore.getState(),
  getItemCount: () => useCartStore.getState().cart.items.reduce((s, i) => s + i.quantity, 0),
};
