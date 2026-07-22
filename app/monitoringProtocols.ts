export type MonitoringProtocol = {
  id: string;
  shortLabel: string;
  title: string;
  bestFor: string;
  timeline: string;
  electrical: string;
  chemistry: string;
  loadPlan: string;
  replication: string;
  boundary: string;
  source: string;
  sourceFile: string;
  doi: string;
};

/**
 * Monitoring details are transcribed from the supplied papers. When a paper
 * says "regularly" or "at different intervals" without defining the interval,
 * that uncertainty is retained instead of silently inventing a schedule.
 */
export const monitoringProtocols: MonitoringProtocol[] = [
  {
    id: "ALI-2017-HOURLY",
    shortLabel: "Hourly sugar batch",
    title: "Pseudomonas sugar-response profile",
    bestFor: "Short batch tests comparing glucose, fructose or sucrose with Pseudomonas aeruginosa.",
    timeline: "A 21-day anode-biofilm stage preceded batch operation. The medium was refreshed every 3 days. Published voltage responses extended from 24 to about 49 h after feeding or reloading.",
    electrical: "Voltage was measured every hour. Current was calculated from loaded voltage at 100 ohm. Polarization readings were taken only after voltage stabilized at each resistance.",
    chemistry: "Initial and final COD and BOD5 were paired with substrate identity and concentration.",
    loadPlan: "100 ohm operating load; 20-80,000 ohm polarization range.",
    replication: "Each experiment was conducted in duplicate.",
    boundary: "The paper reports normalization inconsistencies, so its voltage schedule is usable as a monitoring pattern but its reported density values require reconciliation before model training.",
    source: "Ali et al. (2017), Iranian Journal of Biotechnology 15(4), e1608",
    sourceFile: "PDF 1.pdf, methods pp. 3-4",
    doi: "https://doi.org/10.15171/ijb.1608",
  },
  {
    id: "VIJAY-2023-4DAY",
    shortLabel: "4-day halophile cycles",
    title: "Halophilic salinity and denitrification profile",
    bestFor: "Halophilic acetate-fed MFCs comparing salinity, COD removal and nitrate removal.",
    timeline: "The reactors remained open circuit for the first 9 days, then ran for seven 4-day fed-batch cycles. Media and substrate were replaced when voltage fell to 40 mV.",
    electrical: "Voltage and current were acquired regularly by a data-acquisition system; the paper does not state the logging interval. Polarization was performed in the final cycle after stable readings.",
    chemistry: "Conductivity, salinity, TDS and pH were measured; COD and nitrate were followed by cycle. OCV and 100-ohm operating voltage were kept separate.",
    loadPlan: "100 ohm operating load; 50,000-5 ohm polarization range.",
    replication: "Two salinity conditions were operated in duplicate with simultaneous abiotic controls.",
    boundary: "The observed 9-day stabilization is study-specific, not a universal start-up requirement. The electrical logging interval is unspecified.",
    source: "Vijay, Ghosh & Mukherji (2023), Energies 16, 877",
    sourceFile: "PDF 2.pdf, methods pp. 3-4; results pp. 5-9",
    doi: "https://doi.org/10.3390/en16020877",
  },
  {
    id: "VIJAY-2018-5DAY",
    shortLabel: "5-day Sambhar cycles",
    title: "Sambhar Lake starch and salinity profile",
    bestFor: "The closest literature analogue to the previous Sambhar Lake halophile work.",
    timeline: "The MFCs were open circuit for the first 4 days and then operated at 100 ohm for seven 5-day fed-batch cycles. Fresh substrate was added after each cycle; detailed electrochemistry was performed in cycle 6 or 7.",
    electrical: "Voltage and current were measured at different intervals, but the exact interval was not reported. Polarization readings were recorded after stable potential and current were achieved.",
    chemistry: "Conductivity, salinity, TDS, turbidity, pH, starch degradation, amylase and ammonium were monitored.",
    loadPlan: "100 ohm operating load; 50,000-5 ohm polarization range.",
    replication: "Three MFCs were operated at every salinity condition with simultaneous abiotic controls.",
    boundary: "This is the closest biological analogue, but its stainless-steel anode, Nafion membrane, graphite-felt cathode and nitrate biocathode differ from the college graphite-rod and salt-bridge reactor.",
    source: "Vijay et al. (2018), Bioresource Technology 256, 391-398",
    sourceFile: "PDF 11.pdf, methods pp. 2-3; privately reviewed and not redistributed",
    doi: "https://doi.org/10.1016/j.biortech.2018.02.044",
  },
  {
    id: "NASTRO-2021-DAILY",
    shortLabel: "15-day durability",
    title: "Daily cathode durability and fouling profile",
    bestFor: "Longer solid-feed tests focused on pH decline, cathode reuse and fouling.",
    timeline: "Each run lasted 15 days and three measurement cycles were completed. The electrochemical sequence repeated 24 h OCV, 24 h at 1,000 ohm, polarization, 24 h at maximum power, then OCV until stabilization.",
    electrical: "Electric output was collected using a microcontroller. Polarization used 12 resistance steps from 100,000 to 100 ohm.",
    chemistry: "Daily measurements included pH, which was adjusted to 7.0 +/- 0.2 when needed.",
    loadPlan: "OCV-POL-maximum-power sequence; 1,000 ohm preliminary load.",
    replication: "MFCs were run in duplicate; three cycles were completed for each experimental activity.",
    boundary: "This solid-feed, air-cathode system is useful for durability monitoring but its unusual power normalization is not directly comparable with conventional mW/m2 records.",
    source: "Nastro et al. (2021), Processes 9, 1941",
    sourceFile: "PDF 7.pdf, methods p. 5",
    doi: "https://doi.org/10.3390/pr9111941",
  },
  {
    id: "ERABLE-2011-COD24",
    shortLabel: "24-hour COD endpoint",
    title: "COD-treatment comparison profile",
    bestFor: "Treatment-focused comparisons where COD removal is the primary endpoint.",
    timeline: "COD was compared after 24 h in three successive batches. Separate longer short-circuit batches were followed periodically until the discharge target was reached in about 4-5 days.",
    electrical: "Polarization loads were changed after 15 min stabilization. Power-producing, short-circuit and snorkel configurations were treated as different operating objectives.",
    chemistry: "COD was measured in duplicate and paired with an electrode-free control.",
    loadPlan: "1,000 ohm maximum-power condition versus short circuit and treatment-only configurations.",
    replication: "Three successive 24 h batches; four treatment configurations were compared in parallel.",
    boundary: "A 24 h COD endpoint is a treatment comparison, not a complete electricity-performance timeline. Short circuit cannot supply harvestable external power.",
    source: "Erable, Etcheverry & Bergel (2011), Biofouling 27(3), 319-326",
    sourceFile: "COD removal.pdf, methods and results pp. 4-8",
    doi: "https://doi.org/10.1080/08927014.2011.564615",
  },
];

export const proposedMeasurementContract = [
  "Record OCV separately during start-up and continue until a pre-declared stabilization criterion is met; do not stop at an arbitrary universal hour.",
  "For a short Pseudomonas or sugar-response run, use hourly loaded-voltage logging as demonstrated by Ali et al. (2017).",
  "For a halophilic fed-batch study, identify every cycle, feed event and circuit-state change; use either the 4-day or 5-day literature profile without combining their results.",
  "Record temperature, pH, conductivity and salinity at least daily when using a multi-day protocol; retain the exact instrument and timestamp.",
  "Pair COD at the beginning and end of each treatment window and keep treatment-only short-circuit results separate from power-producing operation.",
  "Run polarization only after stable operation, record every resistance step as its own observation and wait for a stable value before moving to the next load.",
];
