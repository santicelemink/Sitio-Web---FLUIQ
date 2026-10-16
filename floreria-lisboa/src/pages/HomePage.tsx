import { Configurator } from "@/components/configurator/Configurator";
import { BusinessGains } from "@/components/pitch/BusinessGains";
import { PitchNote } from "@/components/pitch/PitchNote";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Benefits } from "@/sections/Benefits";
import { Collection } from "@/sections/Collection";
import { Faq } from "@/sections/Faq";
import { Hero } from "@/sections/Hero";
import { Reviews } from "@/sections/Reviews";
import { Subscription } from "@/sections/Subscription";

export function HomePage() {
  useDocumentTitle();
  return (
    <>
      <div className="container">
        <PitchNote n={1} className="mx-auto mt-6 max-w-[620px]" />
      </div>
      <Hero />
      <Benefits />
      <Configurator />
      <Collection />
      <Subscription />
      <Reviews />
      <Faq />
      <BusinessGains />
    </>
  );
}
