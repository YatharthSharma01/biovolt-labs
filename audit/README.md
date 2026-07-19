# BioVolt AI literature audit

This is the evidence-preparation stage for the future MFC estimator. It is not a trained model and it does not assign hidden biological multipliers.

## What is included

- `audit/Literature_Audit.xlsx` is the reviewable condition-level workbook.
- `app/literatureAudit.ts` is the retained typed evidence source for calculator preparation; it is not displayed on the public site.
- The paper register remains in `app/researchData.ts` and contains 12 core records plus 2 supporting records.

One paper can create several rows when it compares substrates, salinities, resistances or reactor modes. A missing value is left blank rather than inferred.

## Evidence rules

1. Reported values retain the source paper's normalization basis.
2. Open-circuit voltage is never treated as loaded voltage.
3. Current density and power density are not pooled when their resistance points differ.
4. Geometric, projected and specific surface areas are kept distinct.
5. Review-paper maxima are context only; they are not independent training observations.
6. PDF 11 was reviewed privately and is represented only by derived fields and citations. The PDF is not redistributed.
7. PDF 3 was a publisher security page. Its supporting record is metadata/abstract-level only.

## Quality flags

Rows marked `Do not pool` or `Context only` should not enter a numerical model. Rows marked `Calculator benchmark` can support a nearest-evidence estimate only when the reactor, load, normalization and biological context are sufficiently similar.

## Calculator specification gate

Phase 2 reviewed all 16 condition rows. The decisions are recorded in
`docs/calculator/benchmark-adjudication.json`, explained in
`docs/calculator/PHASE_2_EVIDENCE_REVIEW.md`, and summarized in the reviewable
`docs/calculator/BioVolt_AI_Phase_2_Evidence_Gate.xlsx` workbook.

The measured formula calculator may proceed. Two BV-LIT-011 conditions may
support low-tier power references and eight conditions may support
target-specific COD references. No current domain is cleared for a pooled
estimate, confidence interval or trained prediction. Electrode-area basis in
BV-LIT-009, starch concentration and load points in private BV-LIT-010, and the
BV-LIT-008 current-density conversion remain explicit open issues.
