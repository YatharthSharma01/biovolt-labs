import type { Metadata } from "next";
import { AboutView } from "../BioVoltExperience";

export const metadata: Metadata = {
  title: "About the project",
  description: "The evidence policy and development roadmap behind BioVolt AI.",
};

export default function AboutPage() {
  return <AboutView />;
}
