import type { AddressesRepository } from '../repositories/addresses.repository';
import type { Address } from '../entities/address.entity';

export class GetAddressesUseCase {
  constructor(private readonly repository: AddressesRepository) {}

  execute(): Promise<Address[]> {
    return this.repository.getAll();
  }
}
