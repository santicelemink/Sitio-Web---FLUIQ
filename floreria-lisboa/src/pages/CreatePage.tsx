import { Configurator } from "@/components/configurator/Configurator";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function CreatePage() {
  useDocumentTitle("Creá tu ramo");
  return <Configurator variant="page" />;
}
