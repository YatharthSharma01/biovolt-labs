import type { Metadata } from "next";
import { BioVoltExperience } from "./BioVoltExperience";

export const metadata: Metadata = {
  title: "BioVolt AI | From microbial metabolism to measurable electricity",
  description:
    "Explore microbial fuel-cell evidence, Yatharth Sharma's historical experiment, and the first BioVolt AI digital-twin preview.",
};

export default function Home() {
  return <BioVoltExperience />;
}
