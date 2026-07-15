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
    ["/research", /11 core papers/],
    ["/experiment", /recovered experiment becomes structured evidence/],
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
  assert.match(researchHtml, /BV-SUP-002/);
  assert.match(researchHtml, /13.*Total deck entries/s);

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
