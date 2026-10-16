import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("kicker", className)}>{children}</p>;
}

export function SectionHeading({
  kicker,
  title,
  lead,
  align = "center",
  className,
  as: Tag = "h2",
  id,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  className?: string;
  as?: "h1" | "h2";
  id?: string;
}) {
  return (
    <header className={cn("max-w-[640px]", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      <Kicker>{kicker}</Kicker>
      <Tag id={id} className="section-title mt-4 text-balance">
        {title}
      </Tag>
      {lead && <p className="lead mt-4 text-pretty">{lead}</p>}
    </header>
  );
}

export function Stars({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-oro", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
          <path d="M10 1.8l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L10 14.2 5 17l1.2-5.6L2 7.6l5.6-.6z" />
        </svg>
      ))}
    </span>
  );
}
