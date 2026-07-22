import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build contains seven linked page entries", async () => {
  const pages = [
    ["index.html", "home"],
    ["research.html", "research"],
    ["experiment.html", "experiment"],
    ["protocol.html", "protocol"],
    ["calculator.html", "calculator"],
    ["digital-twin.html", "twin"],
    ["about.html", "about"],
  ];

  for (const [file, page] of pages) {
    const html = await readFile(`github-dist/${file}`, "utf8");
    assert.match(html, /<div id="root"><\/div>/, file);
    assert.match(html, /\.\/assets\/[^\"]+\.js/, file);
    assert.match(html, new RegExp(`data-page="${page}"`), file);
    assert.match(html, /BioVolt Labs/, file);
  }
});

test("static navigation points to every research article", async () => {
  const html = await readFile("github-dist/index.html", "utf8");
  const scriptPath = html.match(/src="(\.\/assets\/[^\"]+\.js)"/)?.[1];
  assert.ok(scriptPath);
  const bundle = await readFile(`github-dist/${scriptPath.slice(2)}`, "utf8");
  for (const href of ["research.html", "experiment.html", "protocol.html", "calculator.html", "digital-twin.html", "about.html"]) {
    assert.match(bundle, new RegExp(href.replace(".", "\\.")));
  }
  assert.doesNotMatch(bundle, /registry\.html/);
  assert.doesNotMatch(bundle, /Literature-audit stage/);
  assert.match(bundle, /BioVolt Labs/);
  assert.doesNotMatch(bundle, /BioVolt AI/);
  assert.match(bundle, /laboratory experiments/);
  assert.doesNotMatch(bundle, /historical evidence|historical experiments|Historical laboratory record/i);
});

test("historical MFC images are included in the static artifact", async () => {
  await Promise.all([
    access("github-dist/images/historical-mfc-setup.png"),
    access("github-dist/images/graphite-electrodes.png"),
    access("github-dist/images/voltage-evidence.png"),
    access("github-dist/images/mfc-development-process-v2.png"),
    access("github-dist/images/halophile-growth-curve.png"),
    access("github-dist/images/halophile-water-gram.png"),
    access("github-dist/images/halophile-salt-gram.png"),
    access("github-dist/images/catalase-water.jpeg"),
    access("github-dist/images/tsi-test.jpeg"),
    access("github-dist/og.png"),
    access("github-dist/brands/github-invertocat-white.png"),
    access("github-dist/brands/linkedin-in-white.png"),
    access("github-dist/brands/x-logo-white.png"),
    access("github-dist/downloads/biovolt-labs-literature-backed-mfc-workbook.xlsx"),
  ]);
});

test("retired registry and audit surfaces are absent", async () => {
  await Promise.all([
    assert.rejects(access("github-dist/registry.html")),
    assert.rejects(access("github-dist/audit/literature-audit.csv")),
    assert.rejects(access("github-dist/audit/paper-register.csv")),
    assert.rejects(access("github-dist/audit/audit-manifest.json")),
  ]);
});

test("calculator bundle includes measured equations and evidence refusal language", async () => {
  const html = await readFile("github-dist/calculator.html", "utf8");
  const scriptPath = html.match(/src="(\.\/assets\/[^"]+\.js)"/)?.[1];
  assert.ok(scriptPath);
  const bundle = await readFile(`github-dist/${scriptPath.slice(2)}`, "utf8");
  for (const phrase of [
    "Calculate from measurements",
    "Project with internal resistance",
    "Compare with literature",
    "Bridge-only estimate",
    "No invented multiplier",
    "Outside evidence domain",
    "No numerical estimate produced",
    "OPEN_CIRCUIT_NO_LOAD",
    "Scientific trace",
    "Four tests protect four different failure points",
    "Reconciliation guardrail",
    "Domain refusal",
  ]) assert.match(bundle, new RegExp(phrase));
});

test("experiment page separates the incomplete record from literature monitoring profiles", async () => {
  const html = await readFile("github-dist/experiment.html", "utf8");
  const scriptPath = html.match(/src="(\.\/assets\/[^\"]+\.js)"/)?.[1];
  assert.ok(scriptPath);
  const bundle = await readFile(`github-dist/${scriptPath.slice(2)}`, "utf8");
  for (const phrase of [
    "Experimental conditions",
    "280 mL",
    "0.6 mM KMnO₄",
    "37 °C",
    "48–72 h",
    "≈0.56% (v/v)",
    "1:179",
    "No voltage time-series dataset is available",
    "No external resistance used",
    "1.21 mV",
    "Millivolts measure potential difference, not current",
    "72 hours is not treated as a completed condition or a standard",
    "The external circuit provides the pathway for electron flow",
    "Uploaded-paper audit / selectable protocol",
    "No universal duration",
    "ALI-2017-HOURLY",
    "VIJAY-2018-5DAY",
    "different intervals, but the exact interval was not reported",
    "test duration / incomplete record",
    "Download .xlsx",
    "should not be described as oxygen reduction",
    "Exposed area cannot be reconstructed responsibly",
  ]) assert.match(bundle, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(bundle, /Scope note/);
  assert.doesNotMatch(bundle, /Partially complete/);
  assert.doesNotMatch(bundle, /Evidence status/);
  assert.doesNotMatch(bundle, /Action required/);
  assert.doesNotMatch(bundle, /biovolt-labs-72-hour-mfc-template\.xlsx/);
});

test("protocol page exposes the evidence-separated Pseudomonas pilot", async () => {
  const html = await readFile("github-dist/protocol.html", "utf8");
  const scriptPath = html.match(/src="(\.\/assets\/[^\"]+\.js)"/)?.[1];
  assert.ok(scriptPath);
  const bundle = await readFile(`github-dist/${scriptPath.slice(2)}`, "utf8");
  for (const phrase of [
    "BV-PSEUDO-PILOT-01",
    "Source-matched core",
    "BioVolt pilot decisions",
    "0-49 h pilot window",
    "Every value needs a clock and a state",
    "This page is a measurement design",
    "github-invertocat-white.png",
    "linkedin-in-white.png",
    "x-logo-white.png",
  ]) assert.match(bundle, new RegExp(phrase));
});

test("research register exposes the corrected 2018 authors and standardized citation", async () => {
  const html = await readFile("github-dist/research.html", "utf8");
  const scriptPath = html.match(/src="(\.\/assets\/[^\"]+\.js)"/)?.[1];
  assert.ok(scriptPath);
  const bundle = await readFile(`github-dist/${scriptPath.slice(2)}`, "utf8");
  assert.match(bundle, /Ankisha Vijay, Shivam Arora, Sandeep Gupta & Meenu Chhabra/);
  assert.match(bundle, /Standard citation/);
  assert.doesNotMatch(bundle, /Vijay, A\., Ghosh, P\. C\. & Mukherji, S\. \(2018\)/);
});
