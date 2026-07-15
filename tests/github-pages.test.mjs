import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build contains five linked page entries", async () => {
  const pages = [
    ["index.html", "home"],
    ["research.html", "research"],
    ["experiment.html", "experiment"],
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
  for (const href of ["research.html", "experiment.html", "digital-twin.html", "about.html"]) {
    assert.match(bundle, new RegExp(href.replace(".", "\\.")));
  }
});

test("historical MFC images are included in the static artifact", async () => {
  await Promise.all([
    access("github-dist/images/historical-mfc-setup.png"),
    access("github-dist/images/graphite-electrodes.png"),
    access("github-dist/images/voltage-evidence.png"),
    access("github-dist/og.png"),
  ]);
});
