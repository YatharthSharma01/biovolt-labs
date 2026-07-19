import assert from "node:assert/strict";
import fs from "node:fs/promises";

const manifestUrl = new URL("../docs/calculator/benchmark-adjudication.json", import.meta.url);
const manifest = JSON.parse(await fs.readFile(manifestUrl, "utf8"));
const decisions = manifest.decisions;

assert.equal(manifest.phase, 2);
assert.equal(decisions.length, 16, "All 16 audited conditions must receive a Phase 2 decision.");
assert.equal(new Set(decisions.map((row) => row.conditionId)).size, decisions.length, "Condition IDs must be unique.");

for (const row of decisions) {
  assert.ok(row.paperRecord, `${row.conditionId}: missing paper record`);
  assert.ok(row.sourceUrl.startsWith("https://"), `${row.conditionId}: missing public citation URL`);
  assert.ok(Array.isArray(row.allowedMetrics), `${row.conditionId}: allowedMetrics must be an array`);
  assert.ok(Array.isArray(row.warnings), `${row.conditionId}: warnings must be an array`);
  assert.equal(row.powerPooling, false, `${row.conditionId}: power pooling is not cleared in Phase 2`);
  assert.equal(row.codPooling, false, `${row.conditionId}: COD pooling is not cleared in Phase 2`);
  assert.equal(row.formulaFixture, false, `${row.conditionId}: no literature row is an exact formula fixture`);
}

const powerReady = decisions.filter((row) => row.powerSimilarity);
const codReady = decisions.filter((row) => row.codSimilarity);
const privateRows = decisions.filter((row) => row.access === "Private reviewed");
const contextOnly = decisions.filter((row) => row.decision === "context_only");

assert.equal(powerReady.length, manifest.summary.powerSimilarityReadyConditions);
assert.equal(codReady.length, manifest.summary.codSimilarityReadyConditions);
assert.equal(privateRows.length, manifest.summary.privateReviewedConditions);
assert.equal(contextOnly.length, manifest.summary.contextOnlyConditions);
assert.equal(new Set(powerReady.map((row) => row.paperRecord)).size, 1, "Power references currently come from one paper only.");
assert.equal(decisions.some((row) => row.powerPooling || row.codPooling), false);
assert.equal(manifest.globalRules.allowPooledPowerEstimate, false);
assert.equal(manifest.globalRules.allowPooledCodEstimate, false);
assert.equal(manifest.globalRules.allowMachineLearningPrediction, false);

for (const row of privateRows) {
  assert.ok(row.warnings.includes("PRIVATE_SOURCE_NO_REDISTRIBUTION"));
  assert.notEqual(row.sourceUrl.toLowerCase().endsWith(".pdf"), true, "Private source must not link to a hosted PDF.");
}

const yeast = decisions.find((row) => row.conditionId === "BV-LIT-007-YEAST-AU");
assert.ok(yeast.warnings.includes("OPEN_CIRCUIT_NOT_LOADED"));
assert.equal(yeast.powerSimilarity, false);

for (const id of ["BV-LIT-012-SHORT", "BV-LIT-012-MES"]) {
  const row = decisions.find((entry) => entry.conditionId === id);
  assert.ok(row.warnings.includes("NO_HARVESTABLE_POWER"));
  assert.equal(row.powerReference, false);
}

console.log(`Phase 2 evidence gate verified: ${decisions.length} conditions, ${powerReady.length} power-reference matches, ${codReady.length} COD-reference matches, no pooled estimates.`);
