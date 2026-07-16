import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the BioVolt AI cover", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>BioVolt AI \| From microbial metabolism/i);
  assert.match(html, /From microbial/);
  assert.match(html, /measurable electricity/);
  assert.match(html, /Research/);
  assert.match(html, /Experiment/);
  assert.match(html, /Digital twin/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server-renders every connected research page", async () => {
  const routes = [
    ["/research", /14 verified records/],
    ["/experiment", /recovered experiment becomes structured evidence/],
    ["/registry", /One trustworthy row at a time/],
    ["/digital-twin", /Intelligence for living electricity/],
    ["/about", /Build slowly enough to remain scientifically useful/],
  ];

  for (const [path, expected] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }
});

test("publishes the complete literature register and researcher profile", async () => {
  const research = await render("/research");
  const researchHtml = await research.text();
  assert.match(researchHtml, /BV-LIT-011/);
  assert.match(researchHtml, /BV-LIT-012/);
  assert.match(researchHtml, /BV-SUP-002/);
  assert.match(researchHtml, /10\.15171\/ijb\.1608/);
  assert.match(researchHtml, /10\.1080\/08927014\.2011\.564615/);
  assert.match(researchHtml, /Literature-audit stage/);
  assert.match(researchHtml, /16.*Condition rows/s);
  assert.match(researchHtml, /Download evidence matrix/);
  assert.match(researchHtml, /6.*Primary research/s);
  assert.match(researchHtml, /6.*Review papers/s);

  const experiment = await render("/experiment");
  const experimentHtml = await experiment.text();
  assert.match(experimentHtml, /Growth kinetics of the halophile/);
  assert.match(experimentHtml, /Biochemical characterization/);
  assert.match(experimentHtml, /Triple sugar iron/);
  assert.match(experimentHtml, /approximately 0\.61 V/i);

  const registry = await render("/registry");
  const registryHtml = await registry.text();
  assert.match(registryHtml, /FastAPI \+ SQLite/);
  assert.match(registryHtml, /Short-circuit MFC/);
  assert.match(registryHtml, /Download CSV row/);

  const home = await render();
  assert.match(await home.text(), /Introduction by Yatharth Sharma/);

  const about = await render("/about");
  assert.match(await about.text(), /linkedin\.com\/in\/yatharth-sharma-a13395288/);
});

test("removes the starter preview and ships project metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /HomeView/);
  assert.match(layout, /BioVolt AI/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
  await access(new URL("public/og.png", projectRoot));
});
