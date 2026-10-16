import { Camera, CreditCard, Flower2, Truck } from "lucide-react";
import { BENEFITS } from "@/data/content";

const ICONS = [Truck, Camera, Flower2, CreditCard];

export function Benefits() {
  return (
    <section aria-label="Beneficios" className="border-y border-linea bg-papel/60">
      <ul className="container grid grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b, i) => {
          const Icon = ICONS[i];
          return (
            <li
              key={b.title}
              className={[
                "flex flex-col gap-2 px-3 py-7 sm:px-6 sm:py-9",
                i % 2 === 1 ? "border-l border-linea" : "",
                i >= 2 ? "border-t border-linea lg:border-t-0" : "",
                i === 2 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 text-malva" strokeWidth={1.5} aria-hidden="true" />
              <p className="font-serif text-[21px] leading-tight sm:text-[23px]">{b.title}</p>
              <p className="text-pretty text-[14px] leading-snug text-gris-texto">{b.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
