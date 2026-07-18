import { formatCardCvv, formatCardExpiration, formatCardNumber } from '../../card-input';

describe('card input formatters', () => {
  it('groups the card number every four digits and limits it to 16 digits', () => {
    expect(formatCardNumber('4111a1111-1111 1111 99')).toBe('4111 1111 1111 1111');
  });

  it('inserts the expiration separator and limits the value to four digits', () => {
    expect(formatCardExpiration('12')).toBe('12');
    expect(formatCardExpiration('12345')).toBe('12 / 34');
  });

  it('allows only three CVV digits', () => {
    expect(formatCardCvv('1a234')).toBe('123');
  });
});
