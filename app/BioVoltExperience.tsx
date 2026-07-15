"use client";

/* eslint-disable @next/next/no-img-element -- shared with the static GitHub Pages build */

import { useEffect, useMemo, useRef, useState } from "react";

export type PageKey = "home" | "research" | "experiment" | "twin" | "about";
type PaperKind = "Review" | "Primary research";

const navItems: Array<{ key: PageKey; label: string; issue: string }> = [
  { key: "home", label: "Home", issue: "00" },
  { key: "research", label: "Research", issue: "01" },
  { key: "experiment", label: "Experiment", issue: "02" },
  { key: "twin", label: "Digital twin", issue: "03" },
  { key: "about", label: "About", issue: "04" },
];

const papers: Array<{
  kind: PaperKind;
  year: number;
  authors: string;
  title: string;
  focus: string;
  status: string;
  record: string;
}> = [
  {
    kind: "Review",
    year: 2023,
    authors: "Soumitra Nath et al.",
    title: "Microbial fuel cell: A state-of-the-art and revolutionizing technology for efficient energy recovery",
    focus: "Architecture / energy recovery",
    status: "Citation details to verify",
    record: "BV-LIT-001",
  },
  {
    kind: "Review",
    year: 2022,
    authors: "Jayesh M. Sonawane et al.",
    title: "Recent progress in microbial fuel cells using substrates from diverse sources",
    focus: "Substrates / performance",
    status: "Citation details to verify",
    record: "BV-LIT-002",
  },
  {
    kind: "Review",
    year: 2022,
    authors: "Nabil K. Abd-Elrahman et al.",
    title: "Applications of nanomaterials in microbial fuel cells",
    focus: "Electrodes / nanomaterials",
    status: "Citation details to verify",
    record: "BV-LIT-003",
  },
  {
    kind: "Primary research",
    year: 2016,
    authors: "Erick M. Bosire et al.",
    title: "Strain- and substrate-dependent redox mediator and electricity production by Pseudomonas aeruginosa",
    focus: "Pseudomonas / phenazines",
    status: "Citation details to verify",
    record: "BV-LIT-004",
  },
  {
    kind: "Primary research",
    year: 2017,
    authors: "Neem Ali et al.",
    title: "Characterization of Pseudomonas aeruginosa using glucose, fructose and sucrose in double-chamber MFCs",
    focus: "Pseudomonas / substrates",
    status: "Citation details to verify",
    record: "BV-LIT-005",
  },
  {
    kind: "Primary research",
    year: 2023,
    authors: "Ankisha Vijay et al.",
    title: "Power generation by halophilic bacteria and assessment of salinity in a denitrification MFC",
    focus: "Halophiles / salinity",
    status: "Citation details to verify",
    record: "BV-LIT-006",
  },
];

const growthData = [
  [0, 0], [2, 0.01], [4, 0.09], [6, 0.16], [25, 0.71], [27, 0.71],
  [29, 0.71], [31, 0.7], [33, 0.69], [48, 0.66], [50, 0.66],
];

const staticPageHrefs: Record<PageKey, string> = {
  home: "./index.html",
  research: "./research.html",
  experiment: "./experiment.html",
  twin: "./digital-twin.html",
  about: "./about.html",
};

const hostedPageHrefs: Record<PageKey, string> = {
  home: "/",
  research: "/research",
  experiment: "/experiment",
  twin: "/digital-twin",
  about: "/about",
};

function pageHref(page: PageKey, staticMode: boolean) {
  return staticMode ? staticPageHrefs[page] : hostedPageHrefs[page];
}

function SiteHeader({ active, staticMode = false, overHero = false }: {
  active: PageKey;
  staticMode?: boolean;
  overHero?: boolean;
}) {
  return (
    <header className={`site-header ${overHero ? "site-header--hero" : ""}`}>
      <a className="brand" href={pageHref("home", staticMode)} aria-label="BioVolt AI home">
        <span className="brand-mark">BV</span>
        <span className="brand-copy"><strong>BioVolt AI</strong><small>MFC research intelligence</small></span>
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.key} href={pageHref(item.key, staticMode)} className={active === item.key ? "is-active" : ""}>
            <sup>{item.issue}</sup>{item.label}
          </a>
        ))}
      </nav>
      <a className="header-index" href={pageHref("research", staticMode)}><span>Index</span><b>6 records</b></a>
    </header>
  );
}

