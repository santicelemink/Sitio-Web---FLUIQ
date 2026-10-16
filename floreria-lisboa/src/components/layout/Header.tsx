import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useSectionNav } from "@/hooks/useSectionNav";
import { CartButton } from "./CartButton";

const LINKS = [
  { id: "crear", label: "Creá tu ramo" },
  { id: "coleccion", label: "Colección" },
  { id: "suscripcion", label: "Suscripción" },
];

export function Header() {
  const goTo = useSectionNav();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-marfil/85 backdrop-blur-md supports-[backdrop-filter]:bg-marfil/75">
      <div className="container grid h-[var(--header-h)] grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`/#${l.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(l.id);
                  }}
                  className="rounded-sm text-[12px] uppercase tracking-[0.18em] text-tinta transition-colors duration-300 ease-atelier hover:text-malva-oscuro"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Logo className="items-start lg:items-center" />

        <div className="flex items-center justify-end gap-2">
          <CartButton />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-tinta transition-colors hover:bg-tinta/[0.05] lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" closeLabel="Cerrar menú" className="px-6 pb-8 pt-16">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SheetDescription className="sr-only">Secciones del sitio</SheetDescription>
          <nav aria-label="Menú mobile">
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.id} className="border-b border-linea">
                  <a
                    href={`/#${l.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      window.setTimeout(() => goTo(l.id), 220);
                    }}
                    className="block py-4 font-serif text-[26px] leading-tight text-tinta hover:text-malva-oscuro"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-auto text-[14px] leading-relaxed text-gris-texto">
            Lunes a sábado de 8 a 20 h
            <br />
            Domingos de 9 a 14 h
          </p>
        </SheetContent>
      </Sheet>
    </header>
  );
}
