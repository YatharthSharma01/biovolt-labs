import type { Metadata } from "next";
import { DigitalTwinView } from "../BioVoltExperience";

export const metadata: Metadata = {
  title: "Digital twin",
  description: "An explainable microbial fuel-cell digital-twin interface preview.",
};

export default function DigitalTwinPage() {
  return <DigitalTwinView />;
}
