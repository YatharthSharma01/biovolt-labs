import type { Metadata } from "next";
import { CalculatorView } from "../MfcCalculator";

export const metadata: Metadata = {
  title: "MFC calculator",
  description: "Calculate microbial fuel-cell electricity and COD removal from measurements, with evidence-gated literature comparison.",
};

export default function CalculatorPage() {
  return <CalculatorView />;
}
