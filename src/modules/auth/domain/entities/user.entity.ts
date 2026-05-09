export interface UserRole {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
}
