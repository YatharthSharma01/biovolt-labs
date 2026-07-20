export type LoadMode = "resistor" | "open_circuit" | "short_circuit";
export type AreaBasis = "anode_geometric" | "cathode_geometric" | "projected" | "specific" | "unknown";
export type CalculationMode = "measured" | "projected";

export type CalculatorInputs = {
  calculationMode?: CalculationMode;
  loadMode: LoadMode;
  loadedVoltageV: number | null;
  measuredCurrentMa: number | null;
  openCircuitVoltageV: number | null;
  externalResistanceOhm: number | null;
  areaCm2: number | null;
  areaBasis: AreaBasis;
  codInMgL: number | null;
  codOutMgL: number | null;
  durationHours: number | null;
  internalResistanceOhm?: number | null;
  bridgeResistanceOhm?: number | null;
};

export type CalculatorWarning = {
  code: string;
  severity: "note" | "warning" | "severe";
  message: string;
};

export type CalculatorResult = {
  currentMa: number | null;
  powerMw: number | null;
  currentDensityMaM2: number | null;
  powerDensityMwM2: number | null;
  codRemovalPercent: number | null;
  energyMwh: number | null;
  loadVoltageV: number | null;
  internalResistanceOhm: number | null;
  bridgeResistanceOhm: number | null;
  recommendedExternalResistanceOhm: number | null;
  theoreticalPeakPowerMw: number | null;
  confidence: "measured" | "model_estimate" | "not_available";
  method: string | null;
  areaBasis: AreaBasis;
  warnings: CalculatorWarning[];
};

const isUsable = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

const relativeDifference = (observed: number, expected: number) => {
  const scale = Math.max(Math.abs(observed), Math.abs(expected), 1e-12);
  return Math.abs(observed - expected) / scale;
};

