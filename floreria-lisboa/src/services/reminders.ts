/**
 * Recordatorios de fechas. Mock: en producción se guarda en Supabase y un job diario
 * envía el WhatsApp cinco días antes con una propuesta de ramo.
 */
import { delay, mockId } from "./mock";

export interface ReminderPayload {
  forWhom: string;
  date: string; // YYYY-MM-DD
  whatsapp: string;
}

export async function saveReminder(payload: ReminderPayload) {
  void payload;
  await delay(600);
  return { ok: true as const, id: mockId("rem") };
}
