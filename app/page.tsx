import type { Metadata } from "next";
import { HomeView } from "./BioVoltExperience";

export const metadata: Metadata = {
  title: "BioVolt Labs | From microbial metabolism to measurable electricity",
  description:
    "Explore microbial fuel-cell evidence, Yatharth Sharma's laboratory experiment, and the first BioVolt Labs digital-twin preview.",
};

export default function Home() {
  return <HomeView />;
}
