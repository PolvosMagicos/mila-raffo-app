import type { AuthSession } from '../../domain/entities/auth.entity';

export interface AuthResponseModel {
  user: {
    id: string;
    email: string;
    name: string;
    lastName: string;
    role: { id: string; name: string };
  };
  accessToken: string;
  refreshToken: string;
}

export function mapAuthResponseToSession(model: AuthResponseModel): AuthSession {
  return {
    user: {
      id: model.user.id,
      email: model.user.email,
      name: model.user.name,
      lastName: model.user.lastName,
      role: {
        id: model.user.role.id,
        name: model.user.role.name,
      },
    },
    tokens: {
      accessToken: model.accessToken,
      refreshToken: model.refreshToken,
    },
  };
}