export function calculateMfc(inputs: CalculatorInputs): CalculatorResult {
  const warnings: CalculatorWarning[] = [];
  let currentMa: number | null = null;
  let powerMw: number | null = null;
  let loadVoltageV: number | null = null;
  let recommendedExternalResistanceOhm: number | null = null;
  let theoreticalPeakPowerMw: number | null = null;
  let confidence: CalculatorResult["confidence"] = "not_available";
  let method: string | null = null;

  const voltage = inputs.loadedVoltageV;
  const measuredCurrent = inputs.measuredCurrentMa;
  const resistance = inputs.externalResistanceOhm;
  const internalResistance = inputs.internalResistanceOhm ?? null;
  const calculationMode = inputs.calculationMode ?? "measured";

  if (calculationMode === "projected" && inputs.loadMode !== "resistor") {
    warnings.push({
      code: "PROJECTION_REQUIRES_RESISTOR",
      severity: "severe",
      message: "Resistance projection requires an external resistor, open-circuit voltage and total internal resistance.",
    });
  } else if (calculationMode === "projected") {
    if (!isUsable(inputs.openCircuitVoltageV) || inputs.openCircuitVoltageV <= 0) {
      warnings.push({ code: "OCV_REQUIRED_FOR_PROJECTION", severity: "severe", message: "Enter a positive stabilized open-circuit voltage for resistance projection." });
    } else if (!isUsable(resistance) || resistance <= 0) {
      warnings.push({ code: "EXTERNAL_RESISTANCE_REQUIRED_FOR_PROJECTION", severity: "severe", message: "Enter a positive candidate external resistance for resistance projection." });
    } else if (!isUsable(internalResistance) || internalResistance <= 0) {
      warnings.push({ code: "INTERNAL_RESISTANCE_REQUIRED_FOR_PROJECTION", severity: "severe", message: "Enter measured total internal resistance or a documented sum of characterized resistance components." });
    } else {
      const currentA = inputs.openCircuitVoltageV / (resistance + internalResistance);
      currentMa = currentA * 1000;
      loadVoltageV = currentA * resistance;
      powerMw = currentA * currentA * resistance * 1000;
      recommendedExternalResistanceOhm = internalResistance;
      theoreticalPeakPowerMw = (inputs.openCircuitVoltageV * inputs.openCircuitVoltageV / (4 * internalResistance)) * 1000;
      confidence = "model_estimate";
      method = "Resistance projection: I = OCV/(Rext + Rint); Vload = I×Rext; Pload = I²Rext";
      warnings.push({
        code: "SIMPLIFIED_INTERNAL_RESISTANCE_MODEL",
        severity: "warning",
        message: "This local circuit estimate does not reproduce biological change or nonlinear electrode and mass-transfer losses. Confirm the load with a polarization experiment.",
      });
    }
  } else if (inputs.loadMode === "open_circuit") {
    warnings.push({ code: "OPEN_CIRCUIT_NO_LOAD", severity: "note", message: "Open-circuit voltage is displayed separately and is never used as loaded voltage." });
  } else if (inputs.loadMode === "short_circuit") {
    warnings.push({ code: "NO_HARVESTABLE_POWER", severity: "warning", message: "A short circuit does not provide harvestable power through an external load." });
  } else if (isUsable(resistance) && resistance <= 0) {
    warnings.push({ code: "INVALID_RESISTANCE", severity: "severe", message: "External resistance must be greater than zero for a resistor-loaded calculation." });
  } else if (isUsable(voltage) && isUsable(resistance)) {
    currentMa = (voltage / resistance) * 1000;
    powerMw = (voltage * voltage / resistance) * 1000;
    loadVoltageV = voltage;
    confidence = "measured";
    method = "Loaded voltage and resistance: I = V/R; P = V²/R";
    if (isUsable(measuredCurrent)) {
      const difference = relativeDifference(measuredCurrent, currentMa);
      if (difference > 0.25) warnings.push({ code: "SEVERE_CURRENT_RECONCILIATION_CONFLICT", severity: "severe", message: `Measured current differs from V/R by ${(difference * 100).toFixed(1)}%. Both values are preserved.` });
      else if (difference > 0.05) warnings.push({ code: "CURRENT_RECONCILIATION_WARNING", severity: "warning", message: `Measured current differs from V/R by ${(difference * 100).toFixed(1)}%. Check load and timing.` });
    }
  } else if (isUsable(voltage) && isUsable(measuredCurrent)) {
    currentMa = measuredCurrent;
    powerMw = voltage * measuredCurrent;
    loadVoltageV = voltage;
    confidence = "measured";
    method = "Loaded voltage and measured current: P = V × I";
  } else if (isUsable(measuredCurrent) && isUsable(resistance)) {
    currentMa = measuredCurrent;
    powerMw = (measuredCurrent * measuredCurrent * resistance) / 1000;
    loadVoltageV = (measuredCurrent / 1000) * resistance;
    confidence = "measured";
    method = "Measured current and resistance: P = I²R";
  } else if (inputs.loadMode === "resistor") {
    warnings.push({ code: "INSUFFICIENT_ELECTRICAL_INPUTS", severity: "note", message: "Enter loaded voltage with resistance, or loaded voltage with measured current, to calculate power." });
  }

  let currentDensityMaM2: number | null = null;
  let powerDensityMwM2: number | null = null;
  if (isUsable(inputs.areaCm2)) {
    if (inputs.areaCm2 <= 0) warnings.push({ code: "INVALID_ELECTRODE_AREA", severity: "severe", message: "Exposed electrode area must be greater than zero." });
    else if (inputs.areaBasis === "unknown") warnings.push({ code: "AREA_BASIS_REQUIRED", severity: "warning", message: "Select an area-normalization basis before calculating current or power density." });
    else {
      const areaM2 = inputs.areaCm2 * 0.0001;
      if (isUsable(currentMa)) currentDensityMaM2 = currentMa / areaM2;
      if (isUsable(powerMw)) powerDensityMwM2 = powerMw / areaM2;
    }
  }

  let codRemovalPercent: number | null = null;
  if (isUsable(inputs.codInMgL) || isUsable(inputs.codOutMgL)) {
    if (!isUsable(inputs.codInMgL) || inputs.codInMgL <= 0) warnings.push({ code: "INVALID_INITIAL_COD", severity: "severe", message: "Initial COD must be greater than zero to calculate COD removal." });
    else if (!isUsable(inputs.codOutMgL)) warnings.push({ code: "FINAL_COD_REQUIRED", severity: "note", message: "Enter final COD to calculate treatment removal." });
    else {
      codRemovalPercent = ((inputs.codInMgL - inputs.codOutMgL) / inputs.codInMgL) * 100;
      if (codRemovalPercent < 0) warnings.push({ code: "COD_INCREASED", severity: "warning", message: "Final COD exceeds initial COD; the negative removal value is retained for investigation." });
    }
  }

  const energyMwh = isUsable(powerMw) && isUsable(inputs.durationHours) && inputs.durationHours > 0 ? powerMw * inputs.durationHours : null;

  return {
    currentMa,
    powerMw,
    currentDensityMaM2,
    powerDensityMwM2,
    codRemovalPercent,
    energyMwh,
    loadVoltageV,
    internalResistanceOhm: calculationMode === "projected" ? internalResistance : null,
    bridgeResistanceOhm: inputs.bridgeResistanceOhm ?? null,
    recommendedExternalResistanceOhm,
    theoreticalPeakPowerMw,
    confidence,
    method,
    areaBasis: inputs.areaBasis,
    warnings,
  };
}

export function estimateBridgeResistanceOhm({ conductivityMsCm, lengthCm, diameterCm }: { conductivityMsCm: number | null; lengthCm: number | null; diameterCm: number | null }) {
  if (!isUsable(conductivityMsCm) || conductivityMsCm <= 0 || !isUsable(lengthCm) || lengthCm <= 0 || !isUsable(diameterCm) || diameterCm <= 0) return null;
  const conductivitySm = conductivityMsCm * 0.1;
  const lengthM = lengthCm / 100;
  const radiusM = diameterCm / 200;
  return lengthM / (conductivitySm * Math.PI * radiusM * radiusM);
}

export function sumCharacterizedResistanceOhm(values: Array<number | null>, bridgeResistanceOhm: number | null, includeBridge: boolean) {
  const supplied = values.filter(isUsable);
  if (supplied.some((value) => value < 0) || (includeBridge && isUsable(bridgeResistanceOhm) && bridgeResistanceOhm < 0)) return null;
  const sum = supplied.reduce((total, value) => total + value, 0);
  const bridge = includeBridge && isUsable(bridgeResistanceOhm) ? bridgeResistanceOhm : 0;
  return supplied.length > 0 || bridge > 0 ? sum + bridge : null;
}

export function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
