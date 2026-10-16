/**
 * Pedidos. Hoy es un mock que siempre responde con éxito.
 * Para conectar Supabase: reemplazar el cuerpo de createOrder por un
 * `supabase.from("orders").insert(...)` y devolver el mismo tipo. La UI no cambia.
 */
import type { CartItem, DeliveryInfo } from "@/types";
import { delay, mockId } from "./mock";

export interface OrderPayload {
  buyer: { name: string; email: string; whatsapp: string };
  recipient: { name: string; address: string; apartment?: string; phone: string; notes?: string };
  items: CartItem[];
  delivery: DeliveryInfo & { dateISO: string };
  subtotal: number;
  shipping: number;
  total: number;
}

export interface OrderResult {
  ok: true;
  id: string;
  number: string;
  createdAt: string;
}

export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
  await delay(650);
  const stamp = payload.delivery.dateISO.slice(5).replace("-", "");
  const number = `FL-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
  return { ok: true, id: mockId("ord"), number, createdAt: new Date().toISOString() };
}
