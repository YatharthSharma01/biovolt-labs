import assert from "node:assert/strict";
import test from "node:test";
import { calculateMfc } from "../app/calculatorEngine.ts";
import { findEvidenceReference } from "../app/calculatorEvidence.ts";

const base = {
  loadMode: "resistor",
  loadedVoltageV: null,
  measuredCurrentMa: null,
  openCircuitVoltageV: null,
  externalResistanceOhm: null,
  areaCm2: null,
  areaBasis: "unknown",
  codInMgL: null,
  codOutMgL: null,
  durationHours: null,
};

test("measured validation example reproduces the Phase 1 expected values", () => {
  const result = calculateMfc({
    ...base,
    loadedVoltageV: 0.5,
    measuredCurrentMa: 0.5,
    externalResistanceOhm: 1000,
    areaCm2: 25,
    areaBasis: "anode_geometric",
    codInMgL: 1000,
    codOutMgL: 400,
    durationHours: 24,
  });
  assert.equal(result.currentMa, 0.5);
  assert.equal(result.powerMw, 0.25);
  assert.equal(result.currentDensityMaM2, 200);
  assert.equal(result.powerDensityMwM2, 100);
  assert.equal(result.codRemovalPercent, 60);
  assert.equal(result.energyMwh, 6);
  assert.deepEqual(result.warnings, []);
});

test("open-circuit voltage is never substituted for loaded voltage", () => {
  const result = calculateMfc({ ...base, loadMode: "open_circuit", openCircuitVoltageV: 0.67, externalResistanceOhm: 100 });
  assert.equal(result.currentMa, null);
  assert.equal(result.powerMw, null);
  assert.ok(result.warnings.some((warning) => warning.code === "OPEN_CIRCUIT_NO_LOAD"));
});

test("unknown area basis blocks density while retaining electrical power", () => {
  const result = calculateMfc({ ...base, loadedVoltageV: 0.5, externalResistanceOhm: 1000, areaCm2: 25 });
  assert.equal(result.powerMw, 0.25);
  assert.equal(result.powerDensityMwM2, null);
  assert.ok(result.warnings.some((warning) => warning.code === "AREA_BASIS_REQUIRED"));
});

test("halophile acetate configuration returns a single cited power reference", () => {
  const reference = findEvidenceReference({
    organism: "halophil",
    substrate: "sodium acetate",
    anodeMaterial: "stainless-steel mesh",
    cathodeMaterial: "carbon felt",
    reactorArchitecture: "double_chamber",
    loadMode: "resistor",
    externalResistanceOhm: 100,
    salinityGL: 40,
    temperatureC: 37,
    ph: 7,
  }, "power");
  assert.equal(reference.tier, "low");
  assert.equal(reference.conditionId, "BV-LIT-011-40");
  assert.equal(reference.value, 162.09);
  assert.ok(reference.warnings.includes("SINGLE_STUDY_REFERENCE"));
});

test("unsupported electricity configuration refuses a numerical reference", () => {
  const reference = findEvidenceReference({
    organism: "other",
    substrate: "other",
    anodeMaterial: "other",
    cathodeMaterial: "other",
    reactorArchitecture: "other",
    loadMode: "resistor",
    externalResistanceOhm: 750,
    salinityGL: 100,
    temperatureC: 55,
    ph: 4,
  }, "power");
  assert.equal(reference.tier, "outside_domain");
  assert.equal(reference.value, null);
});
