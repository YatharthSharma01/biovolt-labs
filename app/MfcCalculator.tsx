"use client";

import { useMemo, useState } from "react";
import {
  NextArticle,
  PageMasthead,
  SectionLabel,
  SiteFooter,
  SiteHeader,
} from "./BioVoltExperience";
import {
  calculateMfc,
  estimateBridgeResistanceOhm,
  parseOptionalNumber,
  sumCharacterizedResistanceOhm,
  type AreaBasis,
  type CalculatorInputs,
  type LoadMode,
} from "./calculatorEngine";
import { findEvidenceReference, type EvidenceReference } from "./calculatorEvidence";
import { interpretSubstrateConcentration, type ConcentrationEvidence } from "./calculatorResearch";

type CalculatorMode = "measured" | "projected" | "literature";
type InternalResistanceMethod = "direct" | "components";

type FormState = {
  mode: CalculatorMode;
  reactorArchitecture: string;
  operationMode: string;
  loadMode: LoadMode;
  organism: string;
  cultureType: string;
  substrate: string;
  substrateConcentration: string;
  salinity: string;
  conductivity: string;
  temperature: string;
  ph: string;
  anodeMaterial: string;
  cathodeMaterial: string;
  area: string;
  areaBasis: AreaBasis;
  voltage: string;
  measuredCurrent: string;
  openCircuitVoltage: string;
  resistance: string;
  separatorType: string;
  bridgeElectrolyte: string;
  bridgeSaltMolarity: string;
  bridgeAgarPercent: string;
  bridgeConductivity: string;
  bridgeLengthCm: string;
  bridgeDiameterCm: string;
  internalResistanceMethod: InternalResistanceMethod;
  internalResistance: string;
  ohmicResistance: string;
  anodeChargeTransferResistance: string;
  cathodeChargeTransferResistance: string;
  massTransportResistance: string;
  otherResistance: string;
  includeBridgeResistance: boolean;
  codIn: string;
  codOut: string;
  duration: string;
  voltageUnit: "V" | "mV";
  currentUnit: "mA" | "A";
  resistanceUnit: "Ω" | "kΩ";
  areaUnit: "cm²" | "m²";
};

const initialState: FormState = {
  mode: "measured",
  reactorArchitecture: "double_chamber",
  operationMode: "batch",
  loadMode: "resistor",
  organism: "",
  cultureType: "unknown",
  substrate: "",
  substrateConcentration: "",
  salinity: "",
  conductivity: "",
  temperature: "",
  ph: "",
  anodeMaterial: "",
  cathodeMaterial: "",
  area: "",
  areaBasis: "anode_geometric",
  voltage: "",
  measuredCurrent: "",
  openCircuitVoltage: "",
  resistance: "",
  separatorType: "agar_salt_bridge",
  bridgeElectrolyte: "KNO3",
  bridgeSaltMolarity: "",
  bridgeAgarPercent: "",
  bridgeConductivity: "",
  bridgeLengthCm: "",
  bridgeDiameterCm: "",
  internalResistanceMethod: "direct",
  internalResistance: "",
  ohmicResistance: "",
  anodeChargeTransferResistance: "",
  cathodeChargeTransferResistance: "",
  massTransportResistance: "",
  otherResistance: "",
  includeBridgeResistance: false,
  codIn: "",
  codOut: "",
  duration: "",
  voltageUnit: "V",
  currentUnit: "mA",
  resistanceUnit: "Ω",
  areaUnit: "cm²",
};

const validationExample: FormState = {
  ...initialState,
  mode: "measured",
  organism: "pseudomonas aeruginosa",
  cultureType: "pure",
  substrate: "glucose",
  anodeMaterial: "graphite",
  cathodeMaterial: "graphite",
  area: "25",
  voltage: "0.5",
  measuredCurrent: "0.5",
  resistance: "1000",
  codIn: "1000",
  codOut: "400",
  duration: "24",
};

const steps = ["System", "Biology & substrate", "Electrodes", "Operation", "Results"];

function canonicalNumber(value: string, multiplier = 1) {
  const parsed = parseOptionalNumber(value);
  return parsed === null ? null : parsed * multiplier;
}

