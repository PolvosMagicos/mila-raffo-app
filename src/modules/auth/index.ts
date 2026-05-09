// Store & imperative access
export { useAuthStore, authStore } from './presentation/store/auth.store';

// Domain entities (for other modules)
export type { User, UserRole } from './domain/entities/user.entity';
export type { AuthSession, AuthTokens, LoginCredentials, RegisterCredentials } from './domain/entities/auth.entity';

// Repository interface (for other modules that need to type-check against auth)
export type { AuthRepository } from './domain/repositories/auth.repository';

// Shared API client (use this in all other modules)
export { apiClient } from '@/core/network/api-client';
