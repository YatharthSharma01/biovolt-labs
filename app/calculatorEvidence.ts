import adjudication from "../docs/calculator/benchmark-adjudication.json" with { type: "json" };
import { auditRows } from "./literatureAudit.ts";
import type { LoadMode } from "./calculatorEngine.ts";

export type EvidenceInputs = {
  organism: string;
  substrate: string;
  anodeMaterial: string;
  cathodeMaterial: string;
  reactorArchitecture: string;
  loadMode: LoadMode;
  externalResistanceOhm: number | null;
  salinityGL: number | null;
  temperatureC: number | null;
  ph: number | null;
};

export type EvidenceReference = {
  target: "power" | "cod";
  conditionId: string;
  paperRecord: string;
  sourceUrl: string;
  score: number;
  tier: "low" | "outside_domain";
  value: number | null;
  unit: string;
  voltageV: number | null;
  openCircuitVoltageV: number | null;
  resistanceOhm: number | null;
  normalizationBasis: string;
  warnings: string[];
  message: string;
};

type Decision = (typeof adjudication.decisions)[number];
const decisionById = new Map<string, Decision>(
  adjudication.decisions.map((decision) => [decision.conditionId, decision]),
);

const text = (value: string) => value.toLowerCase().replace(/[–—]/g, "-");

function categoricalMatch(selected: string, source: string, field: "reactor" | "generic") {
  if (!selected) return null;
  const normalizedSource = text(source);
  if (field === "reactor") {
    if (selected === "double_chamber") return normalizedSource.includes("dual chamber") || normalizedSource.includes("double chamber") || normalizedSource.includes("two 500 ml bottles");
    if (selected === "single_chamber") return normalizedSource.includes("single chamber");
  }
  return normalizedSource.includes(text(selected));
}

function numericSimilarity(userValue: number | null, sourceValue: number | null, kind: "linear" | "resistance", scale: number) {
  if (userValue === null || sourceValue === null || !Number.isFinite(userValue) || !Number.isFinite(sourceValue)) return null;
  if (kind === "resistance") {
    if (userValue <= 0 || sourceValue <= 0) return userValue === sourceValue ? 1 : 0;
    return Math.exp(-Math.abs(Math.log(userValue / sourceValue)) / scale);
  }
  return Math.exp(-Math.abs(userValue - sourceValue) / scale);
}

const configuredWeight = (inputs: EvidenceInputs, key: keyof EvidenceInputs) => {
  const value = inputs[key];
  return value !== "" && value !== null;
};

function scoreRow(inputs: EvidenceInputs, row: (typeof auditRows)[number], target: "power" | "cod") {
  const weights = target === "power"
    ? { reactor: 10, organism: 12, substrate: 12, anode: 10, cathode: 8, resistance: 14, salinity: 10, temperature: 5, ph: 5 }
    : { reactor: 8, organism: 12, substrate: 14, anode: 5, cathode: 3, resistance: 5, salinity: 8, temperature: 6, ph: 6 };

  const comparisons: Array<[number, boolean | number | null, boolean]> = [
    [weights.reactor, categoricalMatch(inputs.reactorArchitecture, row.reactor, "reactor"), configuredWeight(inputs, "reactorArchitecture")],
    [weights.organism, categoricalMatch(inputs.organism, row.microbe, "generic"), configuredWeight(inputs, "organism")],
    [weights.substrate, categoricalMatch(inputs.substrate, row.substrate, "generic"), configuredWeight(inputs, "substrate")],
    [weights.anode, categoricalMatch(inputs.anodeMaterial, row.anode, "generic"), configuredWeight(inputs, "anodeMaterial")],
    [weights.cathode, categoricalMatch(inputs.cathodeMaterial, row.cathode, "generic"), configuredWeight(inputs, "cathodeMaterial")],
    [weights.resistance, numericSimilarity(inputs.externalResistanceOhm, row.externalResistanceOhm, "resistance", 0.8), configuredWeight(inputs, "externalResistanceOhm")],
    [weights.salinity, numericSimilarity(inputs.salinityGL, row.salinityG_L, "linear", 20), configuredWeight(inputs, "salinityGL")],
    [weights.temperature, numericSimilarity(inputs.temperatureC, row.temperatureC, "linear", 10), configuredWeight(inputs, "temperatureC")],
    [weights.ph, numericSimilarity(inputs.ph, row.ph, "linear", 2), configuredWeight(inputs, "ph")],
  ];

  const maxWeight = comparisons.reduce((sum, [weight]) => sum + weight, 0);
  const providedWeight = comparisons.reduce((sum, [weight, , provided]) => sum + (provided ? weight : 0), 0);
  const comparable = comparisons.filter(([, result, provided]) => provided && result !== null);
  const comparableWeight = comparable.reduce((sum, [weight]) => sum + weight, 0);
  const matchedWeight = comparable.reduce((sum, [weight, result]) => sum + weight * (typeof result === "number" ? result : result ? 1 : 0), 0);
  const completeness = providedWeight / maxWeight;
  const comparability = comparableWeight / maxWeight;
  const similarity = comparableWeight > 0 ? matchedWeight / comparableWeight : 0;
  return { score: similarity * Math.min(1, completeness / 0.75), completeness, comparability };
}

