import type { Metadata } from "next";
import { RegistryView } from "../BioVoltExperience";

export const metadata: Metadata = {
  title: "Experiment registry",
  description: "A provenance-aware MFC experiment data-entry and COD evidence workspace.",
};

export default function RegistryPage() {
  return <RegistryView />;
}

