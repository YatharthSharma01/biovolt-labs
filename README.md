# BioVolt AI

BioVolt AI is an interactive microbial fuel cell (MFC) research platform. The
current public release connects Yatharth Sharma's historical college experiment,
a citation-ready evidence library and a clearly labelled digital-twin
demonstration.

## Current capabilities

- Full-viewport animated double-chamber MFC cover
- Animated electron and proton pathways
- Connected Home, Research, Experiment, Registry, Digital Twin and About pages
- Research-paper-inspired editorial design and figure system
- Researcher-authored MFC introduction with preserved citation keys
- Literature register with 12 core MFC papers and 2 supporting records, including a COD-removal benchmark study
- Provenance-aware experiment registry with a FastAPI + SQLite backend and public CSV preparation form
- Historical apparatus and electrode documentation
- Pseudomonas growth-curve visualization
- Research-paper evidence cards with verification status
- Illustrative operating-condition simulator
- Explicit provenance labels for measured, documented, image-derived and
  synthetic values
- Responsive and reduced-motion-friendly interface

The digital-twin outputs in this release are illustrative. They are not trained
predictions and must not be used to operate an MFC.

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
