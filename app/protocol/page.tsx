import type { Metadata } from "next";
import { ProtocolView } from "../BioVoltExperience";

export const metadata: Metadata = {
  title: "Pseudomonas MFC protocol",
  description: "A literature-backed, measurement-first protocol for a standardized Pseudomonas microbial fuel-cell pilot.",
};

export default function ProtocolPage() {
  return <ProtocolView />;
}
