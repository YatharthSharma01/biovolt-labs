# BioVolt AI

BioVolt AI is an interactive microbial fuel cell (MFC) research platform. The
current public release connects Yatharth Sharma's historical college experiment,
a citation-ready evidence library and a clearly labelled digital-twin
demonstration.

## Current capabilities

- Full-viewport animated double-chamber MFC cover
- Animated electron and proton pathways
- Connected Home, Research, Experiment, Digital Twin and About pages
- Research-paper-inspired editorial design and figure system
- Researcher-authored MFC introduction with preserved citation keys
- Literature register with 12 core MFC papers and 2 supporting records, including a COD-removal benchmark study
- Historical apparatus and electrode documentation
- Pseudomonas growth-curve visualization
- Research-paper evidence cards with verification status
- Illustrative operating-condition simulator
- Explicit provenance labels for measured, documented, image-derived and
  synthetic values
- Responsive and reduced-motion-friendly interface

The digital-twin outputs in this release are illustrative. They are not trained
predictions and must not be used to operate an MFC.

## MFC calculator development

Phase 1 defines the calculator's scientific and usability contract. Phase 2
audits every condition-level literature row and prevents unsupported estimates
from entering the public calculator:

- [Scientific specification](docs/calculator/SCIENTIFIC_SPECIFICATION.md)
- [Machine-readable input schema](docs/calculator/calculator-input-schema.json)
- [Validation and refusal cases](docs/calculator/validation-cases.json)
- [Phase 2 evidence review](docs/calculator/PHASE_2_EVIDENCE_REVIEW.md)
- [Machine-readable benchmark decisions](docs/calculator/benchmark-adjudication.json)
- [Phase 2 evidence-gate workbook](docs/calculator/BioVolt_AI_Phase_2_Evidence_Gate.xlsx)

The Phase 2 decision is **go** for the measured formula calculator and cited
single-study references. Pooled estimates, confidence intervals and trained AI
predictions remain disabled until sufficiently comparable independent studies
are available.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Create the static GitHub Pages edition:

```bash
npm run build:pages
npm run test:pages
```

## Project direction

The planned intelligence layer will add power-density and COD-removal
prediction, anomaly detection, fouling alerts, confidence intervals, feature
importance and evidence-bounded experiment recommendations. Those models will
only be activated after sufficient experimental data and grouped validation are
available.

## Evidence policy

Every displayed value retains its source and confidence status. Literature
measurements remain separate from researcher-generated experiment records and
are not treated as interchangeable model-training rows.

## Author

Historical experimental work: [Yatharth Sharma](https://www.linkedin.com/in/yatharth-sharma-a13395288/).
