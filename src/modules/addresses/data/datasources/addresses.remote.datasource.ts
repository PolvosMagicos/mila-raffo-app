import type { AxiosInstance } from 'axios';
import type { Address, CreateAddressInput } from '../../domain/entities/address.entity';

export class AddressesRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  getAll(): Promise<{ data: Address[] }> {
    return this.http.get('/addresses');
  }

  getById(id: string): Promise<{ data: Address }> {
    return this.http.get(`/addresses/${id}`);
  }

  create(input: CreateAddressInput): Promise<{ data: Address }> {
    return this.http.post('/addresses', input);
  }

  update(id: string, input: Partial<CreateAddressInput>): Promise<{ data: Address }> {
    return this.http.patch(`/addresses/${id}`, input);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/addresses/${id}`);
  }

  setDefault(id: string): Promise<{ data: Address }> {
    return this.http.patch(`/addresses/${id}/default`);
  }
}
