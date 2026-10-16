import { STEPS } from "./steps";
import { cn } from "@/lib/utils";

export function StepProgress({ step, onSelect }: { step: number; onSelect: (step: number) => void }) {
  return (
    <nav aria-label="Pasos del diseño">
      <ol className="grid grid-cols-6 gap-1.5">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Paso ${i + 1}: ${s.title}${state === "done" ? " (completado)" : ""}`}
                className="group flex h-7 w-full items-center rounded-full"
              >
                <span
                  className={cn(
                    "h-[5px] w-full rounded-full transition-[background-color,transform] duration-300 ease-atelier group-hover:scale-y-[1.6]",
                    state === "done" && "bg-oro",
                    state === "current" && "bg-malva",
                    state === "todo" && "bg-linea group-hover:bg-tinta/20",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