function loadModeMatches(inputs: EvidenceInputs, conditionId: string, resistance: number | null) {
  if (conditionId === "BV-LIT-012-MES") return false;
  if (inputs.loadMode === "short_circuit") return conditionId === "BV-LIT-012-SHORT";
  if (inputs.loadMode === "open_circuit") return false;
  return resistance !== null && resistance > 0;
}

export function findEvidenceReference(inputs: EvidenceInputs, target: "power" | "cod"): EvidenceReference {
  const eligible = auditRows
    .map((row) => ({ row, decision: decisionById.get(row.conditionId) }))
    .filter(({ row, decision }) => {
      if (!decision || !loadModeMatches(inputs, row.conditionId, row.externalResistanceOhm)) return false;
      if (target === "power") return decision.powerSimilarity && row.powerDensityMwM2 !== null;
      return decision.codSimilarity && row.codRemovalPercent !== null;
    })
    .map(({ row, decision }) => ({ row, decision: decision!, ...scoreRow(inputs, row, target) }))
    .sort((a, b) => b.score - a.score);

  const best = eligible[0];
  if (!best || best.completeness < 0.5 || best.comparability < 0.5 || best.score < 0.45) {
    return {
      target,
      conditionId: "",
      paperRecord: "",
      sourceUrl: "",
      score: best?.score ?? 0,
      tier: "outside_domain",
      value: null,
      unit: target === "power" ? "mW/m²" : "%",
      voltageV: null,
      openCircuitVoltageV: null,
      resistanceOhm: null,
      normalizationBasis: "",
      warnings: ["OUTSIDE_EVIDENCE_DOMAIN", "INSUFFICIENT_INDEPENDENT_STUDIES"],
      message: "No responsible numerical reference is available for this configuration. Add more comparable conditions or use the measured formula path.",
    };
  }

  return {
    target,
    conditionId: best.row.conditionId,
    paperRecord: best.row.paperRecord,
    sourceUrl: best.decision.sourceUrl,
    score: best.score,
    tier: "low",
    value: target === "power" ? best.row.powerDensityMwM2 : best.row.codRemovalPercent,
    unit: target === "power" ? "mW/m²" : "%",
    voltageV: best.row.voltageV,
    openCircuitVoltageV: best.row.openCircuitVoltageV,
    resistanceOhm: best.row.externalResistanceOhm,
    normalizationBasis: best.decision.normalizationBasis,
    warnings: Array.from(new Set([...best.decision.warnings, "SINGLE_STUDY_REFERENCE"])),
    message: "Closest audited condition. This is a cited single-study reference, not a prediction or confidence interval.",
  };
}
