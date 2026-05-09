import type { Address, CreateAddressInput } from '../entities/address.entity';

export interface AddressesRepository {
  getAll(): Promise<Address[]>;
  getById(id: string): Promise<Address>;
  create(input: CreateAddressInput): Promise<Address>;
  update(id: string, input: Partial<CreateAddressInput>): Promise<Address>;
  remove(id: string): Promise<void>;
  setDefault(id: string): Promise<Address>;
}
