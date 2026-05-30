import { create } from 'zustand';
import type { Address, CreateAddressInput } from '../../domain/entities/address.entity';
import { addressesModule } from '../../di';

interface AddressesState {
  addresses: Address[];
  isFetching: boolean;
  isSaving: boolean;
  error: string | null;
}

interface AddressesActions {
  fetchAddresses: () => Promise<void>;
  createAddress: (input: CreateAddressInput) => Promise<void>;
  updateAddress: (id: string, input: Partial<CreateAddressInput>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useAddressesStore = create<AddressesState & AddressesActions>((set) => ({
  addresses: [],
  isFetching: false,
  isSaving: false,
  error: null,

  fetchAddresses: async () => {
    set({ isFetching: true, error: null });
    try {
      const addresses = await addressesModule.getAddressesUseCase.execute();
      set({ addresses });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading addresses' });
    } finally {
      set({ isFetching: false });
    }
  },

  createAddress: async (input) => {
    set({ isSaving: true });
    try {
      const address = await addressesModule.createAddressUseCase.execute(input);
      set((s) => ({ addresses: [...s.addresses, address] }));
    } finally {
      set({ isSaving: false });
    }
  },

  updateAddress: async (id, input) => {
    set({ isSaving: true });
    try {
      const updated = await addressesModule.addressesRepository.update(id, input);
      set((s) => ({ addresses: s.addresses.map((a) => (a.id === id ? updated : a)) }));
    } finally {
      set({ isSaving: false });
    }
  },

  removeAddress: async (id) => {
    set({ isSaving: true });
    try {
      await addressesModule.addressesRepository.remove(id);
      set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
    } finally {
      set({ isSaving: false });
    }
  },

  setDefault: async (id) => {
    set({ isSaving: true });
    try {
      await addressesModule.addressesRepository.setDefault(id);
      set((s) => ({
        addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      }));
    } finally {
      set({ isSaving: false });
    }
  },

  clearError: () => set({ error: null }),
}));
