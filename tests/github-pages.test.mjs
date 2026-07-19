import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build contains six linked page entries", async () => {
  const pages = [
    ["index.html", "home"],
    ["research.html", "research"],
    ["experiment.html", "experiment"],
    ["calculator.html", "calculator"],
    ["digital-twin.html", "twin"],
    ["about.html", "about"],
  ];

  for (const [file, page] of pages) {
    const html = await readFile(`github-dist/${file}`, "utf8");
    assert.match(html, /<div id="root"><\/div>/, file);
    assert.match(html, /\.\/assets\/[^\"]+\.js/, file);
    assert.match(html, new RegExp(`data-page="${page}"`), file);
    assert.match(html, /BioVolt AI/, file);
  }
});

test("static navigation points to every research article", async () => {
  const html = await readFile("github-dist/index.html", "utf8");
  const scriptPath = html.match(/src="(\.\/assets\/[^\"]+\.js)"/)?.[1];
  assert.ok(scriptPath);
  const bundle = await readFile(`github-dist/${scriptPath.slice(2)}`, "utf8");
  for (const href of ["research.html", "experiment.html", "calculator.html", "digital-twin.html", "about.html"]) {
    assert.match(bundle, new RegExp(href.replace(".", "\\.")));
  }
  assert.doesNotMatch(bundle, /registry\.html/);
  assert.doesNotMatch(bundle, /Literature-audit stage/);
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
    "Compare with literature",
    "Outside evidence domain",
    "No numerical estimate produced",
    "OPEN_CIRCUIT_NO_LOAD",
  ]) assert.match(bundle, new RegExp(phrase));
});
