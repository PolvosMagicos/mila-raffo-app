import axios from 'axios';

export function extractErrorMessage(err: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (msg) return Array.isArray(msg) ? msg[0] : String(msg);
    if (err.response?.status === 0 || !err.response) return 'Sin conexión con el servidor';
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
