import { create } from 'zustand';

import { onboardingLocalDatasource } from '../../data/datasources/onboarding.local.datasource';

interface OnboardingState {
  isCompleted: boolean | null;
  isLoading: boolean;
}

interface OnboardingActions {
  initialize: () => Promise<void>;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set) => ({
  isCompleted: null,
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const completed = await onboardingLocalDatasource.isCompleted();
      set({ isCompleted: completed });
    } finally {
      set({ isLoading: false });
    }
  },

  complete: async () => {
    await onboardingLocalDatasource.markCompleted();
    set({ isCompleted: true });
  },

  reset: async () => {
    await onboardingLocalDatasource.reset();
    set({ isCompleted: false });
  },
}));
