/** Simula la latencia de red de un servicio real. */
export function delay(ms = 700) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function mockId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
