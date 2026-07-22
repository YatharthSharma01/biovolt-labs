# Literature-backed MFC monitoring protocol

## Decision

The previous college MFC experiment was incomplete and did not retain a voltage time series. A 72-hour test duration must therefore not be shown as a completed condition or as a universal standard.

BioVolt Labs now treats monitoring duration as a protocol choice tied to the scientific objective and reactor configuration.

## Timing evidence from the supplied papers

| Profile | Electrical monitoring | Experimental window | Chemistry and supporting measurements | Source |
| --- | --- | --- | --- | --- |
| Pseudomonas sugar response | Voltage every hour; polarization after stable voltage | 21-day biofilm development; batch responses reported over approximately 24-49 h | Initial/final COD and BOD5; substrate identity and concentration | Ali et al. (2017), supplied PDF 1, pp. 3-4; https://doi.org/10.15171/ijb.1608 |
| Halophile salinity and denitrification | Voltage/current acquired regularly; exact interval not reported | 9-day open-circuit start-up followed by seven 4-day fed-batch cycles | pH, conductivity, salinity, TDS, COD, nitrate; polarization in final cycle | Vijay et al. (2023), supplied PDF 2, pp. 3-9; https://doi.org/10.3390/en16020877 |
| Sambhar starch and salinity | Voltage/current measured at different intervals; exact interval not reported | First 4 days open circuit, followed by seven 5-day fed-batch cycles | pH, conductivity, salinity, TDS, turbidity, starch, amylase and ammonium; detailed analysis in cycle 6 or 7 | Vijay et al. (2018), supplied PDF 11, pp. 2-3; https://doi.org/10.1016/j.biortech.2018.02.044 |
| Cathode durability and fouling | Microcontroller output; 12-step polarization | Three 15-day cycles; repeated 24 h OCV, 24 h at 1,000 ohm, polarization, 24 h at maximum power and OCV stabilization | Daily pH | Nastro et al. (2021), supplied PDF 7, p. 5; https://doi.org/10.3390/pr9111941 |
| COD-treatment comparison | Polarization after 15 min stabilization; COD endpoint after 24 h | Three successive 24 h batches; separate periodic monitoring over about 4-5 days | Duplicate COD with electrode-free control | Erable et al. (2011), supplied COD-removal PDF, pp. 4-8; https://doi.org/10.1080/08927014.2011.564615 |

## Proposed BioVolt measurement contract

This is a traceable combination of measurement practices, not a claim that one paper used the complete combined protocol.

1. Select the scientific objective before selecting the timeline: short substrate response, halophile acclimation, durability/fouling or COD treatment.
2. Keep start-up OCV separate from loaded operation and define a stabilization criterion before the experiment.
3. Use hourly electrical logging for short Pseudomonas or sugar-response batches. For longer fed-batch studies, automate electrical logging and label every cycle and feed event.
4. Record temperature, pH, conductivity and salinity at least daily in multi-day experiments.
5. Pair initial and final COD within each treatment window. Add intermediate COD samples only when sampling volume and disturbance are controlled.
6. Perform polarization only after stable output. Store each resistance step as a separate observation after stabilization.
7. Use independent reactors where possible, retain controls, and never merge OCV, loaded, short-circuit and treatment-only states.

## Evidence boundary

- The exact logging interval in Vijay et al. (2018) and Vijay et al. (2023) was not reported; BioVolt Labs keeps it marked as unspecified.
- The Sambhar paper is biologically closest to the college project, but the electrodes, separator and catholyte differ.
- No uploaded paper establishes 72 hours as a universal MFC duration.
- A future experiment record must state which profile was followed and any deviations.
