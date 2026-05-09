export interface Address {
  id: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateAddressInput {
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
}
