import { useNow } from "@/hooks/useNow";
import { formatCountdown, secondsUntilCutoff } from "@/lib/time";

export function AnnouncementBar() {
  const now = useNow(1000);
  const remaining = secondsUntilCutoff(now);
  return (
    <aside aria-label="Aviso de entregas" className="bg-rubor text-tinta">
      <p className="container flex min-h-[40px] flex-wrap items-center justify-center gap-x-1.5 py-2 text-center text-[13px] leading-snug tracking-[0.01em]">
        {remaining > 0 ? (
          <>
            <span>Pedí en las próximas</span>
            <span
              role="timer"
              aria-label={`Quedan ${formatCountdown(remaining)} para el corte de las 14 horas`}
              className="tabular inline-block min-w-[86px] rounded-full bg-papel/70 px-2 py-0.5 font-normal text-malva-oscuro"
            >
              {formatCountdown(remaining)}
            </span>
            <span>y lo entregamos hoy en CABA</span>
          </>
        ) : (
          <span>
            Pedí ahora y lo entregamos mañana a primera hora
            <span aria-hidden="true" className="mx-2 text-malva">·</span>
            Envío sin cargo desde $70.000
          </span>
        )}
      </p>
    </aside>
  );
}
