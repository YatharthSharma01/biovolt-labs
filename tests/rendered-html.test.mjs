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

test("server-renders the BioVolt Labs cover", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>BioVolt Labs \| From microbial metabolism/i);
  assert.doesNotMatch(html, /BioVolt AI/);
  assert.match(html, /From microbial/);
  assert.match(html, /measurable electricity/);
  assert.match(html, /Research/);
  assert.match(html, /Experiment/);
  assert.match(html, /Digital twin/);
  assert.match(html, /laboratory experiments/);
  assert.doesNotMatch(html, /historical evidence|historical experiments/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server-renders every connected research page", async () => {
  const routes = [
    ["/research", /14 verified records/],
    ["/experiment", /recovered experiment becomes structured evidence/],
    ["/digital-twin", /Intelligence for living electricity/],
    ["/about", /Before an MFC can be predicted/],
  ];

  for (const [path, expected] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }

  const about = await render("/about");
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /mailto:yatharth\.01sharma@gmail\.com/);
  assert.match(aboutHtml, /linkedin\.com\/in\/yatharth-sharma-a13395288/);
  assert.doesNotMatch(aboutHtml, /Open-source repository/);
});

test("publishes the complete literature register and researcher profile", async () => {
  const research = await render("/research");
  const researchHtml = await research.text();
  assert.match(researchHtml, /BV-LIT-011/);
  assert.match(researchHtml, /BV-LIT-012/);
  assert.match(researchHtml, /BV-SUP-002/);
  assert.match(researchHtml, /10\.15171\/ijb\.1608/);
  assert.match(researchHtml, /10\.1080\/08927014\.2011\.564615/);
  assert.doesNotMatch(researchHtml, /Literature-audit stage/);
  assert.doesNotMatch(researchHtml, /Download evidence matrix/);
  assert.match(researchHtml, /6.*Primary research/s);
  assert.match(researchHtml, /6.*Review papers/s);
  assert.match(researchHtml, /Standard citation/);
  assert.match(researchHtml, /Ankisha Vijay, Shivam Arora, Sandeep Gupta &amp; Meenu Chhabra/);

  const experiment = await render("/experiment");
  const experimentHtml = await experiment.text();
  assert.match(experimentHtml, /Growth kinetics of the halophile/);
  assert.match(experimentHtml, /Biochemical characterization/);
  assert.match(experimentHtml, /Triple sugar iron/);
  assert.match(experimentHtml, /1\.21 mV/);
  assert.match(experimentHtml, /50 mL enrichment culture/);
  assert.match(experimentHtml, /final anodic working volume of 280 mL/);
  assert.match(experimentHtml, /continuous voltage time-series dataset was not recorded/);
  assert.match(experimentHtml, /72.*hours \/ recorded MFC test duration/s);
  assert.match(experimentHtml, /external circuit provides the pathway for electron flow/i);
  assert.doesNotMatch(experimentHtml, /Uploaded-paper audit \/ selectable protocol/);
  assert.doesNotMatch(experimentHtml, /Select a monitoring profile/);
  assert.doesNotMatch(experimentHtml, /No universal duration/);
  assert.doesNotMatch(experimentHtml, /Proposed BioVolt measurement contract/);
  assert.doesNotMatch(experimentHtml, /ALI-2017-HOURLY/);
  assert.doesNotMatch(experimentHtml, /VIJAY-2018-5DAY/);
  assert.match(experimentHtml, /biovolt-labs-literature-backed-mfc-workbook\.xlsx/);
  assert.match(experimentHtml, /Redox reactions of the microbial fuel cell/);
  assert.match(experimentHtml, /C<sub>6<\/sub>H<sub>12<\/sub>O<sub>6<\/sub> \+ 6H<sub>2<\/sub>O/);
  assert.match(experimentHtml, /double-chamber-mfc-setup\.jpg/);
  assert.match(experimentHtml, /Isolate halophilic colonies/);
  assert.match(experimentHtml, /Purify and characterize the isolates/);
  assert.match(experimentHtml, /Prepare the enrichment culture/);
  assert.match(experimentHtml, /280 mL anodic working volume/);
  assert.match(experimentHtml, /Operate and measure electrical output/);
  assert.doesNotMatch(experimentHtml, /Recorded volume discrepancy/);
  assert.doesNotMatch(experimentHtml, /0\.56%|1:179/);
  assert.doesNotMatch(experimentHtml, /<b>Select<\/b>/);
  assert.doesNotMatch(experimentHtml, /historical-mfc-setup\.png/);
  assert.match(experimentHtml, /dimensions of 6 × 1 × 1 cm/);
  assert.doesNotMatch(experimentHtml, /test duration \/ 48 H/);
  assert.doesNotMatch(experimentHtml, /presentation/i);
  assert.doesNotMatch(experimentHtml, /Scope note/);
  assert.doesNotMatch(experimentHtml, /Partially complete/);
  assert.doesNotMatch(experimentHtml, /Evidence status/);
  assert.doesNotMatch(experimentHtml, /Action required/);
  assert.doesNotMatch(experimentHtml, /biovolt-labs-72-hour-mfc-template\.xlsx/);

  const twin = await render("/digital-twin");
  const twinHtml = await twin.text();
  assert.match(twinHtml, /Choose the evidence-compatible clock/);
  assert.match(twinHtml, /cannot assume that every reactor follows one 72-hour window/);
  assert.match(twinHtml, /No universal duration/);
  assert.match(twinHtml, /ALI-2017-HOURLY/);
  assert.match(twinHtml, /VIJAY-2018-5DAY/);

  const home = await render();
  const homeHtml = await home.text();
  assert.match(homeHtml, /Introduction of MFC/);
  assert.doesNotMatch(homeHtml, />Registry</);

  const about = await render("/about");
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /linkedin\.com\/in\/yatharth-sharma-a13395288/);
  assert.match(aboutHtml, /github\.com\/YatharthSharma01\/biovolt-labs/);
  assert.doesNotMatch(aboutHtml, /github\.com\/YatharthSharma01\/biovolt-ai/);
  assert.match(aboutHtml, /laboratory experiment is a production-ready digital twin/i);
  assert.doesNotMatch(aboutHtml, /historical evidence/i);
});

test("removes the starter preview and ships project metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /HomeView/);
  assert.match(layout, /BioVolt Labs/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
  await access(new URL("public/og.png", projectRoot));
});
