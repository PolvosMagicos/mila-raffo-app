import { create } from 'zustand';
import type { Profile, UpdateProfileInput, ChangePasswordInput } from '../../domain/entities/profile.entity';
import { profileModule } from '../../di';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

interface ProfileActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileModule.getProfileUseCase.execute();
      set({ profile });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileModule.updateProfileUseCase.execute(input);
      set({ profile });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error updating profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (input) => {
    set({ isLoading: true, error: null });
    try {
      await profileModule.profileRepository.changePassword(input);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error changing password' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
