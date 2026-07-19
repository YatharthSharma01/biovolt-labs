"use client";

/* eslint-disable @next/next/no-img-element -- shared with the static GitHub Pages build */

import { useEffect, useMemo, useRef, useState } from "react";
import { papers, type PaperKind } from "./researchData";

export type PageKey = "home" | "research" | "experiment" | "calculator" | "twin" | "about";

const navItems: Array<{ key: PageKey; label: string; issue: string }> = [
  { key: "home", label: "Home", issue: "00" },
  { key: "research", label: "Research", issue: "01" },
  { key: "experiment", label: "Experiment", issue: "02" },
  { key: "calculator", label: "Calculator", issue: "03" },
  { key: "twin", label: "Digital twin", issue: "04" },
  { key: "about", label: "About", issue: "05" },
];

const growthData = [
  [0, 0], [2, 0.01], [4, 0.09], [6, 0.16], [25, 0.71], [27, 0.71],
  [29, 0.71], [31, 0.7], [33, 0.69], [48, 0.66], [50, 0.66],
];

const staticPageHrefs: Record<PageKey, string> = {
  home: "./index.html",
  research: "./research.html",
  experiment: "./experiment.html",
  calculator: "./calculator.html",
  twin: "./digital-twin.html",
  about: "./about.html",
};

const hostedPageHrefs: Record<PageKey, string> = {
  home: "/",
  research: "/research",
  experiment: "/experiment",
  calculator: "/calculator",
  twin: "/digital-twin",
  about: "/about",
};

function pageHref(page: PageKey, staticMode: boolean) {
  return staticMode ? staticPageHrefs[page] : hostedPageHrefs[page];
}

export function SiteHeader({ active, staticMode = false, overHero = false }: {
  active: PageKey | "registry";
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
      <a className="header-index" href={pageHref("research", staticMode)}><span>Index</span><b>12 core + 2 supporting</b></a>
    </header>
  );
}

export function SiteFooter({ staticMode = false }: { staticMode?: boolean }) {
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
            <a href="https://www.linkedin.com/in/yatharth-sharma-a13395288/" target="_blank" rel="noreferrer" aria-label="Yatharth Sharma on LinkedIn">in</a>
            <span aria-label="X profile link pending" title="Profile link pending">X</span>
          </div>
          <small className="profile-note">GitHub and LinkedIn are live. X can be connected when its profile URL is provided.</small>
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

export function PageMasthead({ number, kicker, title, abstract }: { number: string; kicker: string; title: string; abstract: string }) {
  return (
    <section className="page-masthead">
      <div className="masthead-number">{number}</div>
      <div className="masthead-copy"><p className="journal-kicker">{kicker}</p><h1>{title}</h1><p className="masthead-abstract"><b>Abstract.</b> {abstract}</p></div>
      <aside><span>BioVolt AI</span><span>Research edition 01</span><span>15 July 2026</span></aside>
    </section>
  );
}

export function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="section-label"><span>{number}</span><p>{children}</p></div>;
}