function canonicalInputs(state: FormState): CalculatorInputs {
  const bridgeResistanceOhm = estimateBridgeResistanceOhm({
    conductivityMsCm: canonicalNumber(state.bridgeConductivity),
    lengthCm: canonicalNumber(state.bridgeLengthCm),
    diameterCm: canonicalNumber(state.bridgeDiameterCm),
  });
  const internalResistanceOhm = state.internalResistanceMethod === "direct"
    ? canonicalNumber(state.internalResistance)
    : sumCharacterizedResistanceOhm([
      canonicalNumber(state.ohmicResistance),
      canonicalNumber(state.anodeChargeTransferResistance),
      canonicalNumber(state.cathodeChargeTransferResistance),
      canonicalNumber(state.massTransportResistance),
      canonicalNumber(state.otherResistance),
    ], bridgeResistanceOhm, state.includeBridgeResistance);
  return {
    calculationMode: state.mode === "projected" ? "projected" : "measured",
    loadMode: state.loadMode,
    loadedVoltageV: canonicalNumber(state.voltage, state.voltageUnit === "mV" ? 0.001 : 1),
    measuredCurrentMa: canonicalNumber(state.measuredCurrent, state.currentUnit === "A" ? 1000 : 1),
    openCircuitVoltageV: canonicalNumber(state.openCircuitVoltage, state.voltageUnit === "mV" ? 0.001 : 1),
    externalResistanceOhm: canonicalNumber(state.resistance, state.resistanceUnit === "kΩ" ? 1000 : 1),
    areaCm2: canonicalNumber(state.area, state.areaUnit === "m²" ? 10000 : 1),
    areaBasis: state.areaBasis,
    codInMgL: canonicalNumber(state.codIn),
    codOutMgL: canonicalNumber(state.codOut),
    durationHours: canonicalNumber(state.duration),
    internalResistanceOhm,
    bridgeResistanceOhm,
  };
}

function separatorDescriptor(state: FormState) {
  if (state.separatorType === "agar_salt_bridge") return `agar salt bridge ${state.bridgeElectrolyte}`;
  if (state.separatorType === "ion_exchange_membrane") return "ion exchange membrane";
  return state.separatorType;
}