function SiteFooter({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <footer className="journal-footer">
      <div className="footer-topline">
        <a className="footer-brand" href={pageHref("home", staticMode)}><span>BV</span> BioVolt AI</a>
        <p>Independent research platform / Edition 01 / 2026</p>
      </div>
      <div className="footer-grid">
        <div>
          <p className="footer-kicker">Author &amp; researcher</p>
          <h2>Yatharth Sharma</h2>
          <a className="footer-email" href="mailto:yatharth.01sharma@gmail.com">yatharth.01sharma@gmail.com</a>
        </div>
        <div className="footer-directory">
          <p className="footer-kicker">Directory</p>
          {navItems.slice(1).map((item) => <a key={item.key} href={pageHref(item.key, staticMode)}>{item.issue} — {item.label}</a>)}
        </div>
        <div>
          <p className="footer-kicker">Research profiles</p>
          <div className="social-row" aria-label="Research profiles">
            <a href="https://github.com/YatharthSharma01/biovolt-ai" target="_blank" rel="noreferrer" aria-label="BioVolt AI on GitHub">GH</a>
            <span aria-label="LinkedIn profile link pending" title="Profile link pending">in</span>
            <span aria-label="X profile link pending" title="Profile link pending">X</span>
          </div>
          <small className="profile-note">GitHub is live. LinkedIn and X can be connected when profile URLs are provided.</small>
        </div>
      </div>
      <div className="footer-bottom"><p>© 2026 Yatharth Sharma. All rights reserved.</p><p>Designed as a living research manuscript.</p></div>
    </footer>
  );
}

function FullPageReactor() {
  const stageRef = useRef<HTMLDivElement>(null);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stageRef.current?.style.setProperty("--hero-ry", `${x * 15}deg`);
    stageRef.current?.style.setProperty("--hero-rx", `${-y * 9}deg`);
  };

  return (
    <div className="hero-field" onPointerMove={move} onPointerLeave={() => {
      stageRef.current?.style.setProperty("--hero-ry", "-7deg");
      stageRef.current?.style.setProperty("--hero-rx", "4deg");
    }} aria-hidden="true">
      <div className="hero-grid" />
      <i className="float-object electron-ball e1" /><i className="float-object electron-ball e2" /><i className="float-object electron-ball e3" />
      <i className="float-object microbe-capsule m1" /><i className="float-object microbe-capsule m2" /><i className="float-object microbe-capsule m3" />
      <i className="float-object crystal c1" /><i className="float-object crystal c2" />
      <div className="wire-sphere"><i /><b /><span /></div>
      <div className="hero-orbit orbit-one"><i /></div><div className="hero-orbit orbit-two"><i /></div>
      <div className="hero-reactor-stage" ref={stageRef}>
        <div className="hero-wire wire-a" /><div className="hero-wire wire-b" /><div className="hero-wire wire-c" />
        <i className="travel-electron te1" /><i className="travel-electron te2" /><i className="travel-electron te3" />
        <div className="hero-chamber hero-anode"><div className="hero-liquid" /><div className="hero-electrode" /><span>ANODE</span><i /><b /><em /></div>
        <div className="hero-bridge"><i /><b /><em /></div>
        <div className="hero-chamber hero-cathode"><div className="hero-liquid" /><div className="hero-electrode" /><span>CATHODE</span><i /><b /></div>
        <div className="hero-load"><span>R<sub>ext</sub></span></div>
      </div>
      <div className="field-label label-electron">e− / external circuit</div>
      <div className="field-label label-proton">H+ / salt bridge</div>
      <div className="field-label label-organism">electrogenic biofilm</div>
    </div>
  );
}

function PageMasthead({ number, kicker, title, abstract }: { number: string; kicker: string; title: string; abstract: string }) {
  return (
    <section className="page-masthead">
      <div className="masthead-number">{number}</div>
      <div className="masthead-copy"><p className="journal-kicker">{kicker}</p><h1>{title}</h1><p className="masthead-abstract"><b>Abstract.</b> {abstract}</p></div>
      <aside><span>BioVolt AI</span><span>Research edition 01</span><span>15 July 2026</span></aside>
    </section>
  );
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="section-label"><span>{number}</span><p>{children}</p></div>;
}

