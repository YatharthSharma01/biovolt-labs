import type { Metadata } from "next";
import { ExperimentView } from "../BioVoltExperience";

export const metadata: Metadata = {
  title: "College experiment",
  description: "Yatharth Sharma's recovered microbial fuel-cell experimental record.",
};

export default function ExperimentPage() {
  return <ExperimentView />;
}
