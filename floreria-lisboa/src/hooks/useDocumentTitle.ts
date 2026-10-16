import { useEffect } from "react";

const BASE = "Florería Lisboa · Flores a domicilio en Buenos Aires";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Florería Lisboa` : BASE;
  }, [title]);
}
