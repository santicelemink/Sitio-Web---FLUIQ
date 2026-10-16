import { PITCH_NOTES } from "@/data/content";
import { usePresentation } from "@/store/presentation";
import { cn } from "@/lib/utils";

/** Nota del modo presentación: solo se renderiza cuando el modo está activo. */
export function PitchNote({ n, className }: { n: number; className?: string }) {
  const active = usePresentation((s) => s.active);
  if (!active) return null;
  const note = PITCH_NOTES[n];
  return (
    <aside
      aria-label={`Nota de presentación ${n}: ${note.title}`}
      className={cn("pitch-note animate-fade-in rounded-card p-5 text-left shadow-soft sm:p-6", className)}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-malva-oscuro font-serif text-[15px] text-papel">
          {n}
        </span>
        <p className="font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-malva-oscuro">{note.title}</p>
      </div>
      <p className="mt-3 text-[15px] font-medium leading-snug text-tinta">{note.what}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-gris-texto">{note.why}</p>
    </aside>
  );
}

export function PitchNotes({ ns, className }: { ns: number[]; className?: string }) {
  const active = usePresentation((s) => s.active);
  if (!active) return null;
  return (
    <div className={cn("grid gap-4", ns.length > 1 && "md:grid-cols-2", className)}>
      {ns.map((n) => (
        <PitchNote key={n} n={n} />
      ))}
    </div>
  );
}
