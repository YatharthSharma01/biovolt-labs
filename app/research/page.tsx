import type { Metadata } from "next";
import { ResearchView } from "../BioVoltExperience";

export const metadata: Metadata = {
  title: "Research library",
  description: "A structured microbial fuel-cell literature register for BioVolt AI.",
};

export default function ResearchPage() {
  return <ResearchView />;
}
