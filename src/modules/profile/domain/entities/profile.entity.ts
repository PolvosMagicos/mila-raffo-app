export interface Profile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
