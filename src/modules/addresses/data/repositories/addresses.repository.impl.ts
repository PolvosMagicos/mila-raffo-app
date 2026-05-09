import type { AddressesRepository } from '../../domain/repositories/addresses.repository';
import type { Address, CreateAddressInput } from '../../domain/entities/address.entity';
import type { AddressesRemoteDataSource } from '../datasources/addresses.remote.datasource';

export class AddressesRepositoryImpl implements AddressesRepository {
  constructor(private readonly remote: AddressesRemoteDataSource) {}

  async getAll(): Promise<Address[]> {
    const { data } = await this.remote.getAll();
    return data;
  }

  async getById(id: string): Promise<Address> {
    const { data } = await this.remote.getById(id);
    return data;
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const { data } = await this.remote.create(input);
    return data;
  }

  async update(id: string, input: Partial<CreateAddressInput>): Promise<Address> {
    const { data } = await this.remote.update(id, input);
    return data;
  }

  async remove(id: string): Promise<void> {
    await this.remote.remove(id);
  }

  async setDefault(id: string): Promise<Address> {
    const { data } = await this.remote.setDefault(id);
    return data;
  }
}
