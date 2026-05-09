import { create } from 'zustand';
import type { User } from '../../domain/entities/user.entity';
import type { AuthTokens, LoginCredentials, RegisterCredentials } from '../../domain/entities/auth.entity';
import { authModule } from '../../di';
import { extractErrorMessage } from '@/core/network/extract-error';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const [tokens, user] = await Promise.all([
        authModule.authRepository.getStoredTokens(),
        authModule.authRepository.getStoredUser(),
      ]);

      if (tokens && user) {
        set({ user, tokens, isAuthenticated: true });
      }
    } catch {
      // No session stored — start unauthenticated
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authModule.loginUseCase.execute(credentials);
      set({ user: session.user, tokens: session.tokens, isAuthenticated: true });
    } catch (err) {
      set({ error: extractErrorMessage(err, 'Error al iniciar sesión') });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authModule.registerUseCase.execute(credentials);
      set({ user: session.user, tokens: session.tokens, isAuthenticated: true });
    } catch (err) {
      set({ error: extractErrorMessage(err, 'Error al registrarse') });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { tokens } = get();
    set({ isLoading: true, error: null });
    try {
      if (tokens) {
        await authModule.logoutUseCase.execute(tokens.accessToken, tokens.refreshToken);
      }
    } catch {
      // Swallow — always clear local session
    } finally {
      set({ ...initialState });
    }
  },

  clearError: () => set({ error: null }),
}));

// Imperative access for use outside React (e.g. interceptors, services)
export const authStore = {
  getState: () => useAuthStore.getState(),
  isAuthenticated: () => useAuthStore.getState().isAuthenticated,
  getTokens: () => useAuthStore.getState().tokens,
  getUser: () => useAuthStore.getState().user,
};