function Field({ id, label, help, children, wide = false }: {
  id: string;
  label: string;
  help?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`calculator-field ${wide ? "calculator-field--wide" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {help && <small id={`${id}-help`}>{help}</small>}
    </div>
  );
}

function UnitInput({ id, value, onChange, unit, onUnitChange, units, min, step = "any", disabled = false, describedBy }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  onUnitChange?: (value: string) => void;
  units?: string[];
  min?: string;
  step?: string;
  disabled?: boolean;
  describedBy?: string;
}) {
  return (
    <div className="unit-input">
      <input id={id} type="number" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} min={min} step={step} disabled={disabled} aria-describedby={describedBy} />
      {units && onUnitChange ? (
        <select aria-label={`${id} unit`} value={unit} onChange={(event) => onUnitChange(event.target.value)} disabled={disabled}>
          {units.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : <span>{unit}</span>}
    </div>
  );
}

const displayNumber = (value: number | null, decimals = 2) => {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);
};

function EvidenceCard({ reference }: { reference: EvidenceReference }) {
  if (reference.tier === "outside_domain") {
    return (
      <article className="calculator-evidence-card calculator-evidence-card--refusal">
        <div><span>Literature check</span><b>Outside evidence domain</b></div>
        <p>{reference.message}</p>
        <small>No numerical estimate produced.</small>
      </article>
    );
  }

  return (
    <article className="calculator-evidence-card">
      <div><span>Literature reference</span><b>{reference.target === "power" ? "Power density" : "COD removal"}</b></div>
      <strong>{displayNumber(reference.value)} <i>{reference.unit}</i></strong>
      <p>{reference.message}</p>
      <dl>
        <div><dt>Condition</dt><dd>{reference.conditionId}</dd></div>
        <div><dt>Match score</dt><dd>{Math.round(reference.score * 100)}%</dd></div>
        <div><dt>Load</dt><dd>{reference.resistanceOhm ?? "—"} Ω</dd></div>
      </dl>
      <p className="evidence-basis">{reference.normalizationBasis}</p>
      <a href={reference.sourceUrl} target="_blank" rel="noreferrer">Open cited paper ↗</a>
    </article>
  );
}

function ConcentrationEvidenceCard({ evidence }: { evidence: ConcentrationEvidence }) {
  const label = evidence.match === "strong" ? "Strong study match" : evidence.match === "eligible" ? "Eligible context" : evidence.match === "partial" ? "Partial match" : "Outside evidence";
  return (
    <article className={`calculator-evidence-card concentration-evidence concentration-evidence--${evidence.match}`}>
      <div><span>Substrate concentration</span><b>{label}</b></div>
      <h3>{evidence.headline}</h3>
      <p>{evidence.message}</p>
      <dl>
        <div><dt>Benchmark</dt><dd>{evidence.benchmark}</dd></div>
        <div><dt>Electrical effect</dt><dd>Context only</dd></div>
        <div><dt>Model rule</dt><dd>No invented multiplier</dd></div>
      </dl>
      <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">Ali et al. (2017) ↗</a>
    </article>
  );
}

function ResultPanel({ state, result, powerReference, codReference, concentrationEvidence, full = false }: {
  state: FormState;
  result: ReturnType<typeof calculateMfc>;
  powerReference: EvidenceReference;
  codReference: EvidenceReference;
  concentrationEvidence: ConcentrationEvidence;
  full?: boolean;
}) {
  const primary = result.powerDensityMwM2 ?? result.powerMw;
  const primaryUnit = result.powerDensityMwM2 !== null ? "mW/m²" : "mW";
  return (
    <aside className={`calculator-results ${full ? "calculator-results--full" : ""}`} aria-live="polite">
      <div className="result-heading">
        <span>{state.mode === "projected" ? "Resistance-model estimate" : state.mode === "literature" ? "Evidence comparison" : "Calculated / equation-derived"}</span>
        <b>{result.method ? result.confidence === "measured" ? "Measured inputs" : "Model estimate" : "Awaiting inputs"}</b>
      </div>
      <div className="result-primary">
        <small>{result.powerDensityMwM2 !== null ? "Power density" : "Electrical power"}</small>
        <strong>{displayNumber(primary, 3)}</strong>
        <i>{primaryUnit}</i>
        {result.powerDensityMwM2 !== null && <em>{state.areaBasis.replace(/_/g, " ")}</em>}
      </div>
      <div className="result-grid">
        <span><small>Current</small><b>{displayNumber(result.currentMa, 3)}</b><i>mA</i></span>
        <span><small>Current density</small><b>{displayNumber(result.currentDensityMaM2, 2)}</b><i>mA/m²</i></span>
        <span><small>Load voltage</small><b>{displayNumber(result.loadVoltageV, 3)}</b><i>V</i></span>
        <span><small>Total Rint used</small><b>{displayNumber(result.internalResistanceOhm, 1)}</b><i>Ω</i></span>
        <span><small>COD removal</small><b>{displayNumber(result.codRemovalPercent, 2)}</b><i>%</i></span>
        <span><small>Energy</small><b>{displayNumber(result.energyMwh, 3)}</b><i>mWh</i></span>
      </div>
      {result.method && <p className="result-method">{result.method}</p>}
      {result.recommendedExternalResistanceOhm !== null && (
        <div className="resistance-readout"><span>Idealized peak-load region</span><b>Rext ≈ {displayNumber(result.recommendedExternalResistanceOhm, 1)} Ω</b><small>The simplified linear model peaks near Rext = Rint. Verify with a polarization sweep.</small></div>
      )}
      {result.bridgeResistanceOhm !== null && (
        <div className="bridge-readout"><span>Bridge-only estimate</span><b>{displayNumber(result.bridgeResistanceOhm, 1)} Ω</b><small>Bulk ionic path from L/(κA); not total cell internal resistance.</small></div>
      )}
      {canonicalInputs(state).openCircuitVoltageV !== null && (
        <div className="ocv-readout"><span>Open-circuit voltage</span><b>{displayNumber(canonicalInputs(state).openCircuitVoltageV, 3)} V</b><small>{state.mode === "projected" ? "Used only in the resistance projection." : "Displayed separately; not used in measured power."}</small></div>
      )}
      {result.warnings.length > 0 && (
        <div className="calculator-warnings">
          {result.warnings.map((warning) => <p key={warning.code} data-severity={warning.severity}><b>{warning.severity}</b>{warning.message}</p>)}
        </div>
      )}
      {state.mode === "literature" && (
        <div className="evidence-stack">
          <EvidenceCard reference={powerReference} />
          <EvidenceCard reference={codReference} />
        </div>
      )}
      {state.organism && state.substrate && <ConcentrationEvidenceCard evidence={concentrationEvidence} />}
    </aside>
  );
}

export function CalculatorView({ staticMode = false }: { staticMode?: boolean }) {
  const [state, setState] = useState<FormState>(initialState);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors([]);
  };

  const inputs = useMemo(() => canonicalInputs(state), [state]);
  const result = useMemo(() => calculateMfc(inputs), [inputs]);
  const evidenceInputs = useMemo(() => ({
    organism: state.organism,
    substrate: state.substrate,
    anodeMaterial: state.anodeMaterial,
    cathodeMaterial: state.cathodeMaterial,
    reactorArchitecture: state.reactorArchitecture,
    loadMode: state.loadMode,
    externalResistanceOhm: inputs.externalResistanceOhm,
    salinityGL: canonicalNumber(state.salinity),
    temperatureC: canonicalNumber(state.temperature),
    ph: canonicalNumber(state.ph),
    substrateConcentrationGL: canonicalNumber(state.substrateConcentration),
    separator: separatorDescriptor(state),
  }), [state, inputs.externalResistanceOhm]);
  const powerReference = useMemo(() => findEvidenceReference(evidenceInputs, "power"), [evidenceInputs]);
  const codReference = useMemo(() => findEvidenceReference(evidenceInputs, "cod"), [evidenceInputs]);
  const concentrationEvidence = useMemo(() => interpretSubstrateConcentration({
    organism: state.organism,
    substrate: state.substrate,
    concentrationGL: canonicalNumber(state.substrateConcentration),
    reactorArchitecture: state.reactorArchitecture,
  }), [state.organism, state.substrate, state.substrateConcentration, state.reactorArchitecture]);

  const validationForStep = (currentStep: number) => {
    const nextErrors: string[] = [];
    if (currentStep === 1 && state.mode === "literature") {
      if (!state.organism) nextErrors.push("Choose a microbe or community for literature comparison.");
      if (!state.substrate) nextErrors.push("Choose a substrate for literature comparison.");
    }
    if (currentStep === 2 && state.mode === "literature") {
      if (!state.anodeMaterial) nextErrors.push("Choose an anode material for literature comparison.");
      if (!state.cathodeMaterial) nextErrors.push("Choose a cathode material for literature comparison.");
    }
    if (currentStep === 3) {
      if (state.mode === "measured" && state.loadMode === "resistor") {
        const supplied = [inputs.loadedVoltageV, inputs.measuredCurrentMa, inputs.externalResistanceOhm].filter((value) => value !== null).length;
        if (supplied < 2) nextErrors.push("Enter at least two electrical measurements: loaded voltage, measured current or resistance.");
      }
      if (state.mode === "projected") {
        if (state.loadMode !== "resistor") nextErrors.push("Resistance projection requires external-resistor mode.");
        if (!inputs.openCircuitVoltageV || inputs.openCircuitVoltageV <= 0) nextErrors.push("Enter a positive stabilized open-circuit voltage.");
        if (!inputs.externalResistanceOhm || inputs.externalResistanceOhm <= 0) nextErrors.push("Enter a positive candidate external resistance.");
        if (!inputs.internalResistanceOhm || inputs.internalResistanceOhm <= 0) nextErrors.push("Enter measured total internal resistance or characterized resistance components.");
      }
      if (state.mode === "literature" && state.loadMode === "resistor" && (!inputs.externalResistanceOhm || inputs.externalResistanceOhm <= 0)) {
        nextErrors.push("Enter a positive external resistance for literature comparison.");
      }
    }
    return nextErrors;
  };

  const continueStep = () => {
    const nextErrors = validationForStep(step);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    const nextStep = Math.min(steps.length - 1, step + 1);
    setStep(nextStep);
    setFurthestStep((current) => Math.max(current, nextStep));
  };

  const loadExample = () => {
    setState(validationExample);
    setErrors([]);
    setStep(3);
    setFurthestStep(3);
  };

  return (
    <main className="site-shell paper-page calculator-page">
      <SiteHeader active="calculator" staticMode={staticMode} />
      <PageMasthead
        number="03"
        kicker="Measured equations / resistance-aware projection / evidence gate"
        title="Measure first. Compare responsibly."
        abstract="Calculate measured performance, examine the salt-bridge contribution, test a transparent internal-resistance scenario and compare the configuration with audited literature."
      />

      <section className="calculator-ledger" aria-label="Calculator evidence policy">
        <div><span>Calculated</span><strong>Physical equations</strong></div>
        <div><span>Referenced</span><strong>Audited conditions</strong></div>
        <div><span>Modelled</span><strong>Transparent circuit estimate</strong></div>
        <div><span>Data handling</span><strong>Runs in your browser</strong></div>
      </section>

      <section className="paper-spread calculator-workspace">
        <SectionLabel number="03.1">MFC calculation workspace / beta 0.1</SectionLabel>
        <div className="calculator-toolbar">
          <div><p className="journal-kicker">Single-cell calculator</p><h2>Five steps, one traceable result.</h2><p>Unknown values remain blank. Measured voltage, modelled resistance and literature evidence are kept separate.</p></div>
          <div><button type="button" onClick={loadExample}>Load validation example</button><button type="button" onClick={() => { setState(initialState); setStep(0); setFurthestStep(0); setErrors([]); }}>Reset</button></div>
        </div>

        <nav className="calculator-steps" aria-label="Calculator steps">
          {steps.map((label, index) => (
            <button key={label} type="button" className={step === index ? "is-active" : index <= furthestStep ? "is-complete" : ""} onClick={() => index <= furthestStep && setStep(index)} disabled={index > furthestStep} aria-current={step === index ? "step" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span><b>{label}</b>
            </button>
          ))}
        </nav>

        {errors.length > 0 && <div className="calculator-error-summary" role="alert"><b>Complete this step</b>{errors.map((error) => <p key={error}>{error}</p>)}</div>}

        <div className="calculator-layout">
          <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
            {step === 0 && (
              <section className="calculator-step-panel" aria-labelledby="calculator-step-system">
                <div className="step-heading"><span>01 / System</span><h2 id="calculator-step-system">Choose how the result should be produced.</h2><p>Measured performance, resistance projection and literature comparison remain separate evidence lanes.</p></div>
                <div className="mode-grid">
                  <button type="button" aria-pressed={state.mode === "measured"} className={state.mode === "measured" ? "is-active" : ""} onClick={() => update("mode", "measured")}><span>Calculated</span><b>Calculate from measurements</b><p>Use loaded voltage, resistance, current, area and COD measurements.</p></button>
                  <button type="button" aria-pressed={state.mode === "projected"} className={state.mode === "projected" ? "is-active" : ""} onClick={() => { setState((current) => ({ ...current, mode: "projected", loadMode: "resistor" })); setErrors([]); }}><span>Modelled</span><b>Project with internal resistance</b><p>Use stabilized OCV, a candidate load and measured or characterized total Rint.</p></button>
                  <button type="button" aria-pressed={state.mode === "literature"} className={state.mode === "literature" ? "is-active" : ""} onClick={() => update("mode", "literature")}><span>Referenced</span><b>Compare with literature</b><p>Describe the reactor and receive one audited reference or a refusal.</p></button>
                </div>
                <div className="calculator-field-grid">
                  <Field id="reactor" label="Reactor architecture">
                    <select id="reactor" value={state.reactorArchitecture} onChange={(event) => update("reactorArchitecture", event.target.value)}><option value="double_chamber">Double chamber</option><option value="single_chamber">Single chamber</option><option value="other">Other / not listed</option></select>
                  </Field>
                  <Field id="operation-mode" label="Operation mode">
                    <select id="operation-mode" value={state.operationMode} onChange={(event) => update("operationMode", event.target.value)}><option value="batch">Batch</option><option value="continuous">Continuous</option><option value="fed_batch">Fed-batch</option><option value="unknown">Unknown</option></select>
                  </Field>
                  <Field id="load-mode" label="External circuit mode" help="Only resistor mode supports I = V/R.">
                    <select id="load-mode" value={state.loadMode} onChange={(event) => update("loadMode", event.target.value as LoadMode)} aria-describedby="load-mode-help"><option value="resistor">External resistor</option><option value="open_circuit">Open circuit</option><option value="short_circuit">Short circuit / treatment only</option></select>
                  </Field>
                  <div className="calculator-contract"><span>Version 1 boundary</span><b>One microbial fuel cell</b><p>Stacks and series/parallel calculations are deliberately excluded.</p></div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="calculator-step-panel" aria-labelledby="calculator-step-biology">
                <div className="step-heading"><span>02 / Biology &amp; substrate</span><h2 id="calculator-step-biology">Describe the living electrochemical system.</h2><p>Microbe, strain context and substrate remain independent features.</p></div>
                <div className="calculator-field-grid">
                  <Field id="organism" label="Microbe or community" help={state.mode === "measured" ? "Optional for formula calculation." : "Required for literature comparison."}>
                    <select id="organism" value={state.organism} onChange={(event) => update("organism", event.target.value)} aria-describedby="organism-help"><option value="">Unknown / not reported</option><option value="halophil">Halophilic community</option><option value="pseudomonas aeruginosa">Pseudomonas aeruginosa</option><option value="electroactive wastewater biofilm">Electroactive wastewater biofilm</option><option value="saccharomyces cerevisiae">Saccharomyces cerevisiae</option><option value="other">Other</option></select>
                  </Field>
                  <Field id="culture-type" label="Culture type">
                    <select id="culture-type" value={state.cultureType} onChange={(event) => update("cultureType", event.target.value)}><option value="unknown">Unknown</option><option value="pure">Pure culture</option><option value="mixed">Mixed culture</option><option value="environmental">Environmental enrichment</option></select>
                  </Field>
                  <Field id="substrate" label="Substrate">
                    <select id="substrate" value={state.substrate} onChange={(event) => update("substrate", event.target.value)}><option value="">Unknown / not reported</option><option value="glucose">Glucose</option><option value="fructose">Fructose</option><option value="sucrose">Sucrose</option><option value="sodium acetate">Sodium acetate</option><option value="starch">Starch</option><option value="urban wastewater">Urban wastewater</option><option value="vegetable">Complex food / vegetable waste</option><option value="other">Other</option></select>
                  </Field>
                  <Field id="substrate-concentration" label="Substrate concentration">
                    <UnitInput id="substrate-concentration" value={state.substrateConcentration} onChange={(value) => update("substrateConcentration", value)} unit="g/L" min="0" />
                  </Field>
                  <Field id="salinity" label="Salinity" help="Mass of dissolved salts per liquid volume; not calculated from conductivity.">
                    <UnitInput id="salinity" value={state.salinity} onChange={(value) => update("salinity", value)} unit="g/L" min="0" describedBy="salinity-help" />
                  </Field>
                  <Field id="conductivity" label="Conductivity" help="Electrical conductance of the liquid. It is related to salinity but is not the same measurement.">
                    <UnitInput id="conductivity" value={state.conductivity} onChange={(value) => update("conductivity", value)} unit="mS/cm" min="0" describedBy="conductivity-help" />
                  </Field>
                  <Field id="temperature" label="Temperature"><UnitInput id="temperature" value={state.temperature} onChange={(value) => update("temperature", value)} unit="°C" min="0" /></Field>
                  <Field id="ph" label="pH"><UnitInput id="ph" value={state.ph} onChange={(value) => update("ph", value)} unit="pH" min="0" /></Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="calculator-step-panel" aria-labelledby="calculator-step-electrodes">
                <div className="step-heading"><span>03 / Electrodes</span><h2 id="calculator-step-electrodes">Keep material and normalization visible.</h2><p>Power density is meaningless without an electrode area and its basis.</p></div>
                <div className="calculator-field-grid">
                  <Field id="anode" label="Anode material">
                    <select id="anode" value={state.anodeMaterial} onChange={(event) => update("anodeMaterial", event.target.value)}><option value="">Unknown / not reported</option><option value="stainless-steel mesh">Stainless-steel mesh</option><option value="carbon cloth">Carbon cloth</option><option value="graphite felt">Graphite felt</option><option value="graphite">Graphite rod / plate</option><option value="carbon brush">Carbon brush</option><option value="other">Other</option></select>
                  </Field>
                  <Field id="cathode" label="Cathode material">
                    <select id="cathode" value={state.cathodeMaterial} onChange={(event) => update("cathodeMaterial", event.target.value)}><option value="">Unknown / not reported</option><option value="carbon felt">Carbon felt</option><option value="carbon cloth">Carbon cloth</option><option value="graphite felt">Graphite felt</option><option value="graphite">Graphite rod / plate</option><option value="pt air cathode">Platinum air cathode</option><option value="biochar">Biochar cathode</option><option value="other">Other</option></select>
                  </Field>
                  <Field id="area" label="Exposed normalization area" help="Use the exact exposed area associated with the selected basis.">
                    <UnitInput id="area" value={state.area} onChange={(value) => update("area", value)} unit={state.areaUnit} onUnitChange={(value) => update("areaUnit", value as FormState["areaUnit"])} units={["cm²", "m²"]} min="0" describedBy="area-help" />
                  </Field>
                  <Field id="area-basis" label="Area basis" help="Unknown basis disables density calculation rather than guessing.">
                    <select id="area-basis" value={state.areaBasis} onChange={(event) => update("areaBasis", event.target.value as AreaBasis)} aria-describedby="area-basis-help"><option value="anode_geometric">Anode geometric area</option><option value="cathode_geometric">Cathode geometric area</option><option value="projected">Projected area</option><option value="specific">Specific surface area</option><option value="unknown">Unknown / not reported</option></select>
                  </Field>
                </div>
                <div className="normalization-note"><b>Normalization rule</b><p>Anode, cathode, projected and specific areas are never pooled as if they were equivalent.</p></div>
              </section>
            )}

            {step === 3 && (
              <section className="calculator-step-panel" aria-labelledby="calculator-step-operation">
                <div className="step-heading"><span>04 / Operation &amp; measurements</span><h2 id="calculator-step-operation">Document the ionic path and electrical evidence.</h2><p>Measured results and resistance projections use different equations. Separator geometry estimates only its bulk ionic contribution.</p></div>
                <div className="calculator-field-grid">
                  <div className="calculator-subsection-heading calculator-field--wide"><span>Separator / salt bridge</span><p>These fields identify the proton or ion transport path and support a bridge-only resistance estimate.</p></div>
                  <Field id="separator-type" label="Separator type">
                    <select id="separator-type" value={state.separatorType} onChange={(event) => update("separatorType", event.target.value)}><option value="agar_salt_bridge">Agar salt bridge</option><option value="ion_exchange_membrane">Ion-exchange membrane</option><option value="membraneless">Membraneless</option><option value="other">Other / not reported</option></select>
                  </Field>
                  <Field id="bridge-electrolyte" label="Bridge electrolyte">
                    <select id="bridge-electrolyte" value={state.bridgeElectrolyte} onChange={(event) => update("bridgeElectrolyte", event.target.value)} disabled={state.separatorType !== "agar_salt_bridge"}><option value="KNO3">KNO₃</option><option value="KCl">KCl</option><option value="NaCl">NaCl</option><option value="other">Other</option></select>
                  </Field>
                  <Field id="bridge-molarity" label="Electrolyte concentration"><UnitInput id="bridge-molarity" value={state.bridgeSaltMolarity} onChange={(value) => update("bridgeSaltMolarity", value)} unit="mol/L" min="0" disabled={state.separatorType !== "agar_salt_bridge"} /></Field>
                  <Field id="bridge-agar" label="Agar concentration"><UnitInput id="bridge-agar" value={state.bridgeAgarPercent} onChange={(value) => update("bridgeAgarPercent", value)} unit="% w/v" min="0" disabled={state.separatorType !== "agar_salt_bridge"} /></Field>
                  <Field id="bridge-conductivity" label="Measured bridge conductivity" help="Use conductivity of the prepared gel/electrolyte, not an unrelated chamber measurement."><UnitInput id="bridge-conductivity" value={state.bridgeConductivity} onChange={(value) => update("bridgeConductivity", value)} unit="mS/cm" min="0" disabled={state.separatorType !== "agar_salt_bridge"} describedBy="bridge-conductivity-help" /></Field>
                  <Field id="bridge-length" label="Bridge length"><UnitInput id="bridge-length" value={state.bridgeLengthCm} onChange={(value) => update("bridgeLengthCm", value)} unit="cm" min="0" disabled={state.separatorType !== "agar_salt_bridge"} /></Field>
                  <Field id="bridge-diameter" label="Internal diameter"><UnitInput id="bridge-diameter" value={state.bridgeDiameterCm} onChange={(value) => update("bridgeDiameterCm", value)} unit="cm" min="0" disabled={state.separatorType !== "agar_salt_bridge"} /></Field>
                  <div className="calculator-contract bridge-contract"><span>Bridge-only estimate</span><b>{displayNumber(inputs.bridgeResistanceOhm, 1)} Ω</b><p>Rbridge = L/(κA). This is not total MFC internal resistance.</p></div>

                  <div className="calculator-subsection-heading calculator-field--wide"><span>Electrical measurements</span><p>{state.mode === "projected" ? "Projection requires stabilized OCV, a candidate load and total internal resistance." : "Measured power requires two compatible loaded-circuit observations."}</p></div>
                  <Field id="loaded-voltage" label="Loaded voltage" help="Voltage measured while the stated external resistance is connected—not open-circuit voltage.">
                    <UnitInput id="loaded-voltage" value={state.voltage} onChange={(value) => update("voltage", value)} unit={state.voltageUnit} onUnitChange={(value) => update("voltageUnit", value as FormState["voltageUnit"])} units={["V", "mV"]} min="0" describedBy="loaded-voltage-help" disabled={state.loadMode !== "resistor" || state.mode === "projected"} />
                  </Field>
                  <Field id="resistance" label={state.mode === "projected" ? "Candidate external resistance" : "External resistance"}>
                    <UnitInput id="resistance" value={state.resistance} onChange={(value) => update("resistance", value)} unit={state.resistanceUnit} onUnitChange={(value) => update("resistanceUnit", value as FormState["resistanceUnit"])} units={["Ω", "kΩ"]} min="0" disabled={state.loadMode !== "resistor"} />
                  </Field>
                  <Field id="measured-current" label="Measured current" help="When voltage and resistance are also present, the calculator checks consistency with V/R.">
                    <UnitInput id="measured-current" value={state.measuredCurrent} onChange={(value) => update("measuredCurrent", value)} unit={state.currentUnit} onUnitChange={(value) => update("currentUnit", value as FormState["currentUnit"])} units={["mA", "A"]} min="0" describedBy="measured-current-help" disabled={state.loadMode !== "resistor" || state.mode === "projected"} />
                  </Field>
                  <Field id="ocv" label="Open-circuit voltage" help={state.mode === "projected" ? "Required after stabilization for the simplified resistance model." : "Stored and displayed separately. It never replaces loaded voltage."}>
                    <UnitInput id="ocv" value={state.openCircuitVoltage} onChange={(value) => update("openCircuitVoltage", value)} unit={state.voltageUnit} onUnitChange={(value) => update("voltageUnit", value as FormState["voltageUnit"])} units={["V", "mV"]} min="0" describedBy="ocv-help" />
                  </Field>
                  {state.mode === "projected" && (
                    <>
                      <div className="calculator-subsection-heading calculator-field--wide"><span>Total internal resistance</span><p>Prefer a value measured from a polarization curve or operational EIS. Component mode is for documented effective values near one operating point.</p></div>
                      <Field id="rint-method" label="Rint evidence method">
                        <select id="rint-method" value={state.internalResistanceMethod} onChange={(event) => update("internalResistanceMethod", event.target.value as InternalResistanceMethod)}><option value="direct">Measured total Rint</option><option value="components">Sum characterized components</option></select>
                      </Field>
                      {state.internalResistanceMethod === "direct" ? (
                        <Field id="internal-resistance" label="Measured total internal resistance" help="Do not enter bridge resistance here unless the measurement represents the whole operating cell."><UnitInput id="internal-resistance" value={state.internalResistance} onChange={(value) => update("internalResistance", value)} unit="Ω" min="0" describedBy="internal-resistance-help" /></Field>
                      ) : (
                        <>
                          <Field id="ohmic-resistance" label="Electrolyte + contacts"><UnitInput id="ohmic-resistance" value={state.ohmicResistance} onChange={(value) => update("ohmicResistance", value)} unit="Ω" min="0" /></Field>
                          <Field id="anode-resistance" label="Anode charge transfer"><UnitInput id="anode-resistance" value={state.anodeChargeTransferResistance} onChange={(value) => update("anodeChargeTransferResistance", value)} unit="Ω" min="0" /></Field>
                          <Field id="cathode-resistance" label="Cathode charge transfer"><UnitInput id="cathode-resistance" value={state.cathodeChargeTransferResistance} onChange={(value) => update("cathodeChargeTransferResistance", value)} unit="Ω" min="0" /></Field>
                          <Field id="transport-resistance" label="Effective mass transport"><UnitInput id="transport-resistance" value={state.massTransportResistance} onChange={(value) => update("massTransportResistance", value)} unit="Ω" min="0" /></Field>
                          <Field id="other-resistance" label="Other characterized loss"><UnitInput id="other-resistance" value={state.otherResistance} onChange={(value) => update("otherResistance", value)} unit="Ω" min="0" /></Field>
                          <label className="calculator-checkbox calculator-field--wide"><input type="checkbox" checked={state.includeBridgeResistance} onChange={(event) => update("includeBridgeResistance", event.target.checked)} /><span>Include the bridge-only estimate in the characterized-component sum</span></label>
                        </>
                      )}
                    </>
                  )}
                  <Field id="cod-in" label="Initial COD"><UnitInput id="cod-in" value={state.codIn} onChange={(value) => update("codIn", value)} unit="mg/L" min="0" /></Field>
                  <Field id="cod-out" label="Final COD"><UnitInput id="cod-out" value={state.codOut} onChange={(value) => update("codOut", value)} unit="mg/L" min="0" /></Field>
                  <Field id="duration" label="Experiment duration"><UnitInput id="duration" value={state.duration} onChange={(value) => update("duration", value)} unit="h" min="0" /></Field>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="calculator-step-panel calculator-step-panel--results" aria-labelledby="calculator-step-results">
                <div className="step-heading"><span>05 / Results</span><h2 id="calculator-step-results">A result with its method attached.</h2><p>Measurements take precedence. Resistance projections and literature evidence remain clearly labelled, separate layers.</p></div>
                <div className="result-methodology">
                  <article><span>01</span><b>Calculated</b><p>Derived from your entered measurements and physical equations.</p></article>
                  <article><span>02</span><b>Resistance projection</b><p>Derived from stabilized OCV, external load and measured or characterized total Rint.</p></article>
                  <article><span>03</span><b>Literature context</b><p>Audited condition, concentration region and citation; never substituted for your result.</p></article>
                </div>
                <details className="formula-register"><summary>Show formulas and scientific boundary</summary><p><code>I = V/Rext</code> · <code>P = V²/Rext</code> · <code>Iprojected = OCV/(Rext + Rint)</code> · <code>Rbridge = L/(κA)</code> · <code>COD removal = (CODin − CODout) / CODin × 100</code></p><p>Bridge resistance is not total internal resistance. The resistance projection is a simplified local circuit model, and substrate concentration is not converted into a universal biological multiplier.</p></details>
              </section>
            )}

            <div className="calculator-navigation">
              <button type="button" onClick={() => { setStep((current) => Math.max(0, current - 1)); setErrors([]); }} disabled={step === 0}>Back</button>
              {step < steps.length - 1 ? <button type="button" className="calculator-next" onClick={continueStep}>Continue <span>→</span></button> : <button type="button" className="calculator-next" onClick={() => setStep(0)}>Start another calculation <span>↻</span></button>}
            </div>
          </form>

          <ResultPanel state={state} result={result} powerReference={powerReference} codReference={codReference} concentrationEvidence={concentrationEvidence} />
        </div>
      </section>

      <section className="paper-spread calculator-evidence-policy">
        <SectionLabel number="03.2">Phase 2 evidence boundary</SectionLabel>
        <div><p className="journal-kicker">Current evidence gate</p><h2>References inform the model; they do not impersonate measurements.</h2><p>Sixteen literature conditions support controlled comparisons. The resistance projection is a physical circuit estimate, while substrate-concentration findings remain configuration-specific evidence rather than a universal power multiplier.</p></div>
        <aside><span><b>2</b>Power match-ready conditions</span><span><b>8</b>COD match-ready conditions</span><span><b>0</b>Estimate-ready domains</span></aside>
      </section>

      <NextArticle page="twin" label="04 — Digital twin" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}
