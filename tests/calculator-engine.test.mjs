import assert from "node:assert/strict";
import test from "node:test";
import { calculateMfc, estimateBridgeResistanceOhm, sumCharacterizedResistanceOhm } from "../app/calculatorEngine.ts";
import { interpretSubstrateConcentration } from "../app/calculatorResearch.ts";
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

test("resistance projection uses OCV, Rext and total Rint without changing measured mode", () => {
  const result = calculateMfc({
    ...base,
    calculationMode: "projected",
    openCircuitVoltageV: 0.7,
    externalResistanceOhm: 500,
    internalResistanceOhm: 500,
    areaCm2: 10,
    areaBasis: "anode_geometric",
  });
  assert.equal(result.currentMa, 0.7);
  assert.equal(result.loadVoltageV, 0.35);
  assert.equal(result.powerMw, 0.245);
  assert.equal(result.powerDensityMwM2, 245);
  assert.equal(result.recommendedExternalResistanceOhm, 500);
  assert.equal(result.confidence, "model_estimate");
});

test("salt bridge calculation is explicitly a bridge-only component", () => {
  const bridge = estimateBridgeResistanceOhm({ conductivityMsCm: 1, lengthCm: 6, diameterCm: 1 });
  assert.ok(Math.abs(bridge - 7639.437268410976) < 1e-9);
  assert.equal(sumCharacterizedResistanceOhm([80, 120, 150, 100], 50, true), 500);
});

test("substrate concentration changes audited interpretation, not V/R arithmetic", () => {
  const optimum = interpretSubstrateConcentration({ organism: "pseudomonas aeruginosa", substrate: "glucose", concentrationGL: 3, reactorArchitecture: "double_chamber" });
  const inhibited = interpretSubstrateConcentration({ organism: "pseudomonas aeruginosa", substrate: "glucose", concentrationGL: 4, reactorArchitecture: "double_chamber" });
  assert.equal(optimum.match, "strong");
  assert.match(inhibited.headline, /inhibition/i);
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
