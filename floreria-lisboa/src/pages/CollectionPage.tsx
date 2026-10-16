import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Collection } from "@/sections/Collection";

export function CollectionPage() {
  useDocumentTitle("Colección");
  return <Collection asPage />;
}
