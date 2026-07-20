export type ConcentrationEvidence = {
  match: "strong" | "eligible" | "partial" | "outside";
  headline: string;
  message: string;
  benchmark: string;
  sourceUrl: string;
};

const sourceUrl = "https://pmc.ncbi.nlm.nih.gov/articles/PMC5903908/";

export function interpretSubstrateConcentration({
  organism,
  substrate,
  concentrationGL,
  reactorArchitecture,
}: {
  organism: string;
  substrate: string;
  concentrationGL: number | null;
  reactorArchitecture: string;
}): ConcentrationEvidence {
  const outside: ConcentrationEvidence = {
    match: "outside",
    headline: "No eligible concentration relationship",
    message: "The selected organism, substrate or reactor is outside the audited Pseudomonas aeruginosa dual-chamber study. Concentration is recorded but does not alter the electrical result.",
    benchmark: "Not available",
    sourceUrl,
  };
  if (organism !== "pseudomonas aeruginosa" || reactorArchitecture !== "double_chamber" || !["glucose", "fructose", "sucrose"].includes(substrate)) return outside;

  const benchmarks: Record<string, string> = {
    glucose: "136 ± 87 mW/m² at 3 g/L",
    fructose: "3.6 ± 1.6 mW/m² study maximum",
    sucrose: "8.606 mW/m² study maximum",
  };
  if (concentrationGL === null || !Number.isFinite(concentrationGL) || concentrationGL <= 0) {
    return { ...outside, match: "partial", headline: "Concentration required for study matching", message: "Enter substrate concentration to compare it with the audited study envelope.", benchmark: benchmarks[substrate] };
  }
  if (substrate === "glucose") {
    if (concentrationGL >= 1 && concentrationGL < 3) return {
      match: "eligible",
      headline: "Within the reported rising region",
      message: "The study observed increasing voltage from 1 to 3 g/L glucose. The publication does not support a universal numerical multiplier, so this changes evidence interpretation—not measured V/R output.",
      benchmark: benchmarks.glucose,
      sourceUrl,
    };
    if (Math.abs(concentrationGL - 3) < 0.05) return {
      match: "strong",
      headline: "Matches the reported glucose optimum",
      message: "The study reported its glucose maximum at 3 g/L. The value remains a comparator for the study configuration, not a replacement for your measurement or resistance-model result.",
      benchmark: benchmarks.glucose,
      sourceUrl,
    };
    if (concentrationGL > 3 && concentrationGL <= 5) return {
      match: "eligible",
      headline: "Within the reported inhibition / plateau region",
      message: "Above 3 g/L the study reported that energy generation no longer increased and could decline. A numerical penalty is not invented without replicated point data.",
      benchmark: benchmarks.glucose,
      sourceUrl,
    };
    return { ...outside, match: "partial", headline: "Outside the reported 1–5 g/L envelope", message: "Extrapolation is disabled. A matched concentration experiment is required before treating this input as predictive.", benchmark: benchmarks.glucose };
  }
  return {
    match: "eligible",
    headline: `Eligible ${substrate} study context`,
    message: `The study reported increasing output followed by a plateau for ${substrate}, but it does not provide enough validated points for a defensible concentration-to-power equation. The maximum is shown only as a comparator.`,
    benchmark: benchmarks[substrate],
    sourceUrl,
  };
}
