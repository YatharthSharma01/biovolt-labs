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
  parseOptionalNumber,
  type AreaBasis,
  type CalculatorInputs,
  type LoadMode,
} from "./calculatorEngine";
import { findEvidenceReference, type EvidenceReference } from "./calculatorEvidence";

type CalculatorMode = "measured" | "literature";

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
  return {
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
  };
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

function ResultPanel({ state, result, powerReference, codReference, full = false }: {
  state: FormState;
  result: ReturnType<typeof calculateMfc>;
  powerReference: EvidenceReference;
  codReference: EvidenceReference;
  full?: boolean;
}) {
  const primary = result.powerDensityMwM2 ?? result.powerMw;
  const primaryUnit = result.powerDensityMwM2 !== null ? "mW/m²" : "mW";
  return (
    <aside className={`calculator-results ${full ? "calculator-results--full" : ""}`} aria-live="polite">
      <div className="result-heading">
        <span>Calculated / equation-derived</span>
        <b>{result.method ? "Inputs active" : "Awaiting inputs"}</b>
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
        <span><small>COD removal</small><b>{displayNumber(result.codRemovalPercent, 2)}</b><i>%</i></span>
        <span><small>Energy</small><b>{displayNumber(result.energyMwh, 3)}</b><i>mWh</i></span>
      </div>
      {result.method && <p className="result-method">{result.method}</p>}
      {canonicalInputs(state).openCircuitVoltageV !== null && (
        <div className="ocv-readout"><span>Open-circuit voltage</span><b>{displayNumber(canonicalInputs(state).openCircuitVoltageV, 3)} V</b><small>Displayed separately; not used in power.</small></div>
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
  }), [state, inputs.externalResistanceOhm]);
  const powerReference = useMemo(() => findEvidenceReference(evidenceInputs, "power"), [evidenceInputs]);
  const codReference = useMemo(() => findEvidenceReference(evidenceInputs, "cod"), [evidenceInputs]);

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
        kicker="Measured equations / evidence-gated comparison"
        title="Measure first. Compare responsibly."
        abstract="Calculate current, power, density, energy and COD removal from MFC measurements, then compare the configuration with audited literature without turning a single paper into an AI prediction."
      />

      <section className="calculator-ledger" aria-label="Calculator evidence policy">
        <div><span>Calculated</span><strong>Physical equations</strong></div>
        <div><span>Referenced</span><strong>Audited conditions</strong></div>
        <div><span>Estimates</span><strong>Disabled by evidence gate</strong></div>
        <div><span>Data handling</span><strong>Runs in your browser</strong></div>
      </section>

      <section className="paper-spread calculator-workspace">
        <SectionLabel number="03.1">MFC calculation workspace / beta 0.1</SectionLabel>
        <div className="calculator-toolbar">
          <div><p className="journal-kicker">Single-cell calculator</p><h2>Five steps, one traceable result.</h2><p>Unknown values remain blank. Open-circuit voltage, loaded voltage and literature values are kept separate.</p></div>
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
                <div className="step-heading"><span>01 / System</span><h2 id="calculator-step-system">Choose how the result should be produced.</h2><p>The measured path calculates from your values. The literature path adds a separate cited comparison.</p></div>
                <div className="mode-grid">
                  <button type="button" aria-pressed={state.mode === "measured"} className={state.mode === "measured" ? "is-active" : ""} onClick={() => update("mode", "measured")}><span>Calculated</span><b>Calculate from measurements</b><p>Use loaded voltage, resistance, current, area and COD measurements.</p></button>
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
                <div className="step-heading"><span>04 / Operation &amp; measurements</span><h2 id="calculator-step-operation">Enter what was measured under load.</h2><p>The formula path needs two electrical measurements. COD and duration unlock treatment and energy results.</p></div>
                <div className="calculator-field-grid">
                  <Field id="loaded-voltage" label="Loaded voltage" help="Voltage measured while the stated external resistance is connected—not open-circuit voltage.">
                    <UnitInput id="loaded-voltage" value={state.voltage} onChange={(value) => update("voltage", value)} unit={state.voltageUnit} onUnitChange={(value) => update("voltageUnit", value as FormState["voltageUnit"])} units={["V", "mV"]} min="0" describedBy="loaded-voltage-help" disabled={state.loadMode !== "resistor"} />
                  </Field>
                  <Field id="resistance" label="External resistance">
                    <UnitInput id="resistance" value={state.resistance} onChange={(value) => update("resistance", value)} unit={state.resistanceUnit} onUnitChange={(value) => update("resistanceUnit", value as FormState["resistanceUnit"])} units={["Ω", "kΩ"]} min="0" disabled={state.loadMode !== "resistor"} />
                  </Field>
                  <Field id="measured-current" label="Measured current" help="When voltage and resistance are also present, the calculator checks consistency with V/R.">
                    <UnitInput id="measured-current" value={state.measuredCurrent} onChange={(value) => update("measuredCurrent", value)} unit={state.currentUnit} onUnitChange={(value) => update("currentUnit", value as FormState["currentUnit"])} units={["mA", "A"]} min="0" describedBy="measured-current-help" disabled={state.loadMode !== "resistor"} />
                  </Field>
                  <Field id="ocv" label="Open-circuit voltage" help="Stored and displayed separately. It never replaces loaded voltage.">
                    <UnitInput id="ocv" value={state.openCircuitVoltage} onChange={(value) => update("openCircuitVoltage", value)} unit={state.voltageUnit} onUnitChange={(value) => update("voltageUnit", value as FormState["voltageUnit"])} units={["V", "mV"]} min="0" describedBy="ocv-help" />
                  </Field>
                  <Field id="cod-in" label="Initial COD"><UnitInput id="cod-in" value={state.codIn} onChange={(value) => update("codIn", value)} unit="mg/L" min="0" /></Field>
                  <Field id="cod-out" label="Final COD"><UnitInput id="cod-out" value={state.codOut} onChange={(value) => update("codOut", value)} unit="mg/L" min="0" /></Field>
                  <Field id="duration" label="Experiment duration"><UnitInput id="duration" value={state.duration} onChange={(value) => update("duration", value)} unit="h" min="0" /></Field>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="calculator-step-panel calculator-step-panel--results" aria-labelledby="calculator-step-results">
                <div className="step-heading"><span>05 / Results</span><h2 id="calculator-step-results">A result with its method attached.</h2><p>Calculated values take precedence. Literature evidence remains a separate reference layer.</p></div>
                <div className="result-methodology">
                  <article><span>01</span><b>Calculated</b><p>Derived from your entered measurements and physical equations.</p></article>
                  <article><span>02</span><b>Literature reference</b><p>One closest eligible condition with its citation and limitations.</p></article>
                  <article><span>03</span><b>Literature estimate</b><p>Disabled because no current domain has enough independent studies.</p></article>
                </div>
                <details className="formula-register"><summary>Show formulas and scientific boundary</summary><p><code>I = V/R</code> · <code>P = V²/R</code> · <code>J = I/A</code> · <code>PD = P/A</code> · <code>COD removal = (CODin − CODout) / CODin × 100</code></p><p>This version does not estimate internal resistance, coulombic efficiency, stack output or biological multipliers.</p></details>
              </section>
            )}

            <div className="calculator-navigation">
              <button type="button" onClick={() => { setStep((current) => Math.max(0, current - 1)); setErrors([]); }} disabled={step === 0}>Back</button>
              {step < steps.length - 1 ? <button type="button" className="calculator-next" onClick={continueStep}>Continue <span>→</span></button> : <button type="button" className="calculator-next" onClick={() => setStep(0)}>Start another calculation <span>↻</span></button>}
            </div>
          </form>

          <ResultPanel state={state} result={result} powerReference={powerReference} codReference={codReference} />
        </div>
      </section>

      <section className="paper-spread calculator-evidence-policy">
        <SectionLabel number="03.2">Phase 2 evidence boundary</SectionLabel>
        <div><p className="journal-kicker">Current evidence gate</p><h2>References are available. Predictions are not.</h2><p>Sixteen literature conditions were reviewed. Two public halophile-acetate conditions can support power matching and eight target-specific conditions can support COD references. No domain is cleared for a pooled estimate or confidence interval.</p></div>
        <aside><span><b>2</b>Power match-ready conditions</span><span><b>8</b>COD match-ready conditions</span><span><b>0</b>Estimate-ready domains</span></aside>
      </section>

      <NextArticle page="twin" label="04 — Digital twin" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}
