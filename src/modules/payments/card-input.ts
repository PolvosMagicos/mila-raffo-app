const CARD_NUMBER_DIGITS = 16;
const EXPIRATION_DIGITS = 4;
const CVV_DIGITS = 3;

function digitsOnly(value: string, limit: number): string {
  return value.replace(/\D/g, '').slice(0, limit);
}

export function formatCardNumber(value: string): string {
  return digitsOnly(value, CARD_NUMBER_DIGITS).replace(/(.{4})/g, '$1 ').trim();
}

export function formatCardExpiration(value: string): string {
  const digits = digitsOnly(value, EXPIRATION_DIGITS);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function formatCardCvv(value: string): string {
  return digitsOnly(value, CVV_DIGITS);
}
