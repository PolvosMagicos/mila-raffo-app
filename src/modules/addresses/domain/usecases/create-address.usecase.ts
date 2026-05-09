import type { AddressesRepository } from '../repositories/addresses.repository';
import type { Address, CreateAddressInput } from '../entities/address.entity';

export class CreateAddressUseCase {
  constructor(private readonly repository: AddressesRepository) {}

  execute(input: CreateAddressInput): Promise<Address> {
    return this.repository.create(input);
  }
}
