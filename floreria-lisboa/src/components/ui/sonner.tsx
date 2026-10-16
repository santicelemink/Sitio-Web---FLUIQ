import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      duration={2400}
      gap={8}
      offset={24}
      mobileOffset={{ bottom: 88, left: 16, right: 16 }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center justify-center gap-4 rounded-full bg-tinta font-sans px-6 py-3.5 text-[14px] font-light leading-snug text-marfil shadow-lift sm:w-auto",
          title: "text-center",
          actionButton:
            "shrink-0 rounded-full border border-marfil/40 px-3 py-1 text-[13px] text-marfil transition-colors hover:bg-marfil hover:text-tinta",
        },
      }}
    />
  );
}
