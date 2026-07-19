# BioVolt AI MFC Calculator - Phase 2 Evidence Review

Status: complete for the current literature set  
Review date: 2026-07-19  
Machine-readable decision file: `benchmark-adjudication.json`

## Outcome

Phase 2 clears the measured-input formula calculator for implementation. It does **not** clear a pooled literature estimate or a machine-learning prediction.

The current evidence can responsibly support:

- exact calculations from loaded voltage, measured current, resistance, electrode area, COD values and duration;
- cited single-study literature references;
- low-tier comparison with the two public halophile-acetate conditions in BV-LIT-011;
- target-specific COD references from BV-LIT-009, BV-LIT-011 and BV-LIT-012;
- explicit refusal when a user requests a confidence interval or prediction that the evidence cannot support.

It cannot yet support:

- a pooled power-density range;
- a pooled COD-removal range across unlike reactors, substrates or circuit modes;
- a confidence interval;
- a recommendation optimizer trained on the current rows;
- any claim that the calculator is already an AI model.

## Gate decisions

| Capability | Decision | Reason |
|---|---|---|
| Measured formula calculator | GO | Physical equations do not require literature fitting and are covered by Phase 1 validation cases. |
| Cited single-study references | GO WITH LIMITS | References must show the condition ID, paper, target, load mode, normalization basis and warnings. |
| Power-density similarity matching | LIMITED GO | Only BV-LIT-011-20 and BV-LIT-011-40 pass the current power-matching gate, and both come from one paper. |
| COD-removal similarity matching | LIMITED GO | Eight condition rows may support references, but matching must preserve organism, substrate, duration and circuit mode. |
| Pooled literature estimate | NO GO | No target domain has enough independent, sufficiently comparable papers. |
| Confidence interval | NO GO | Repeated conditions within a paper are not independent studies. |
| Machine-learning prediction | NO GO | Sixteen heterogeneous condition rows are insufficient for a defensible model. |

## Condition-level results

### BV-LIT-009 - Pseudomonas sugars

The 100-ohm glucose, fructose and sucrose rows remain valid as reported, cited results. Their COD-removal values may be used as single-study references. Their power values are held out of similarity matching because the normalization basis is not explicit.

For glucose, `V = 0.202 V` and `R = 100 ohm` imply `P = 0.408 mW`. The reported `136 mW/m2` and `673 mA/m2` imply an area of approximately `30 cm2`, which is consistent with counting both faces of a `3 x 5 cm` electrode. This is a useful reconciliation clue, but BioVolt AI will not convert it into a verified area unless the source explicitly confirms the convention.

The sucrose current-density value remains excluded because it conflicts strongly with the voltage, resistance and plausible electrode area. The glucose polarization maximum stays separate from the steady 100-ohm condition.

Citation: Ali et al. (2017), https://doi.org/10.15171/ijb.1608

### BV-LIT-011 - public halophile-acetate conditions

The 20 and 40 g/L salinity conditions are the strongest current calculator references. The paper reports the cathode projected area and identifies peak power at 100 ohm. These rows may enter low-tier power and COD similarity matching.

The current-density maximum belongs to 5 ohm and must not be paired with the 100-ohm voltage or peak-power values. The two salinity conditions come from one study with duplicate reactors; they support a reference, not an independent-study interval or extrapolated salinity curve.

Citation: Vijay, Ghosh and Mukherji (2023), https://doi.org/10.3390/en16020877

### BV-LIT-010 - privately reviewed halophile-starch conditions

The four salinity conditions may be displayed as cited reported results, but they remain outside similarity matching until two source-level questions are resolved:

1. whether the starch statement represents 12 g/L or 12 g in the stated anolyte volume;
2. the exact load point and normalization basis associated with each reported peak power and current density.

The calculator may expose the DOI and derived measurements. It must not host or redistribute the supplied PDF.

Citation: Vijay, Ghosh and Mukherji (2018), https://doi.org/10.1016/j.biortech.2018.02.044

### BV-LIT-012 - COD treatment modes

The 1000-ohm MFC, short-circuit MFC and microbial electrochemical snorkel rows may be shown as separate COD-treatment references. The short-circuit and snorkel results must never be recommended as electricity-producing optima because they do not provide harvestable external power.

Raw COD removal and background-adjusted interpretation must remain distinct. Duration and initial-COD context are required in the result card.

Citation: Erable, Etcheverry and Bergel (2011), https://doi.org/10.1080/08927014.2011.564615

### Context-only rows

BV-LIT-007 supports electrode-modification context but its open-circuit potential is not loaded voltage. BV-LIT-008 supports strain and substrate feature design, but its current-density conversion requires correction before numerical reuse. BV-SUP-001 supports fouling and pH-decline feature design, while its combined `W m-2 kg-1` normalization prevents comparison with conventional `mW/m2` rows.

## Calculator behavior fixed by Phase 2

1. The formula result always appears before literature evidence.
2. A single study is labelled **Literature reference**, never **Literature estimate**.
3. The interface will refuse a confidence interval for the current evidence set.
4. Every literature value carries its condition ID, DOI, target-specific eligibility, normalization basis and warning codes.
5. Open-circuit voltage is displayed separately and never enters `I = V/R`.
6. Short-circuit and MES treatment rows cannot enter the electricity recommendation path.
7. PDF 11 contributes citations and derived facts only; the file is not published.

## Data needed to unlock a real literature estimate

The next extraction pass should prioritize primary studies that report all of the following together:

- loaded voltage with the exact external resistance;
- measured current or enough information to verify `I = V/R`;
- exposed electrode area and an explicit normalization basis;
- reactor architecture, working volume and operation mode;
- organism or community, inoculum source and mediator status;
- substrate identity and concentration;
- temperature, pH, salinity and/or conductivity;
- COD before and after treatment plus duration or HRT;
- replicate count and uncertainty;
- polarization data with resistance-specific points.

For each target domain, BioVolt AI should seek at least three independent papers and five eligible conditions before presenting a supported range. A trained model should wait for a substantially larger, diverse and externally validated dataset.

## Phase 3 handoff

Phase 3 can now build the premium client-side formula calculator and the evidence-label system. Literature matching should initially return only:

- a cited single-study reference;
- a limitations message;
- or an outside-domain refusal.

Pooled estimates, confidence intervals, optimization and trained predictions remain disabled by the machine-readable gate.
