/**
 * Suscripciones. Mock: en producción se crea un plan recurrente
 * (preapproval de Mercado Pago) y se registra en Supabase.
 */
import { delay, mockId } from "./mock";

export type PlanId = "mensual" | "quincenal" | "semanal";

export async function createSubscription(planId: PlanId) {
  void planId;
  await delay(600);
  return { ok: true as const, id: mockId("sub") };
}
