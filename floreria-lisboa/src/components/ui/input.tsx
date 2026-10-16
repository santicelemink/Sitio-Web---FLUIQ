import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-option border border-linea bg-papel px-4 text-[15px] font-light text-tinta transition-[border-color,box-shadow] duration-300 ease-atelier hover:border-tinta/40 focus-visible:border-malva aria-[invalid=true]:border-error disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldClass, "h-12", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClass, "min-h-[104px] resize-none py-3 leading-relaxed", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