function NextArticle({ page, label, staticMode }: { page: PageKey; label: string; staticMode: boolean }) {
  return <a className="next-article" href={pageHref(page, staticMode)}><span>Continue reading</span><strong>{label}</strong><i>↗</i></a>;
}

export function HomeView({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <main className="site-shell home-page">
      <section className="full-hero" id="top">
        <SiteHeader active="home" staticMode={staticMode} overHero />
        <FullPageReactor />
        <div className="hero-copy">
          <p className="hero-volume">Bioelectrochemical systems / Vol. 01</p>
          <h1>Intelligence for<br /><em>living electricity.</em></h1>
          <p className="hero-deck">A research-led microbial fuel cell platform connecting evidence, historical experiments and an explainable digital twin.</p>
          <div className="hero-actions">
            <a className="button button-light" href={pageHref("experiment", staticMode)}>Read the experiment <span>↗</span></a>
            <a className="button button-outline" href={pageHref("twin", staticMode)}>Open digital twin <span>↗</span></a>
          </div>
        </div>
        <div className="hero-figure-note"><b>Fig. 00</b><span>Conceptual double-chamber MFC. Move your pointer to inspect the field.</span></div>
        <div className="scroll-cue"><span>Scroll to abstract</span><i /></div>
      </section>

      <section className="issue-ledger">
        <div><span>System</span><strong>Double-chamber MFC</strong></div>
        <div><span>Organisms</span><strong>Halophiles / Pseudomonas</strong></div>
        <div><span>Evidence</span><strong>6 papers / 1 experiment</strong></div>
        <div><span>Model status</span><strong>Transparent demonstration</strong></div>
      </section>

      <article className="paper-spread home-abstract">
        <SectionLabel number="00.1">Editorial abstract</SectionLabel>
        <div className="lead-copy">
          <p className="drop-cap">Microbial fuel cells convert microbial metabolism into electrical current while treating organic matter. BioVolt AI is being built to make that complex system observable, comparable and eventually predictable.</p>
          <p>For now, the platform behaves like a carefully annotated research manuscript: every value is labelled by origin, uncertainty is visible, and illustrative model outputs are never presented as experimental truth.</p>
        </div>
        <aside className="margin-note"><b>Research principle</b><p>No prediction without provenance. No recommendation beyond the evidence domain.</p></aside>
      </article>

      <section className="paper-spread page-directory">
        <SectionLabel number="00.2">Contents</SectionLabel>
        <div className="directory-grid">
          {navItems.slice(1).map((item, index) => (
            <a key={item.key} href={pageHref(item.key, staticMode)}>
              <span>{item.issue}</span><p>{index === 0 ? "Literature register" : index === 1 ? "Historical laboratory record" : index === 2 ? "Predictive system preview" : "Project method & roadmap"}</p><h2>{item.label}</h2><i>Read article ↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="paper-spread evidence-feature">
        <SectionLabel number="00.3">Featured historical evidence</SectionLabel>
        <figure><img src={staticMode ? "images/historical-mfc-setup.png" : "/images/historical-mfc-setup.png"} alt="Historical double-chamber microbial fuel cell setup" /><figcaption><b>Figure 1.</b> College MFC apparatus documented in the source presentation. The experiment used graphite electrodes, a KNO3–agar bridge and KMnO4 catholyte.</figcaption></figure>
        <div className="feature-copy"><p className="journal-kicker">College record / image evidence</p><h2>The platform begins with the experiment that already exists.</h2><p>The first release recovers structure from Yatharth Sharma’s previous work while clearly marking missing units, unresolved electrode dimensions and image-derived readings.</p><a href={pageHref("experiment", staticMode)}>Open the full experimental record <span>↗</span></a></div>
      </section>
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

export function ResearchView({ staticMode = false }: { staticMode?: boolean }) {
  const [filter, setFilter] = useState<"All" | PaperKind>("All");
  const visible = useMemo(() => filter === "All" ? papers : papers.filter((paper) => paper.kind === filter), [filter]);
  return (
    <main className="site-shell paper-page">
      <SiteHeader active="research" staticMode={staticMode} />
      <PageMasthead number="01" kicker="Literature register / evidence before prediction" title="Research evidence, not a reading list." abstract="The library is designed to turn papers into structured experimental evidence: organisms, substrates, electrodes, operating conditions, outcomes and uncertainty." />
      <section className="paper-spread research-register">
        <SectionLabel number="01.1">Selected literature</SectionLabel>
        <div className="filter-row" aria-label="Filter research papers">
          {(["All", "Review", "Primary research"] as const).map((kind) => <button key={kind} className={filter === kind ? "is-active" : ""} onClick={() => setFilter(kind)}>{kind}<sup>{kind === "All" ? papers.length : papers.filter((p) => p.kind === kind).length}</sup></button>)}
        </div>
        <div className="paper-list">
          {visible.map((paper) => (
            <article className="citation-card" key={paper.record}>
              <div className="citation-meta"><span>{paper.record}</span><span>{paper.kind}</span><span>{paper.year}</span></div>
              <p className="authors">{paper.authors}</p><h2>{paper.title}</h2>
              <div className="citation-footer"><p><b>Evidence focus</b>{paper.focus}</p><p><b>Verification state</b>{paper.status}</p><span>DOI pending</span></div>
            </article>
          ))}
        </div>
      </section>
      <section className="paper-spread evidence-matrix-section">
        <SectionLabel number="01.2">Extraction matrix</SectionLabel>
        <div className="matrix-copy"><h2>What every uploaded paper will contribute.</h2><p>Full-text papers will be summarized into comparable fields. Citations will be verified before publication, and the original PDFs will not be redistributed.</p></div>
        <div className="evidence-table" role="table" aria-label="Research evidence extraction fields">
          {[['Biology','Organism / inoculum / mediator'],['Reactor','Architecture / volume / membrane'],['Operation','pH / temperature / HRT / resistance'],['Electrochemistry','Voltage / current / power density'],['Treatment','COD in / COD out / removal'],['Quality','Replicates / uncertainty / validation']].map(([group, fields]) => <div role="row" key={group}><b role="cell">{group}</b><span role="cell">{fields}</span><i role="cell">Required</i></div>)}
        </div>
      </section>
      <section className="paper-spread editorial-note"><SectionLabel number="01.3">Editorial policy</SectionLabel><blockquote>“Citation details to verify” is a safety label, not a finished citation.</blockquote><p>Once PDFs, DOI records or BibTeX files are supplied, the register will gain verified references, evidence tables and links between each claim and its source.</p></section>
      <NextArticle page="experiment" label="02 — College experiment" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

function GrowthCurve() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * scale)); canvas.height = Math.max(1, Math.floor(rect.height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const width = rect.width; const height = rect.height; const pad = { left: 52, right: 18, top: 24, bottom: 42 };
      const x = (v: number) => pad.left + (v / 50) * (width - pad.left - pad.right);
      const y = (v: number) => pad.top + (1 - v / 0.8) * (height - pad.top - pad.bottom);
      context.clearRect(0, 0, width, height); context.font = "11px ui-monospace, monospace";
      [0, .2, .4, .6, .8].forEach((tick) => { context.beginPath(); context.moveTo(pad.left, y(tick)); context.lineTo(width - pad.right, y(tick)); context.strokeStyle = "rgba(25,31,27,.14)"; context.stroke(); context.fillStyle = "#5c625d"; context.fillText(tick.toFixed(1), 13, y(tick) + 4); });
      [0, 10, 20, 30, 40, 50].forEach((tick) => { context.fillStyle = "#5c625d"; context.fillText(String(tick), x(tick) - 6, height - 13); });
      context.beginPath(); growthData.forEach(([time, absorbance], index) => index ? context.lineTo(x(time), y(absorbance)) : context.moveTo(x(time), y(absorbance))); context.strokeStyle = "#174ee6"; context.lineWidth = 2.5; context.stroke();
      growthData.forEach(([time, absorbance]) => { context.beginPath(); context.arc(x(time), y(absorbance), 3.5, 0, Math.PI * 2); context.fillStyle = "#f4f1e8"; context.fill(); context.strokeStyle = "#174ee6"; context.lineWidth = 2; context.stroke(); });
      context.fillStyle = "#5c625d"; context.fillText("Time value (unit unconfirmed)", width / 2 - 80, height - 1);
    };
    draw(); const observer = new ResizeObserver(draw); observer.observe(canvas); return () => observer.disconnect();
  }, []);
  return <canvas ref={canvasRef} className="growth-canvas" role="img" aria-label="Pseudomonas growth curve rising to 0.71 around time 25 to 29, then declining to 0.66 at time 50." />;
}

export function ExperimentView({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <main className="site-shell paper-page">
      <SiteHeader active="experiment" staticMode={staticMode} />
      <PageMasthead number="02" kicker="Historical laboratory record / college experiment" title="A recovered experiment becomes structured evidence." abstract="This record reconstructs the double-chamber MFC from presentation slides, photographs and a separate Pseudomonas growth workbook. Unknowns remain visible rather than being guessed." />
      <section className="paper-spread apparatus-layout">
        <SectionLabel number="02.1">Reactor apparatus</SectionLabel>
        <figure className="apparatus-figure"><img src={staticMode ? "images/historical-mfc-setup.png" : "/images/historical-mfc-setup.png"} alt="Historical double-chamber MFC apparatus" /><figcaption><b>Figure 2.</b> Historical MFC setup. The photograph is documentary evidence; it is not a calibrated dimensional record.</figcaption></figure>
        <div className="apparatus-spec">
          <p className="journal-kicker">Recorded configuration</p><h2>Double-chamber architecture</h2>
          <dl><div><dt>Anode</dt><dd>Halophilic broth + graphite rod</dd></div><div><dt>Cathode</dt><dd>KMnO4 solution + graphite rod</dd></div><div><dt>Ion pathway</dt><dd>KNO3 + agar salt bridge</dd></div><div><dt>External circuit</dt><dd>Image-derived voltage evidence</dd></div><div><dt>Observed reading</dt><dd>Approximately 0.61 V</dd></div></dl>
        </div>
      </section>
      <section className="paper-spread electrode-layout">
        <SectionLabel number="02.2">Electrode record</SectionLabel>
        <div className="electrode-copy"><p className="journal-kicker">Material note / unresolved dimension</p><h2>Graphite rod electrodes</h2><p>The product evidence identifies an Achalnath Tools graphite rod and lists 6 × 1 × 1 centimetres. The description also says “6-inch long,” creating a conflict that prevents reliable exposed-area calculation.</p><div className="warning-note"><b>Action required</b><span>Measure the surviving electrode or recover the original purchase specification before normalizing power density.</span></div></div>
        <figure><img src={staticMode ? "images/graphite-electrodes.png" : "/images/graphite-electrodes.png"} alt="Pair of pointed graphite rod electrodes" /><figcaption><b>Figure 3.</b> Graphite electrode reference recovered from the experimental presentation.</figcaption></figure>
      </section>
      <section className="paper-spread microbiology-layout">
        <SectionLabel number="02.3">Microbiology</SectionLabel>
        <article><span>A</span><p className="journal-kicker">Halophilic isolate</p><h2>Salt-tolerant inoculum</h2><p>Presentation evidence records halophilic broth and environmental isolate screening. Species identity, salinity and inoculum age still need laboratory notes.</p></article>
        <article><span>B</span><p className="journal-kicker">Pseudomonas record</p><h2>Growth-curve evidence</h2><p>A separate workbook contains 11 absorbance observations. The organism name is documented; time units, wavelength and replicate count are not.</p></article>
      </section>
      <section className="paper-spread growth-section">
        <SectionLabel number="02.4">Growth kinetics</SectionLabel>
        <div className="growth-heading"><h2>Pseudomonas growth curve</h2><p>Maximum recorded absorbance: <b>0.71</b> at time values 25–29. Final recorded absorbance: <b>0.66</b> at time 50.</p></div>
        <figure><GrowthCurve /><figcaption><b>Figure 4.</b> Reconstructed from the supplied spreadsheet. Axis units remain unconfirmed; the curve should not be merged with MFC performance records until experimental context is recovered.</figcaption></figure>
      </section>
      <section className="paper-spread provenance-ledger"><SectionLabel number="02.5">Evidence provenance</SectionLabel>{[['Measured','Spreadsheet observations'],['Documented','Text recorded in presentation'],['Image-derived','Approximate reading interpreted from photograph'],['Missing','Required value not present in supplied record']].map(([label, copy]) => <div key={label}><i className={`provenance-dot ${label.toLowerCase()}`} /><b>{label}</b><span>{copy}</span></div>)}</section>
      <NextArticle page="twin" label="03 — Digital twin" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

function TwinControls() {
  const [simulation, setSimulation] = useState({ temperature: 30, ph: 7, resistance: 1000, hrt: 24 });
  const result = useMemo(() => {
    const tempFactor = Math.exp(-Math.pow((simulation.temperature - 30) / 10, 2));
    const phFactor = Math.exp(-Math.pow((simulation.ph - 7) / 1.8, 2));
    const resistanceFactor = Math.exp(-Math.pow(Math.log(simulation.resistance / 1000) / .95, 2));
    const hrtFactor = .58 + .42 * (1 - Math.exp(-simulation.hrt / 20));
    const power = Math.max(12, Math.round(260 * tempFactor * phFactor * resistanceFactor * hrtFactor));
    const cod = Math.max(18, Math.min(94, Math.round(42 + simulation.hrt * .82 + phFactor * 15 + tempFactor * 8 - Math.abs(simulation.temperature - 30) * .5)));
    return { power, cod, low: Math.round(power * .62), high: Math.round(power * 1.38) };
  }, [simulation]);
  const controls = [
    { key: "temperature", label: "Temperature", min: 15, max: 45, step: 1, unit: "°C" },
    { key: "ph", label: "pH", min: 4, max: 10, step: .1, unit: "" },
    { key: "resistance", label: "External resistance", min: 100, max: 5000, step: 100, unit: "Ω" },
    { key: "hrt", label: "Hydraulic retention time", min: 4, max: 72, step: 2, unit: "h" },
  ] as const;
  return (
    <div className="twin-console">
      <form>{controls.map((control) => <label key={control.key}><span>{control.label}<b>{simulation[control.key]} {control.unit}</b></span><input type="range" min={control.min} max={control.max} step={control.step} value={simulation[control.key]} onChange={(e) => setSimulation({ ...simulation, [control.key]: Number(e.target.value) })} /></label>)}</form>
      <div className="twin-results"><p className="journal-kicker">Synthetic response / not trained</p><div><span><small>Power density</small><strong>{result.power}</strong><i>mW/m²</i></span><span><small>COD removal</small><strong>{result.cod}</strong><i>%</i></span></div><p className="interval">Illustrative interval <b>{result.low}—{result.high} mW/m²</b></p><aside><b>Model boundary</b><p>These values demonstrate interface behavior only. They are not derived from the historical experiment.</p></aside></div>
    </div>
  );
}

export function DigitalTwinView({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <main className="site-shell paper-page">
      <SiteHeader active="twin" staticMode={staticMode} />
      <PageMasthead number="03" kicker="Predictive system preview / transparent by design" title="A digital twin that shows its working." abstract="The planned intelligence layer will predict power density and COD removal, detect anomalies and recommend experiments—while displaying uncertainty and evidence boundaries beside every output." />
      <section className="paper-spread twin-section"><SectionLabel number="03.1">Interactive demonstration</SectionLabel><div className="twin-intro"><h2>Explore an illustrative response surface.</h2><p>Adjust the controls to test the product interaction. The mathematical response is synthetic and deliberately labelled so it cannot be mistaken for a trained scientific model.</p></div><TwinControls /></section>
      <section className="paper-spread system-architecture"><SectionLabel number="03.2">System architecture</SectionLabel><div className="architecture-flow">{[['01','Inputs','pH, temperature, resistance, HRT'],['02','Evidence layer','Experiments + verified literature'],['03','Prediction','Power density + COD removal'],['04','Explanation','Intervals + feature importance'],['05','Decision','Recommended next experiment']].map(([num, title, copy]) => <article key={num}><span>{num}</span><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
      <section className="paper-spread model-output-grid">
        <SectionLabel number="03.3">Planned outputs</SectionLabel>
        {[
          ['Power-density prediction','Gradient-boosting regression with grouped validation.'],['COD-removal prediction','Treatment outcome with calibrated intervals.'],['Anomaly detection','Sensor drift, sudden decline and domain warnings.'],['Fouling alert','Evidence-led performance decline classification.'],['Feature importance','SHAP or permutation importance after validation.'],['Next experiment','Constrained recommendation, never unrestricted optimization.']
        ].map(([title, copy], i) => <article key={title}><span>{String(i + 1).padStart(2,'0')}</span><h2>{title}</h2><p>{copy}</p></article>)}
      </section>
      <section className="paper-spread recommendation-panel"><SectionLabel number="03.4">Recommended next experiment</SectionLabel><div><p className="journal-kicker">Current recommendation / data acquisition</p><h2>Repeat the historical configuration with complete metadata.</h2><p>Record voltage over time, external resistance, exposed electrode area, temperature, pH, conductivity, COD before and after treatment, HRT and inoculum details. This creates the first trustworthy training row.</p></div><aside><b>Priority 01</b><span>Recover electrode dimensions</span><b>Priority 02</b><span>Confirm growth-curve units</span><b>Priority 03</b><span>Collect a polarization series</span></aside></section>
      <NextArticle page="about" label="04 — Project method" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

export function AboutView({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <main className="site-shell paper-page">
      <SiteHeader active="about" staticMode={staticMode} />
      <PageMasthead number="04" kicker="Project method / open research infrastructure" title="Build slowly enough to remain scientifically useful." abstract="BioVolt AI is a flagship project, but its credibility will come from traceable evidence, disciplined data collection and models that admit when they do not know." />
      <section className="paper-spread manifesto"><SectionLabel number="04.1">Manifesto</SectionLabel><p>BioVolt AI should feel advanced without pretending that sparse historical evidence is a production-ready digital twin. The platform therefore separates the research archive, experimental record and predictive layer—and keeps their provenance visible.</p><aside><span>01</span><b>Evidence before automation.</b><span>02</span><b>Uncertainty before certainty.</b><span>03</span><b>Reproducibility before scale.</b></aside></section>
      <section className="paper-spread roadmap"><SectionLabel number="04.2">Development roadmap</SectionLabel>{[
        ['Now','Research platform','Multipage evidence library, recovered experiment and synthetic twin interface.'],['Next','Data foundation','Verified papers, normalized experiment schema and manual data entry.'],['Then','Validated models','Grouped cross-validation, intervals, importance and anomaly detection.'],['Later','Live MFC','ESP32 sensing, streaming dashboard, alerts and controlled recommendations.']
      ].map(([phase, title, copy], index) => <article key={phase}><span>{String(index + 1).padStart(2,'0')}</span><p>{phase}</p><h2>{title}</h2><div><i /><p>{copy}</p></div></article>)}</section>
      <section className="paper-spread author-note"><SectionLabel number="04.3">Author note</SectionLabel><div><p className="journal-kicker">Researcher</p><h2>Yatharth Sharma</h2><p>The platform begins with previous college work on microbial fuel cells, halophilic isolates and Pseudomonas growth. It will evolve as papers, laboratory notes and new experiments are added.</p><div className="author-links"><a href="mailto:yatharth.01sharma@gmail.com">Email ↗</a><a href="https://github.com/YatharthSharma01/biovolt-ai" target="_blank" rel="noreferrer">Open-source repository ↗</a></div></div><blockquote>“From microbial metabolism to measurable electricity.”</blockquote></section>
      <section className="paper-spread repository-note"><SectionLabel number="04.4">Open source</SectionLabel><h2>Inspect the work, not only the interface.</h2><p>The public repository contains the complete website source and automated publishing workflow. Future data and model documentation will be versioned alongside the product.</p><a href="https://github.com/YatharthSharma01/biovolt-ai" target="_blank" rel="noreferrer">github.com/YatharthSharma01/biovolt-ai ↗</a></section>
      <NextArticle page="home" label="Return to cover" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

export function BioVoltExperience(props: { staticMode?: boolean }) {
  return <HomeView {...props} />;
}
