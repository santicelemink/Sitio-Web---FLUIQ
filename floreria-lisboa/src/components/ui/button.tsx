import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-sans font-normal transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-atelier disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-tinta text-marfil tracking-[0.06em] hover:bg-malva-oscuro active:scale-[0.98]",
        secondary:
          "rounded-full border border-tinta bg-transparent text-tinta tracking-[0.06em] hover:bg-tinta hover:text-marfil active:scale-[0.98]",
        tertiary:
          "rounded-sm px-0 py-0 text-malva-oscuro underline decoration-1 underline-offset-[5px] hover:text-tinta",
        ghost: "rounded-full text-tinta hover:bg-tinta/[0.05]",
        pill: "rounded-full border border-linea bg-papel text-tinta hover:border-tinta/60 active:scale-[0.98]",
      },
      size: {
        md: "px-[26px] py-[14px] text-[14px]",
        sm: "px-5 py-[10px] text-[13px]",
        xs: "px-4 py-2 text-[13px]",
        icon: "h-11 w-11 p-0",
        none: "",
      },
    },
    compoundVariants: [{ variant: "tertiary", className: "px-0 py-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size: variant === "tertiary" ? "none" : size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
