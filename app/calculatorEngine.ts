export type LoadMode = "resistor" | "open_circuit" | "short_circuit";
export type AreaBasis = "anode_geometric" | "cathode_geometric" | "projected" | "specific" | "unknown";

export type CalculatorInputs = {
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
  method: string | null;
  areaBasis: AreaBasis;
  warnings: CalculatorWarning[];
};

const isUsable = (value: number | null): value is number =>
  value !== null && Number.isFinite(value);

const relativeDifference = (observed: number, expected: number) => {
  const scale = Math.max(Math.abs(observed), Math.abs(expected), 1e-12);
  return Math.abs(observed - expected) / scale;
};

export function calculateMfc(inputs: CalculatorInputs): CalculatorResult {
  const warnings: CalculatorWarning[] = [];
  let currentMa: number | null = null;
  let powerMw: number | null = null;
  let method: string | null = null;

  const voltage = inputs.loadedVoltageV;
  const measuredCurrent = inputs.measuredCurrentMa;
  const resistance = inputs.externalResistanceOhm;

  if (inputs.loadMode === "open_circuit") {
    warnings.push({
      code: "OPEN_CIRCUIT_NO_LOAD",
      severity: "note",
      message: "Open-circuit voltage is displayed separately and is never used as loaded voltage.",
    });
  } else if (inputs.loadMode === "short_circuit") {
    warnings.push({
      code: "NO_HARVESTABLE_POWER",
      severity: "warning",
      message: "A short circuit does not provide harvestable power through an external load.",
    });
  } else if (isUsable(resistance) && resistance <= 0) {
    warnings.push({
      code: "INVALID_RESISTANCE",
      severity: "severe",
      message: "External resistance must be greater than zero for a resistor-loaded calculation.",
    });
  } else if (isUsable(voltage) && isUsable(resistance)) {
    currentMa = (voltage / resistance) * 1000;
    powerMw = (voltage * voltage / resistance) * 1000;
    method = "Loaded voltage and resistance: I = V/R; P = V²/R";

    if (isUsable(measuredCurrent)) {
      const difference = relativeDifference(measuredCurrent, currentMa);
      if (difference > 0.25) {
        warnings.push({
          code: "SEVERE_CURRENT_RECONCILIATION_CONFLICT",
          severity: "severe",
          message: `Measured current differs from V/R by ${(difference * 100).toFixed(1)}%. Both values are preserved.`,
        });
      } else if (difference > 0.05) {
        warnings.push({
          code: "CURRENT_RECONCILIATION_WARNING",
          severity: "warning",
          message: `Measured current differs from V/R by ${(difference * 100).toFixed(1)}%. Check load and timing.`,
        });
      }
    }
  } else if (isUsable(voltage) && isUsable(measuredCurrent)) {
    currentMa = measuredCurrent;
    powerMw = voltage * measuredCurrent;
    method = "Loaded voltage and measured current: P = V × I";
  } else if (isUsable(measuredCurrent) && isUsable(resistance)) {
    currentMa = measuredCurrent;
    powerMw = (measuredCurrent * measuredCurrent * resistance) / 1000;
    method = "Measured current and resistance: P = I²R";
  } else if (inputs.loadMode === "resistor") {
    warnings.push({
      code: "INSUFFICIENT_ELECTRICAL_INPUTS",
      severity: "note",
      message: "Enter loaded voltage with resistance, or loaded voltage with measured current, to calculate power.",
    });
  }

  let currentDensityMaM2: number | null = null;
  let powerDensityMwM2: number | null = null;
  if (isUsable(inputs.areaCm2)) {
    if (inputs.areaCm2 <= 0) {
      warnings.push({
        code: "INVALID_ELECTRODE_AREA",
        severity: "severe",
        message: "Exposed electrode area must be greater than zero.",
      });
    } else if (inputs.areaBasis === "unknown") {
      warnings.push({
        code: "AREA_BASIS_REQUIRED",
        severity: "warning",
        message: "Select an area-normalization basis before calculating current or power density.",
      });
    } else {
      const areaM2 = inputs.areaCm2 * 0.0001;
      if (isUsable(currentMa)) currentDensityMaM2 = currentMa / areaM2;
      if (isUsable(powerMw)) powerDensityMwM2 = powerMw / areaM2;
    }
  }

  let codRemovalPercent: number | null = null;
  if (isUsable(inputs.codInMgL) || isUsable(inputs.codOutMgL)) {
    if (!isUsable(inputs.codInMgL) || inputs.codInMgL <= 0) {
      warnings.push({
        code: "INVALID_INITIAL_COD",
        severity: "severe",
        message: "Initial COD must be greater than zero to calculate COD removal.",
      });
    } else if (!isUsable(inputs.codOutMgL)) {
      warnings.push({
        code: "FINAL_COD_REQUIRED",
        severity: "note",
        message: "Enter final COD to calculate treatment removal.",
      });
    } else {
      codRemovalPercent = ((inputs.codInMgL - inputs.codOutMgL) / inputs.codInMgL) * 100;
      if (codRemovalPercent < 0) {
        warnings.push({
          code: "COD_INCREASED",
          severity: "warning",
          message: "Final COD exceeds initial COD; the negative removal value is retained for investigation.",
        });
      }
    }
  }

  const energyMwh = isUsable(powerMw) && isUsable(inputs.durationHours) && inputs.durationHours > 0
    ? powerMw * inputs.durationHours
    : null;

  return {
    currentMa,
    powerMw,
    currentDensityMaM2,
    powerDensityMwM2,
    codRemovalPercent,
    energyMwh,
    method,
    areaBasis: inputs.areaBasis,
    warnings,
  };
}

export function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