export function NextArticle({ page, label, staticMode }: { page: PageKey; label: string; staticMode: boolean }) {
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
          <h1>From microbial<br />metabolism to<br /><em>measurable electricity.</em></h1>
          <p className="hero-deck">A research-led microbial fuel cell platform connecting evidence, historical experiments and an explainable digital twin.</p>
          <div className="hero-actions">
            <a className="button button-light" href={pageHref("experiment", staticMode)}>Read the experiment <span>↗</span></a>
            <a className="button button-outline" href={pageHref("calculator", staticMode)}>Open calculator <span>↗</span></a>
          </div>
        </div>
        <div className="hero-figure-note"><b>Fig. 00</b><span>Conceptual double-chamber MFC. Move your pointer to inspect the field.</span></div>
        <div className="scroll-cue"><span>Scroll to abstract</span><i /></div>
      </section>

      <section className="issue-ledger">
        <div><span>System</span><strong>Double-chamber MFC</strong></div>
        <div><span>Organisms</span><strong>Halophiles / Pseudomonas</strong></div>
        <div><span>Evidence</span><strong>12 core papers / 2 supporting</strong></div>
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

      <section className="paper-spread author-introduction">
        <SectionLabel number="00.2">Introduction by Yatharth Sharma</SectionLabel>
        <div className="introduction-lead">
          <p className="journal-kicker">Author-supplied manuscript / lightly copy-edited</p>
          <h2>Why microbial fuel cell matter.</h2>
          <p>Decades of reliance on conventional energy generation techniques, including fossil fuels, hydropower, nuclear, coal, solar, wind, geothermal, and energy storage batteries, can cause environmental pollution, generate waste, exhibit low efficiency, incur high costs, or require expensive infrastructure, compelling us to shift towards alternative energy sources [Panwar et al.].</p>
        </div>
        <div className="introduction-body">
          <p>The potential of bio-electrochemical system techniques to enable simultaneous bioelectricity generation and efficient wastewater treatment through the exploitation of electroactive microbes has recently led to their consideration as an eco-friendly alternative to fulfill the global demand for energy production [Gude; Bhowmik et al., 2023]. In response to these limitations, the microbial fuel cell (MFC) was conceptualized by Michael Cressé Potter in 1911, who demonstrated the generation of electric current using <i>Saccharomyces cerevisiae</i> cells as a biological catalyst [Ripel Chakma et al., 2025].</p>
          <p>A microbial fuel cell (MFC), one of the most widely studied bio-electrochemical systems, that employs exoelectrogens to convert chemical energy into direct electrical energy through a blend of electrochemical reactions and microbial metabolism from a broad range of substrates, such as wastewater, acetate, and urine [Ripel Chakma et al., 2025].</p>
          <p>MFCs are a versatile and promising alternative that present distinct advantages over traditional approaches, including the reduction of excess sludge, a lower carbon footprint, bioenergy production, the use of carbon-free sources, and the ability to operate under mesophilic temperature and neutral pH conditions. Above all, MFCs do not require an external electric source [Kumar et al., 2017].</p>
          <p>MFCs could play a defining role in wastewater management by reversing the trend of water scarcity and serving as an alternative energy source to conventional techniques that harm the environment [J.O. Unuofin et al., 2023].</p>
          <aside>Citation keys are preserved from the supplied introduction. Full references remain pending verification.</aside>
        </div>
      </section>

      <section className="paper-spread page-directory">
        <SectionLabel number="00.3">Contents</SectionLabel>
        <div className="directory-grid">
          {navItems.slice(1).map((item, index) => (
            <a key={item.key} href={pageHref(item.key, staticMode)}>
              <span>{item.issue}</span><p>{index === 0 ? "Literature register" : index === 1 ? "Historical laboratory record" : index === 2 ? "Measured equations + cited evidence" : index === 3 ? "Predictive system preview" : "Project method & roadmap"}</p><h2>{item.label}</h2><i>Read article ↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="paper-spread evidence-feature">
        <SectionLabel number="00.4">Development sequence</SectionLabel>
        <figure className="process-figure"><img src={staticMode ? "images/mfc-development-process-v2.png" : "/images/mfc-development-process-v2.png"} alt="Development process for the historical double-chamber microbial fuel cell" /><figcaption><b>Figure 1.</b> Development sequence: graphite electrodes, KNO3–agar salt bridge, bacterial inoculation, completed MFC and voltage measurement. Background restyled for BioVolt AI; experimental content preserved from the supplied figure.</figcaption></figure>
        <div className="feature-copy"><p className="journal-kicker">Experimental workflow / process evidence</p><h2>From components to measurable voltage.</h2><p>The figure records the practical sequence used to construct the historical double-chamber MFC. The complete apparatus and its recovered metadata are documented on the experiment page.</p><a href={pageHref("experiment", staticMode)}>Open the full experimental record <span>↗</span></a></div>
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
      <PageMasthead number="01" kicker="Evidence register / 14 verified records" title="Research evidence, not a reading list." abstract="Twelve core MFC papers and two supporting sources are now classified, cited and summarized. Each record preserves study design, reported measurements, relevance and limitations without redistributing the source files." />
      <section className="paper-spread research-register">
        <SectionLabel number="01.1">Verified literature register</SectionLabel>
        <div className="library-counts"><p><strong>14</strong><span>All records</span></p><p><strong>6</strong><span>Primary research</span></p><p><strong>6</strong><span>Review papers</span></p><p><strong>2</strong><span>Supporting sources</span></p><aside>The original eleven core reading records and the new COD-removal study form a twelve-paper evidence base. Two microbiology and materials sources remain in a separate supporting category.</aside></div>
        <div className="filter-row" aria-label="Filter research papers">
          {(["All", "Primary research", "Review", "Supporting source"] as const).map((kind) => <button key={kind} className={filter === kind ? "is-active" : ""} onClick={() => setFilter(kind)}>{kind}<sup>{kind === "All" ? papers.length : papers.filter((p) => p.kind === kind).length}</sup></button>)}
        </div>
        <div className="paper-list">
          {visible.map((paper) => (
            <article className="citation-card" key={paper.record}>
              <div className="citation-meta"><span>{paper.record}</span><span>{paper.kind}</span><span>{paper.year}</span></div>
              <div className="citation-heading"><p className="authors">{paper.authors}</p><h2>{paper.title}</h2><p className="journal-line">{paper.journal}</p></div>
              <p className="paper-summary">{paper.summary}</p>
              <div className="paper-metrics" aria-label={`Key reported measurements for ${paper.title}`}>
                {paper.metrics.map((metric) => <p key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></p>)}
              </div>
              <div className="citation-footer"><p><b>Evidence focus</b>{paper.focus}</p><p><b>Source status</b>{paper.sourceStatus}</p><a href={paper.url} target="_blank" rel="noreferrer">DOI {paper.doi} ↗</a></div>
              <details className="paper-details">
                <summary>Open evidence notes</summary>
                <div className="paper-detail-grid">
                  <div><h3>Study design</h3><p>{paper.studyDesign}</p><h3>Why it matters here</h3><p>{paper.relevance}</p></div>
                  <div><h3>Key findings</h3><ul>{paper.keyFindings.map((finding) => <li key={finding}>{finding}</li>)}</ul></div>
                  <aside><h3>Interpretation boundary</h3><p>{paper.caveat}</p><h3>Source reviewed</h3><p>{paper.sourcePages}</p><small>{paper.access}</small></aside>
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>
      <section className="paper-spread evidence-matrix-section">
        <SectionLabel number="01.2">Extraction matrix</SectionLabel>
        <div className="matrix-copy"><h2>A common structure for unlike experiments.</h2><p>Every paper has been read into comparable fields. Reported values retain their reactor context and are treated as literature evidence—not as training rows until units and normalization are harmonized.</p></div>
        <div className="evidence-table" role="table" aria-label="Research evidence extraction fields">
          {[['Biology','Organism / inoculum / mediator'],['Reactor','Architecture / volume / membrane'],['Operation','pH / temperature / HRT / resistance'],['Electrochemistry','Voltage / current / power density'],['Treatment','COD in / COD out / removal'],['Quality','Replicates / uncertainty / validation']].map(([group, fields]) => <div role="row" key={group}><b role="cell">{group}</b><span role="cell">{fields}</span><i role="cell">Required</i></div>)}
        </div>
      </section>
      <section className="paper-spread editorial-note"><SectionLabel number="01.3">Editorial &amp; access policy</SectionLabel><blockquote>The library publishes analysis, not copies of the papers.</blockquote><p>BioVolt AI links to DOI or publisher records and displays original summaries, citations and selected reported measurements. PDF 11 was reviewed for research purposes but is not hosted because a redistribution licence was not confirmed. PDF 3 was a publisher security page, so that supporting record is limited to verified metadata and abstract-level evidence.</p></section>
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
  const image = (file: string) => staticMode ? `images/${file}` : `/images/${file}`;
  return (
    <main className="site-shell paper-page">
      <SiteHeader active="experiment" staticMode={staticMode} />
      <PageMasthead number="02" kicker="Historical laboratory record / college experiment" title="A recovered experiment becomes structured evidence." abstract="This record reconstructs the Sambhar Lake halophile study, double-chamber MFC, growth kinetics and microbiological characterization from the original presentation, photographs and growth workbook. Unknowns remain visible rather than being guessed." />
      <section className="paper-spread experiment-aims">
        <SectionLabel number="02.1">Aim &amp; evidence boundary</SectionLabel>
        <div><p className="journal-kicker">Original study aims</p><h2>From a natural halophile to a working MFC.</h2><p>The college project aimed to isolate halophilic bacteria from a natural habitat, compare growth under salt-containing culture conditions, study growth kinetics and test the isolate as the biological component of a microbial fuel cell.</p></div>
        <ol><li>Isolate halophilic bacteria from Sambhar Lake samples.</li><li>Obtain distinct pure cultures and characterize them.</li><li>Study the growth phases of the recovered halophile.</li><li>Construct a double-chamber MFC and record electrical output.</li></ol>
        <aside><b>Scope note</b><p>The presentation is a historical record, not a complete laboratory notebook. Volumes, replicate count, incubation duration for several tests, inoculum density, resistance and raw voltage time series are not available.</p></aside>
      </section>
      <section className="paper-spread method-section">
        <SectionLabel number="02.2">Materials &amp; methods</SectionLabel>
        <div className="method-intro"><p className="journal-kicker">Recovered protocol</p><h2>Four connected experimental stages.</h2><p>Only steps stated or pictured in the supplied work are included. Missing conditions are explicitly marked instead of being reconstructed from literature.</p></div>
        <div className="method-grid">
          <article><span>01</span><h3>Sample collection</h3><p>Water and salt samples were collected from Sambhar Lake, Rajasthan, as the environmental source of salt-tolerant microorganisms.</p><small>Documented in presentation</small></article>
          <article><span>02</span><h3>Selective cultivation</h3><p>Samples were cultured on Mueller–Hinton agar containing 7.5% NaCl and mannitol motility agar containing 5% NaCl.</p><small>Temperature and incubation time missing</small></article>
          <article><span>03</span><h3>Isolation &amp; screening</h3><p>Distinct colonies were subcultured to obtain pure isolates, followed by microscopy, colony morphology and biochemical tests.</p><small>Species identity not established</small></article>
          <article><span>04</span><h3>MFC assembly</h3><p>Graphite rods were placed in a halophilic-broth anode and a KMnO₄ cathode, joined by a water–KNO₃–agar salt bridge and connected for voltage measurement.</p><small>Reactor volume and resistance missing</small></article>
        </div>
        <div className="reaction-strip"><p><b>Anode</b>C₆H₁₂O₆ + 6H₂O → 6CO₂ + 24H⁺ + 24e⁻</p><p><b>Cathode</b>MnO₄⁻ + 4H⁺ + 3e⁻ → MnO₂ + 2H₂O</p></div>
      </section>
      <section className="paper-spread apparatus-layout">
        <SectionLabel number="02.3">Reactor apparatus</SectionLabel>
        <figure className="apparatus-figure"><img src={image("historical-mfc-setup.png")} alt="Historical double-chamber MFC apparatus" /><figcaption><b>Figure 2.</b> Historical MFC setup. The photograph is documentary evidence; it is not a calibrated dimensional record.</figcaption></figure>
        <div className="apparatus-spec">
          <p className="journal-kicker">Recorded configuration</p><h2>Double-chamber architecture</h2>
          <dl><div><dt>Anode</dt><dd>Halophilic broth + graphite rod</dd></div><div><dt>Cathode</dt><dd>KMnO₄ solution + graphite rod</dd></div><div><dt>Ion pathway</dt><dd>Water + KNO₃ + agar salt bridge</dd></div><div><dt>Mixing</dt><dd>Magnetic bead shown in anode schematic</dd></div><div><dt>Measurement</dt><dd>Direct voltage display; time series not retained</dd></div><div><dt>Observed reading</dt><dd>Approximately 0.61 V, image-derived</dd></div></dl>
        </div>
      </section>
      <section className="paper-spread electrode-layout">
        <SectionLabel number="02.4">Electrode record</SectionLabel>
        <div className="electrode-copy"><p className="journal-kicker">Material note / unresolved dimension</p><h2>Graphite rod electrodes</h2><p>The product evidence identifies an Achalnath Tools graphite rod and lists 6 × 1 × 1 centimetres. The description also says “6-inch long,” creating a conflict that prevents reliable exposed-area calculation.</p><div className="warning-note"><b>Action required</b><span>Measure the surviving electrode or recover the original purchase specification before normalizing power density.</span></div></div>
        <figure><img src={image("graphite-electrodes.png")} alt="Pair of pointed graphite rod electrodes" /><figcaption><b>Figure 3.</b> Graphite electrode reference recovered from the experimental presentation.</figcaption></figure>
      </section>
      <section className="paper-spread results-section">
        <SectionLabel number="02.5">Results &amp; discussion</SectionLabel>
        <div className="results-lead"><p className="journal-kicker">What the surviving evidence supports</p><h2>Electrical activity was observed, while biological identity remained unresolved.</h2><p>The photographed meter shows approximately 0.61 V from the assembled MFC. Because exposed electrode area, external resistance, replicate count and a time-resolved voltage series are absent, current and power density cannot be calculated responsibly.</p></div>
        <div className="result-callouts"><article><strong>≈0.61</strong><span>V / photographed reading</span></article><article><strong>2</strong><span>sample sources / water and salt</span></article><article><strong>1</strong><span>growth curve / halophile</span></article></div>
        <div className="discussion-note"><b>Interpretation.</b><p>The result demonstrates a measurable potential difference in the historical configuration, but it does not yet establish stable power production or enable comparison with literature power density. A repeat experiment needs voltage over time, a polarization series, exposed electrode area and uncertainty from independent reactors.</p></div>
      </section>
      <section className="paper-spread halophile-growth-section">
        <SectionLabel number="02.6">Growth kinetics of the halophile</SectionLabel>
        <div className="halophile-growth-copy"><p className="journal-kicker">OD₆₀₀ / time in hours</p><h2>A complete four-phase growth profile.</h2><p>The original graph shows a short lag phase, sustained exponential growth, a peak OD₆₀₀ of approximately <b>1.40</b> around <b>50–52 h</b>, followed by decline to approximately <b>1.14</b> by the final recorded point near <b>77 h</b>.</p><div className="phase-list"><span><i>01</i>Lag / ≈0–8 h</span><span><i>02</i>Exponential / ≈8–50 h</span><span><i>03</i>Peak / ≈50–52 h</span><span><i>04</i>Decline / after ≈52 h</span></div><small>Values and phase boundaries are approximate readings from the archived graph because its raw table and replicate data were not embedded in the presentation.</small></div>
        <figure><img src={image("halophile-growth-curve.png")} alt="Archived halophile growth curve showing lag, exponential, stationary and decline phases" /><figcaption><b>Figure 4.</b> Original halophile growth-kinetics graph from the college presentation. Image-derived values are kept distinct from measured spreadsheet data.</figcaption></figure>
      </section>
      <section className="paper-spread morphology-section">
        <SectionLabel number="02.7">Morphological characterization</SectionLabel>
        <div className="character-heading"><p className="journal-kicker">Water isolate / salt isolate</p><h2>Two Gram-positive rod morphologies.</h2><p>Both preparations stained Gram-positive, but their cell arrangement and colony dimensions differed. These observations characterize phenotype only; they do not identify species.</p></div>
        <div className="micrograph-grid"><figure><img src={image("halophile-water-gram.png")} alt="Gram-stained microscopy image of the water isolate" /><figcaption><b>Water isolate.</b> Short rods; mostly discrete or scattered; moderate purple staining; high cell density.</figcaption></figure><figure><img src={image("halophile-salt-gram.png")} alt="Gram-stained microscopy image of the salt isolate" /><figcaption><b>Salt isolate.</b> Elongated bacilli; dense, interwoven arrangement; intense violet staining; very high cell density.</figcaption></figure></div>
        <div className="result-table morphology-table" role="table" aria-label="Morphological characterization of water and salt isolates"><div role="row"><b role="columnheader">Characteristic</b><b role="columnheader">Water isolate</b><b role="columnheader">Salt isolate</b></div>{[["Gram reaction","Positive","Positive"],["Cell form","Short rods","Elongated bacilli"],["Arrangement","Discrete / scattered","Dense / interwoven"],["Colony diameter","0.7 cm","0.9 cm"],["Colony form","Circular","Circular"],["Colony margin","Smooth","Smooth"]].map((row) => <div role="row" key={row[0]}>{row.map((cell) => <span role="cell" key={cell}>{cell}</span>)}</div>)}</div>
      </section>
      <section className="paper-spread biochemical-section">
        <SectionLabel number="02.8">Biochemical characterization</SectionLabel>
        <div className="character-heading"><p className="journal-kicker">Qualitative test panel</p><h2>The water isolate differed in catalase; the salt isolate differed in TSI.</h2><p>All remaining recorded reactions were negative for both isolates. “Indole red” reproduces the terminology in the original presentation.</p></div>
        <div className="result-table biochemical-table" role="table" aria-label="Biochemical test results"><div role="row"><b role="columnheader">Test</b><b role="columnheader">Water isolate</b><b role="columnheader">Salt isolate</b></div>{[["Catalase","Positive","Negative"],["Amylase / starch","Negative","Negative"],["Motility","Negative","Negative"],["Methyl red","Negative","Negative"],["Voges–Proskauer","Negative","Negative"],["Indole red","Negative","Negative"],["Citrate utilization","Negative","Negative"],["Triple sugar iron (TSI)","Negative","Positive"]].map((row) => <div role="row" key={row[0]}>{row.map((cell) => <span role="cell" className={cell === "Positive" ? "positive-result" : ""} key={cell}>{cell}</span>)}</div>)}</div>
        <div className="assay-gallery">
          {[["catalase-water.jpeg","Catalase / water isolate"],["catalase-salt.jpeg","Catalase / salt isolate"],["motility-test.jpeg","Motility test"],["methyl-red-test.jpeg","Methyl red test"],["voges-proskauer-test.jpeg","Voges–Proskauer test"],["indole-red-test.jpeg","Indole red test"],["citrate-test.jpeg","Citrate test"],["tsi-test.jpeg","TSI test"],["starch-water.jpeg","Starch / water isolate"],["starch-salt.jpeg","Starch / salt isolate"]].map(([file, label]) => <figure key={file}><img src={image(file)} alt={`${label} observation from the college experiment`} /><figcaption>{label}</figcaption></figure>)}
        </div>
        <div className="discussion-note"><b>Interpretation boundary.</b><p>The tests provide a preliminary phenotype, not a taxonomic conclusion. The next study should repeat the panel with controls and replicates, document incubation conditions, and add 16S rRNA sequencing or another validated molecular identification method.</p></div>
      </section>
      <section className="paper-spread growth-section historical-growth">
        <SectionLabel number="02.9">Separate historical dataset</SectionLabel>
        <div className="growth-heading"><p className="journal-kicker">Pseudomonas workbook</p><h2>Pseudomonas growth curve</h2><p>Maximum recorded absorbance: <b>0.71</b> at time values 25–29. Final recorded absorbance: <b>0.66</b> at time 50.</p></div>
        <figure><GrowthCurve /><figcaption><b>Figure 5.</b> Reconstructed from the supplied spreadsheet. Time units, measurement wavelength and replicate count remain unconfirmed, so this record is not merged with the halophile experiment.</figcaption></figure>
      </section>
      <section className="paper-spread provenance-ledger"><SectionLabel number="02.10">Evidence provenance</SectionLabel>{[["Measured","Values retained in spreadsheet"],["Documented","Text or result recorded in presentation"],["Image-derived","Approximate value interpreted from graph or photograph"],["Missing","Required value absent from supplied record"]].map(([label, copy]) => <div key={label}><i className={`provenance-dot ${label.toLowerCase()}`} /><b>{label}</b><span>{copy}</span></div>)}</section>
      <NextArticle page="calculator" label="03 — MFC calculator" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

type RegistryDraft = {
  experimentCode: string; title: string; status: string; provenance: string; startedOn: string;
  organism: string; inoculumSource: string; substrate: string; substrateConcentration: string;
  temperature: string; ph: string; conductivity: string; salinity: string; resistance: string;
  anodeMaterial: string; cathodeMaterial: string; anodeArea: string; cathodeArea: string;
  reactorVolume: string; membrane: string; hrt: string; codIn: string; codOut: string;
  voltage: string; current: string; powerDensity: string; replicates: string; notes: string;
};

const blankRegistryDraft: RegistryDraft = {
  experimentCode: "MFC-NEW-001", title: "", status: "planned", provenance: "measured", startedOn: "",
  organism: "", inoculumSource: "", substrate: "", substrateConcentration: "", temperature: "",
  ph: "", conductivity: "", salinity: "", resistance: "", anodeMaterial: "", cathodeMaterial: "",
  anodeArea: "", cathodeArea: "", reactorVolume: "", membrane: "", hrt: "", codIn: "", codOut: "",
  voltage: "", current: "", powerDensity: "", replicates: "", notes: "",
};

const historicalRegistryDraft: RegistryDraft = {
  ...blankRegistryDraft,
  experimentCode: "COLLEGE-MFC-001",
  title: "Historical Sambhar Lake halophile MFC",
  status: "archived",
  provenance: "documented",
  organism: "Halophilic environmental isolate; species unresolved",
  inoculumSource: "Water and salt samples from Sambhar Lake, Rajasthan",
  substrate: "Halophilic broth; composition not retained",
  anodeMaterial: "Graphite rod",
  cathodeMaterial: "Graphite rod in KMnO₄ catholyte",
  membrane: "Water + KNO₃ + agar salt bridge",
  voltage: "0.61",
  notes: "Voltage is approximate and image-derived. Reactor volume, resistance, exposed electrode area, COD, HRT, replicate count and time series are missing.",
};

const registryFields: Array<{ key: keyof RegistryDraft; label: string; unit?: string; type?: string; placeholder?: string }> = [
  { key: "organism", label: "Organism / inoculum", placeholder: "Halophilic mixed culture" },
  { key: "inoculumSource", label: "Inoculum source", placeholder: "Sambhar Lake water" },
  { key: "substrate", label: "Substrate", placeholder: "Acetate / wastewater / glucose" },
  { key: "substrateConcentration", label: "Substrate concentration", unit: "mg/L", type: "number" },
  { key: "temperature", label: "Temperature", unit: "°C", type: "number" },
  { key: "ph", label: "pH", type: "number" },
  { key: "conductivity", label: "Conductivity", unit: "mS/cm", type: "number" },
  { key: "salinity", label: "Salinity", unit: "g/L", type: "number" },
  { key: "resistance", label: "External resistance", unit: "Ω", type: "number" },
  { key: "anodeMaterial", label: "Anode material" },
  { key: "cathodeMaterial", label: "Cathode material" },
  { key: "anodeArea", label: "Exposed anode area", unit: "cm²", type: "number" },
  { key: "cathodeArea", label: "Exposed cathode area", unit: "cm²", type: "number" },
  { key: "reactorVolume", label: "Working volume", unit: "mL", type: "number" },
  { key: "membrane", label: "Membrane / salt bridge" },
  { key: "hrt", label: "Hydraulic retention time", unit: "h", type: "number" },
  { key: "codIn", label: "COD before treatment", unit: "mg/L", type: "number" },
  { key: "codOut", label: "COD after treatment", unit: "mg/L", type: "number" },
  { key: "voltage", label: "Voltage", unit: "V", type: "number" },
  { key: "current", label: "Current", unit: "mA", type: "number" },
  { key: "powerDensity", label: "Power density", unit: "mW/m²", type: "number" },
  { key: "replicates", label: "Independent replicates", type: "number" },
];

const registryCsvNames: Record<keyof RegistryDraft, string> = {
  experimentCode: "experiment_code", title: "title", status: "status", provenance: "provenance",
  startedOn: "started_on", organism: "organism", inoculumSource: "inoculum_source", substrate: "substrate",
  substrateConcentration: "substrate_concentration_mg_l", temperature: "temperature_c", ph: "ph",
  conductivity: "conductivity_ms_cm", salinity: "salinity_g_l", resistance: "external_resistance_ohm",
  anodeMaterial: "anode_material", cathodeMaterial: "cathode_material", anodeArea: "anode_area_cm2",
  cathodeArea: "cathode_area_cm2", reactorVolume: "reactor_volume_ml", membrane: "membrane_or_bridge",
  hrt: "hrt_hours", codIn: "cod_in_mg_l", codOut: "cod_out_mg_l", voltage: "voltage_v",
  current: "current_ma", powerDensity: "power_density_mw_m2", replicates: "replicate_count", notes: "notes",
};

function csvValue(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function RegistryView({ staticMode = false }: { staticMode?: boolean }) {
  const [draft, setDraft] = useState<RegistryDraft>(blankRegistryDraft);
  const codRemoval = useMemo(() => {
    const before = Number(draft.codIn); const after = Number(draft.codOut);
    return draft.codIn && draft.codOut && before > 0 ? ((before - after) / before * 100).toFixed(1) : null;
  }, [draft.codIn, draft.codOut]);

  const update = (key: keyof RegistryDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const downloadCsv = () => {
    const entries = (Object.entries(draft) as Array<[keyof RegistryDraft, string]>).map(([key, value]) => [registryCsvNames[key], value]);
    entries.push(["cod_removal_percent", codRemoval ?? ""]);
    const csv = `${entries.map(([name]) => csvValue(name)).join(",")}\n${entries.map(([, value]) => csvValue(value)).join(",")}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${draft.experimentCode || "biovolt-experiment"}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="site-shell paper-page">
      <SiteHeader active="registry" staticMode={staticMode} />
      <PageMasthead number="03" kicker="Data foundation / experiment registry v1" title="One trustworthy row at a time." abstract="The registry gives every MFC run a consistent structure, calculates COD removal only from paired measurements and keeps literature benchmarks outside the researcher’s own experimental dataset." />
      <section className="paper-spread registry-principles">
        <SectionLabel number="03.1">Registry contract</SectionLabel>
        <div><p className="journal-kicker">Evidence before prediction</p><h2>Measured experiments and published benchmarks never share a table.</h2><p>Your reactor observations belong to the experiment registry. Values extracted from papers belong to the literature benchmark register. They can be compared, but they are not interchangeable training rows.</p></div>
        <aside><span><b>Experiment store</b>FastAPI + SQLite</span><span><b>Literature store</b>Separate benchmark table</span><span><b>Public interface</b>Local CSV preparation</span></aside>
      </section>
      <section className="paper-spread cod-benchmark-section">
        <SectionLabel number="03.2">COD benchmark / Erable et al. (2011)</SectionLabel>
        <div className="benchmark-heading"><p className="journal-kicker">Urban wastewater / 24-hour comparison</p><h2>Treatment optimum is not the power optimum.</h2><p>The paper compared identical COD-removal endpoints across an anaerobic control, a 1000 Ω MFC, a short-circuited MFC and a compact microbial electrochemical snorkel.</p></div>
        <div className="cod-bars" aria-label="COD removal benchmarks reported by Erable and colleagues in 2011">
          {[["Anaerobic control",15],["MFC / 1000 Ω",50],["Short-circuit MFC",72],["Compact MES",69]].map(([label, value]) => <article key={label}><div><i style={{ width: `${value}%` }} /></div><strong>{value}%</strong><span>{label}</span></article>)}
        </div>
        <div className="benchmark-citation"><p><b>Interpretation.</b> After subtracting approximately 15% background removal, the authors estimated about 35% COD removal for the maximum-power MFC and about 55% for MES-type operation—a relative gain of roughly 57%.</p><a href="https://doi.org/10.1080/08927014.2011.564615" target="_blank" rel="noreferrer">Erable, Etcheverry &amp; Bergel, Biofouling 27(3), 319–326 ↗</a></div>
      </section>
      <section className="paper-spread registry-form-section">
        <SectionLabel number="03.3">Prepare an experiment record</SectionLabel>
        <div className="registry-form-intro"><p className="journal-kicker">Manual entry / no upload</p><h2>Create a standardized CSV row.</h2><p>This public form processes the draft only in your browser and downloads a CSV; it does not transmit or permanently save the record. The FastAPI service in the public source provides SQLite storage when the research workspace is run locally.</p><div className="registry-actions"><button type="button" onClick={() => setDraft(historicalRegistryDraft)}>Load historical MFC draft</button><button type="button" onClick={() => setDraft(blankRegistryDraft)}>Clear form</button></div></div>
        <form className="registry-form" onSubmit={(event) => event.preventDefault()}>
          <div className="registry-core-fields">
            <label><span>Experiment code</span><input value={draft.experimentCode} onChange={(event) => update("experimentCode", event.target.value)} required /></label>
            <label className="wide-field"><span>Experiment title</span><input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="Repeat halophile MFC with complete metadata" required /></label>
            <label><span>Status</span><select value={draft.status} onChange={(event) => update("status", event.target.value)}><option value="planned">Planned</option><option value="running">Running</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
            <label><span>Dominant provenance</span><select value={draft.provenance} onChange={(event) => update("provenance", event.target.value)}><option value="measured">Measured</option><option value="documented">Documented</option><option value="image-derived">Image-derived</option></select></label>
            <label><span>Start date</span><input type="date" value={draft.startedOn} onChange={(event) => update("startedOn", event.target.value)} /></label>
          </div>
          <div className="registry-field-grid">{registryFields.map((field) => <label key={field.key}><span>{field.label}{field.unit && <i>{field.unit}</i>}</span><input type={field.type ?? "text"} step={field.type === "number" ? "any" : undefined} min={field.type === "number" ? "0" : undefined} value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} /></label>)}</div>
          <label className="registry-notes"><span>Notes, anomalies and field-level provenance</span><textarea value={draft.notes} onChange={(event) => update("notes", event.target.value)} rows={5} placeholder="Record deviations, uncertain values and which fields were image-derived." /></label>
          <div className="registry-output"><div><small>Calculated COD removal</small><strong>{codRemoval ?? "—"}{codRemoval && "%"}</strong><span>{codRemoval ? "Calculated from COD before and after" : "Enter both COD measurements"}</span></div><button type="button" className="download-record" onClick={downloadCsv} disabled={!draft.experimentCode || !draft.title}>Download CSV row ↗</button></div>
        </form>
      </section>
      <section className="paper-spread registry-schema">
        <SectionLabel number="03.4">Minimum useful training row</SectionLabel>
        <div className="schema-table" role="table" aria-label="Minimum useful MFC experiment fields">{[["Identity","Experiment code, date, organism and inoculum"],["Reactor","Architecture, volume, electrodes and exposed areas"],["Operation","Substrate, temperature, pH, conductivity, salinity, HRT and resistance"],["Electrical","Voltage-time data, current and power-density normalization"],["Treatment","COD before, COD after, elapsed time and calculated removal"],["Quality","Independent replicates, uncertainty, provenance and deviations"]].map(([group, fields]) => <div role="row" key={group}><b role="cell">{group}</b><span role="cell">{fields}</span></div>)}</div>
        <aside><b>Gate for modelling</b><p>A row may be stored with missing values, but it should not enter model training until outcome, units, reactor context and provenance are complete.</p></aside>
      </section>
      <NextArticle page="twin" label="04 — Digital twin" staticMode={staticMode} />
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
      <PageMasthead number="04" kicker="Predictive system preview / transparent by design" title="Intelligence for living electricity." abstract="The planned intelligence layer will predict power density and COD removal, detect anomalies and recommend experiments—while displaying uncertainty and evidence boundaries beside every output." />
      <section className="paper-spread twin-section"><SectionLabel number="04.1">Interactive demonstration</SectionLabel><div className="twin-intro"><h2>Explore an illustrative response surface.</h2><p>Adjust the controls to test the product interaction. The mathematical response is synthetic and deliberately labelled so it cannot be mistaken for a trained scientific model.</p></div><TwinControls /></section>
      <section className="paper-spread system-architecture"><SectionLabel number="04.2">System architecture</SectionLabel><div className="architecture-flow">{[['01','Inputs','pH, temperature, resistance, HRT'],['02','Evidence layer','Experiments + verified literature'],['03','Prediction','Power density + COD removal'],['04','Explanation','Intervals + feature importance'],['05','Decision','Recommended next experiment']].map(([num, title, copy]) => <article key={num}><span>{num}</span><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
      <section className="paper-spread model-output-grid">
        <SectionLabel number="04.3">Planned outputs</SectionLabel>
        {[
          ['Power-density prediction','Gradient-boosting regression with grouped validation.'],['COD-removal prediction','Treatment outcome with calibrated intervals.'],['Anomaly detection','Sensor drift, sudden decline and domain warnings.'],['Fouling alert','Evidence-led performance decline classification.'],['Feature importance','SHAP or permutation importance after validation.'],['Next experiment','Constrained recommendation, never unrestricted optimization.']
        ].map(([title, copy], i) => <article key={title}><span>{String(i + 1).padStart(2,'0')}</span><h2>{title}</h2><p>{copy}</p></article>)}
      </section>
      <section className="paper-spread recommendation-panel"><SectionLabel number="04.4">Recommended next experiment</SectionLabel><div><p className="journal-kicker">Current recommendation / data acquisition</p><h2>Repeat the historical configuration with complete metadata.</h2><p>Record voltage over time, external resistance, exposed electrode area, temperature, pH, conductivity, COD before and after treatment, HRT and inoculum details. This creates the first trustworthy training row.</p></div><aside><b>Priority 01</b><span>Recover electrode dimensions</span><b>Priority 02</b><span>Confirm growth-curve units</span><b>Priority 03</b><span>Collect a polarization series</span></aside></section>
      <NextArticle page="about" label="05 — Project method" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

export function AboutView({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <main className="site-shell paper-page">
      <SiteHeader active="about" staticMode={staticMode} />
      <PageMasthead number="05" kicker="Project method / open research infrastructure" title="Build slowly enough to remain scientifically useful." abstract="BioVolt AI is a flagship project, but its credibility will come from traceable evidence, disciplined data collection and models that admit when they do not know." />
      <section className="paper-spread manifesto"><SectionLabel number="05.1">Manifesto</SectionLabel><p>BioVolt AI should feel advanced without pretending that sparse historical evidence is a production-ready digital twin. The platform therefore separates the research archive, experimental record and predictive layer—and keeps their provenance visible.</p><aside><span>01</span><b>Evidence before automation.</b><span>02</span><b>Uncertainty before certainty.</b><span>03</span><b>Reproducibility before scale.</b></aside></section>
      <section className="paper-spread roadmap"><SectionLabel number="05.2">Development roadmap</SectionLabel>{[
        ['Now','Research platform','Multipage evidence library, recovered experiment and synthetic twin interface.'],['Next','Data foundation','Verified papers, normalized experiment schema and manual data entry.'],['Then','Validated models','Grouped cross-validation, intervals, importance and anomaly detection.'],['Later','Live MFC','ESP32 sensing, streaming dashboard, alerts and controlled recommendations.']
      ].map(([phase, title, copy], index) => <article key={phase}><span>{String(index + 1).padStart(2,'0')}</span><p>{phase}</p><h2>{title}</h2><div><i /><p>{copy}</p></div></article>)}</section>
      <section className="paper-spread author-note"><SectionLabel number="05.3">Author note</SectionLabel><div><p className="journal-kicker">Researcher</p><h2>Yatharth Sharma</h2><p>The platform begins with previous college work on microbial fuel cells, halophilic isolates and Pseudomonas growth. It will evolve as papers, laboratory notes and new experiments are added.</p><div className="author-links"><a href="mailto:yatharth.01sharma@gmail.com">Email ↗</a><a href="https://www.linkedin.com/in/yatharth-sharma-a13395288/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/YatharthSharma01/biovolt-ai" target="_blank" rel="noreferrer">Open-source repository ↗</a></div></div><blockquote>“From microbial metabolism to measurable electricity.”</blockquote></section>
      <section className="paper-spread repository-note"><SectionLabel number="05.4">Open source</SectionLabel><h2>Inspect the work, not only the interface.</h2><p>The public repository contains the complete website source and automated publishing workflow. Future data and model documentation will be versioned alongside the product.</p><a href="https://github.com/YatharthSharma01/biovolt-ai" target="_blank" rel="noreferrer">github.com/YatharthSharma01/biovolt-ai ↗</a></section>
      <NextArticle page="home" label="Return to cover" staticMode={staticMode} />
      <SiteFooter staticMode={staticMode} />
    </main>
  );
}

export function BioVoltExperience(props: { staticMode?: boolean }) {
  return <HomeView {...props} />;
}
