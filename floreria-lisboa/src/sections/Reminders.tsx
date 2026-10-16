import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidArgentinePhone } from "@/lib/phone";
import { saveReminder } from "@/services/reminders";

const schema = z.object({
  forWhom: z.string().trim().min(2, "Contanos para quién es la fecha."),
  date: z.string().min(1, "Elegí la fecha que querés recordar."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Dejanos tu WhatsApp para escribirte.")
    .refine(isValidArgentinePhone, "Revisá el número. Por ejemplo: 11 2345 6789."),
});

type FormValues = z.infer<typeof schema>;

export function Reminders({ headingLevel: Heading = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const ids = useId();
  const [saved, setSaved] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onTouched" });

  const onSubmit = async (values: FormValues) => {
    await saveReminder(values);
    setSaved(values.forWhom);
    toast("Recordatorio guardado. Te escribimos cinco días antes.");
    reset();
  };

  const field = (name: keyof FormValues, label: string, input: React.ReactNode) => (
    <div className="min-w-0">
      <label htmlFor={`${ids}-${name}`} className="text-[13px] tracking-[0.02em] text-tinta">
        {label}
      </label>
      <div className="mt-2">{input}</div>
      {errors[name] && (
        <p id={`${ids}-${name}-error`} className="mt-1.5 text-[13px] text-error">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  const aria = (name: keyof FormValues) => ({
    id: `${ids}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${ids}-${name}-error` : undefined,
  });

  return (
    <div className="mx-auto mt-16 max-w-[1080px] rounded-panel bg-salvia p-6 sm:p-10 lg:mt-20">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:gap-12">
        <div>
          <BellRing className="h-6 w-6 text-malva-profundo" strokeWidth={1.5} aria-hidden="true" />
          <Heading className="mt-4 font-serif text-[30px] leading-tight sm:text-[34px]">
            Que no se te pase <em className="italic text-malva-profundo">ninguna fecha</em>
          </Heading>
          <p className="mt-3 text-[15px] leading-relaxed text-gris-texto">
            Cargá cumpleaños y aniversarios. Cinco días antes te escribimos por WhatsApp con una propuesta de ramo lista
            para confirmar.
          </p>
          {saved && (
            <p className="mt-4 text-[14px] text-tinta" role="status">
              Listo: guardamos la fecha de {saved}.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          {field("forWhom", "Para quién", <Input {...register("forWhom")} {...aria("forWhom")} placeholder="Mamá, Sofi, Martín" autoComplete="off" />)}
          {field("date", "Fecha", <Input type="date" {...register("date")} {...aria("date")} />)}
          <div className="sm:col-span-2">
            {field(
              "whatsapp",
              "Tu WhatsApp",
              <Input type="tel" inputMode="tel" {...register("whatsapp")} {...aria("whatsapp")} placeholder="11 2345 6789" autoComplete="tel" />,
            )}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />}
              Guardar recordatorio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
