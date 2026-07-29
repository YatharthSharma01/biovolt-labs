export type CalculatorValidationCase = {
  id: string;
  category: "Equation control" | "Reconciliation guardrail" | "Evidence retrieval" | "Domain refusal";
  status: "Passed" | "Guardrail passed" | "Refusal passed";
  inputs: string;
  expected: string;
  observed: string;
  sourceLabel: string;
  sourceUrl?: string;
};

export const calculatorValidationCases: CalculatorValidationCase[] = [
  {
    id: "CALC-EXACT-001",
    category: "Equation control",
    status: "Passed",
    inputs: "0.500 V loaded voltage; 1,000 Ω; 25 cm² anode area; COD 1,000 → 400 mg/L; 24 h",
    expected: "0.500 mA; 0.250 mW; 100.000 mW/m²; 60.0% COD removal; 6.000 mWh",
    observed: "The calculator reproduces every expected value at machine precision.",
    sourceLabel: "Independent arithmetic fixture",
  },
  {
    id: "CALC-RECONCILE-002",
    category: "Reconciliation guardrail",
    status: "Guardrail passed",
    inputs: "Ali et al. glucose condition: 0.202 V at 100 Ω; reported 136 mW/m² and 673 mA/m²",
    expected: "Preserve the publication values, expose the area-normalization conflict and exclude the row from deterministic fitting.",
    observed: "The evidence gate retains the cited values but does not treat the implicit area basis as verified.",
    sourceLabel: "Ali et al. (2017)",
    sourceUrl: "https://doi.org/10.15171/ijb.1608",
  },
  {
    id: "CALC-EVIDENCE-003",
    category: "Evidence retrieval",
    status: "Passed",
    inputs: "Halophilic enrichment; sodium acetate; dual chamber; 40 g/L NaCl; 37 °C; pH 7; 100 Ω",
    expected: "Return BV-LIT-011-40 as a single-study reference: 162.09 ± 3 mW/m², not a calculated result or interval.",
    observed: "The calculator returns the correct condition, DOI, normalization basis and single-study warning.",
    sourceLabel: "Vijay, Ghosh & Mukherji (2023)",
    sourceUrl: "https://doi.org/10.3390/en16020877",
  },
  {
    id: "CALC-DOMAIN-004",
    category: "Domain refusal",
    status: "Refusal passed",
    inputs: "Unrepresented high-temperature algal biocathode / graphene-aerogel configuration",
    expected: "No numerical literature estimate; return OUTSIDE_EVIDENCE_DOMAIN.",
    observed: "The calculator refuses the estimate instead of extrapolating from unrelated MFCs.",
    sourceLabel: "BioVolt Labs evidence-gate fixture",
  },
];
