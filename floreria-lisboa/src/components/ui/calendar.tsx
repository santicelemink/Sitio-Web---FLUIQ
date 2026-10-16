import { DayPicker, type DayPickerProps } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      locale={es}
      className={cn("p-1", className)}
      classNames={{
        months: "relative flex flex-col",
        month: "space-y-3",
        month_caption: "flex h-10 items-center justify-center",
        caption_label: "font-serif text-[19px] capitalize",
        nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
        button_previous:
          "inline-flex h-9 w-9 items-center justify-center rounded-full text-tinta hover:bg-marfil disabled:opacity-30",
        button_next:
          "inline-flex h-9 w-9 items-center justify-center rounded-full text-tinta hover:bg-marfil disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-10 text-center text-[12px] font-normal uppercase tracking-[0.12em] text-gris-texto",
        week: "mt-1 flex w-full",
        day: "h-10 w-10 p-0 text-center",
        day_button:
          "inline-flex h-10 w-10 items-center justify-center rounded-full text-[14px] transition-colors duration-200 ease-atelier hover:bg-marfil aria-selected:bg-tinta aria-selected:text-marfil disabled:pointer-events-none",
        selected: "",
        today: "font-medium text-malva-oscuro",
        outside: "text-gris opacity-50",
        disabled: "text-gris opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          ),
      }}
      {...props}
    />
  );
}
