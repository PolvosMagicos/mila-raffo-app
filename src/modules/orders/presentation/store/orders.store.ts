import { create } from 'zustand';
import type { Order } from '../../domain/entities/order.entity';
import type { CreateOrderInput } from '../../domain/repositories/orders.repository';
import { ordersModule } from '../../di';

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

interface OrdersActions {
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  cancelOrder: (id: string) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersState & OrdersActions>((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ordersModule.getOrdersUseCase.execute();
      set({ orders });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading orders' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersModule.ordersRepository.getById(id);
      set({ selectedOrder: order });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading order' });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersModule.createOrderUseCase.execute(input);
      set((s) => ({ orders: [order, ...s.orders] }));
      return order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating order';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelOrder: async (id) => {
    set({ isLoading: true });
    try {
      const updated = await ordersModule.ordersRepository.cancel(id);
      set((s) => ({ orders: s.orders.map((o) => (o.id === id ? updated : o)) }));
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedOrder: null }),
  clearError: () => set({ error: null }),
}));
