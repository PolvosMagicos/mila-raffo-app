import { apiClient } from '@/core/network/api-client';

export type PaymentMethod = 'test' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
  order?: {
    id: string;
    orderNumber?: string;
    total: number;
    status: string;
    paymentStatus: string;
  };
}

export async function createPayment(orderId: string, method: PaymentMethod): Promise<Payment> {
  const { data } = await apiClient.post<Payment>('/payments', { orderId, method });
  return data;
}
