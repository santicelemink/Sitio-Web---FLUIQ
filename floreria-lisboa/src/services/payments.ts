/**
 * Pagos. Mock de Mercado Pago que siempre aprueba.
 * Para conectar Mercado Pago: crear la preferencia en el backend (Checkout Pro)
 * y redirigir a `init_point`, o usar Checkout Bricks. Mantener la misma firma.
 */
import { delay, mockId } from "./mock";

export type PaymentMethod = "mercadopago" | "tarjeta" | "transferencia";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  installments: 1 | 3;
}

export interface PaymentResult {
  ok: true;
  status: "approved";
  paymentId: string;
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mercadopago: "Mercado Pago",
  tarjeta: "Tarjeta de crédito o débito",
  transferencia: "Transferencia bancaria",
};

export async function createPayment(request: PaymentRequest): Promise<PaymentResult> {
  void request;
  await delay(800);
  return { ok: true, status: "approved", paymentId: mockId("pay") };
}
