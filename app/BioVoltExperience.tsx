"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PaperKind = "Review" | "Primary research";

const papers: Array<{
  kind: PaperKind;
  year: number;
  authors: string;
  title: string;
  focus: string;
  status: string;
}> = [
  {
    kind: "Review",
    year: 2023,
    authors: "Soumitra Nath et al.",
    title:
      "Microbial fuel cell: A state-of-the-art and revolutionizing technology for efficient energy recovery",
    focus: "Architecture · energy recovery",
    status: "Citation details to verify",
  },
  {
    kind: "Review",
    year: 2022,
    authors: "Jayesh M. Sonawane et al.",
    title:
      "Recent progress in microbial fuel cells using substrates from diverse sources",
    focus: "Substrates · performance",
    status: "Citation details to verify",
  },
  {
    kind: "Review",
    year: 2022,
    authors: "Nabil K. Abd-Elrahman et al.",
    title: "Applications of nanomaterials in microbial fuel cells",
    focus: "Electrodes · nanomaterials",
    status: "Citation details to verify",
  },
  {
    kind: "Primary research",
    year: 2016,
    authors: "Erick M. Bosire et al.",
    title:
      "Strain- and substrate-dependent redox mediator and electricity production by Pseudomonas aeruginosa",
    focus: "Pseudomonas · phenazines",
    status: "Citation details to verify",
  },
  {
    kind: "Primary research",
    year: 2017,
    authors: "Neem Ali et al.",
    title:
      "Characterization of Pseudomonas aeruginosa using glucose, fructose and sucrose in double-chamber MFCs",
    focus: "Pseudomonas · substrates",
    status: "Citation details to verify",
  },
  {
    kind: "Primary research",
    year: 2023,
    authors: "Ankisha Vijay et al.",
    title:
      "Power generation by halophilic bacteria and assessment of salinity in a denitrification MFC",
    focus: "Halophiles · salinity",
    status: "Citation details to verify",
  },
];

const growthData = [
  [0, 0],
  [2, 0.01],
  [4, 0.09],
  [6, 0.16],
  [25, 0.71],
  [27, 0.71],
  [29, 0.71],
  [31, 0.7],
  [33, 0.69],
  [48, 0.66],
  [50, 0.66],
];

const hotspots = {
  anode: {
    label: "Anodic chamber",
    copy: "Halophilic broth and graphite electrode. Microbial metabolism releases electrons and protons.",
    evidence: "Documented in presentation",
  },
  bridge: {
    label: "KNO₃–agar salt bridge",
    copy: "The ionic connection between chambers. Exact concentration and bridge dimensions remain unrecorded.",
    evidence: "Documented · incomplete",
  },
  cathode: {
    label: "Cathodic chamber",
    copy: "KMnO₄ catholyte with a graphite electrode. Concentration and operating duration need recovery from lab notes.",
    evidence: "Documented · incomplete",
  },
  electrode: {
    label: "Graphite rod electrode",
    copy: "Achalnath Tools graphite rod. The listing conflicts between 6 cm and 6 inches, so exposed area is not yet calculated.",
    evidence: "Product evidence · verify dimensions",
  },
} as const;

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
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);

      const width = rect.width;
      const height = rect.height;
      const pad = { left: 48, right: 18, top: 20, bottom: 38 };
      const plotWidth = width - pad.left - pad.right;
      const plotHeight = height - pad.top - pad.bottom;
      const x = (value: number) => pad.left + (value / 50) * plotWidth;
      const y = (value: number) => pad.top + (1 - value / 0.8) * plotHeight;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(153, 196, 181, 0.16)";
      context.lineWidth = 1;
      context.font = "11px ui-monospace, monospace";
      context.fillStyle = "rgba(214, 235, 226, 0.58)";

      [0, 0.2, 0.4, 0.6, 0.8].forEach((tick) => {
        context.beginPath();
        context.moveTo(pad.left, y(tick));
        context.lineTo(width - pad.right, y(tick));
        context.stroke();
        context.fillText(tick.toFixed(1), 12, y(tick) + 4);
      });

      [0, 10, 20, 30, 40, 50].forEach((tick) => {
        context.fillText(String(tick), x(tick) - 7, height - 12);
      });

      const gradient = context.createLinearGradient(0, pad.top, 0, height);
      gradient.addColorStop(0, "rgba(126, 247, 180, 0.3)");
      gradient.addColorStop(1, "rgba(126, 247, 180, 0)");
      context.beginPath();
      growthData.forEach(([time, absorbance], index) => {
        const px = x(time);
        const py = y(absorbance);
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      });
      context.lineTo(x(50), y(0));
      context.lineTo(x(0), y(0));
      context.closePath();
      context.fillStyle = gradient;
      context.fill();

      context.beginPath();
      growthData.forEach(([time, absorbance], index) => {
        const px = x(time);
        const py = y(absorbance);
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      });
      context.strokeStyle = "#86f5b5";
      context.lineWidth = 2.5;
      context.stroke();

      growthData.forEach(([time, absorbance]) => {
        context.beginPath();
        context.arc(x(time), y(absorbance), 3.5, 0, Math.PI * 2);
        context.fillStyle = "#071713";
        context.fill();
        context.strokeStyle = "#b5ffd0";
        context.lineWidth = 2;
        context.stroke();
      });

      context.fillStyle = "rgba(214, 235, 226, 0.7)";
      context.fillText("Time value (unit unconfirmed)", width / 2 - 76, height - 1);
      context.save();
      context.translate(10, height / 2 + 36);
      context.rotate(-Math.PI / 2);
      context.fillText("Absorbance", 0, 0);
      context.restore();
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="growth-canvas"
      aria-label="Pseudomonas growth curve: absorbance rises from zero to 0.71 at time 25, then declines slightly to 0.66 at time 50."
      role="img"
    />
  );
}

function ReactorScene({
  selected,
  onSelect,
}: {
  selected: keyof typeof hotspots;
  onSelect: (key: keyof typeof hotspots) => void;
}) {
  const rigRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rigRef.current?.style.setProperty("--rotate-y", `${x * 12}deg`);
    rigRef.current?.style.setProperty("--rotate-x", `${-y * 8}deg`);
  };

  const resetRotation = () => {
    rigRef.current?.style.setProperty("--rotate-y", "-6deg");
    rigRef.current?.style.setProperty("--rotate-x", "3deg");
  };

  return (
    <div
      className="reactor-viewport"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetRotation}
      aria-label="Interactive double-chamber microbial fuel-cell model"
    >
      <div className="reactor-aura" />
      <div className="reactor-rig" ref={rigRef}>
        <div className="wire wire-left" />
        <div className="wire wire-top" />
        <div className="wire wire-right" />
        <div className="electron electron-one" />
        <div className="electron electron-two" />

        <div className="chamber chamber-anode">
          <div className="chamber-cap" />
          <div className="liquid liquid-anode" />
          <div className="rod rod-anode" />
          <i className="microbe microbe-a" />
          <i className="microbe microbe-b" />
          <i className="microbe microbe-c" />
          <span className="chamber-label">ANODE</span>
        </div>

        <div className="salt-bridge">
          <div className="bridge-core">
            <i className="proton proton-one" />
            <i className="proton proton-two" />
            <i className="proton proton-three" />
          </div>
        </div>

        <div className="chamber chamber-cathode">
          <div className="chamber-cap" />
          <div className="liquid liquid-cathode" />
          <div className="rod rod-cathode" />
          <i className="bubble bubble-a" />
          <i className="bubble bubble-b" />
          <span className="chamber-label">CATHODE</span>
        </div>
      </div>

      <div className="scene-readout">
        <span>e⁻ external circuit</span>
        <span>H⁺ ionic bridge</span>
      </div>

      <div className="hotspot-controls" aria-label="MFC component selector">
        {(Object.keys(hotspots) as Array<keyof typeof hotspots>).map((key) => (
          <button
            key={key}
            type="button"
            className={selected === key ? "hotspot is-active" : "hotspot"}
            onClick={() => onSelect(key)}
            aria-pressed={selected === key}
          >
            {hotspots[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BioVoltExperience() {
  const [selectedHotspot, setSelectedHotspot] =
    useState<keyof typeof hotspots>("anode");
  const [paperFilter, setPaperFilter] = useState<"All" | PaperKind>("All");
  const [experimentView, setExperimentView] = useState<
    "apparatus" | "microbiology" | "growth"
  >("apparatus");
  const [simulation, setSimulation] = useState({
    temperature: 30,
    ph: 7,
    resistance: 1000,
    hrt: 24,
  });

  const visiblePapers = useMemo(
    () =>
      paperFilter === "All"
        ? papers
        : papers.filter((paper) => paper.kind === paperFilter),
    [paperFilter],
  );

  const simulationResult = useMemo(() => {
    const tempFactor = Math.exp(-Math.pow((simulation.temperature - 30) / 10, 2));
    const phFactor = Math.exp(-Math.pow((simulation.ph - 7) / 1.8, 2));
    const resistanceFactor = Math.exp(
      -Math.pow(Math.log(simulation.resistance / 1000) / 0.95, 2),
    );
    const hrtFactor = 0.58 + 0.42 * (1 - Math.exp(-simulation.hrt / 20));
    const power = Math.max(
      12,
      Math.round(260 * tempFactor * phFactor * resistanceFactor * hrtFactor),
    );
    const cod = Math.max(
      18,
      Math.min(
        94,
        Math.round(
          42 +
            simulation.hrt * 0.82 +
            phFactor * 15 +
            tempFactor * 8 -
            Math.abs(simulation.temperature - 30) * 0.5,
        ),
      ),
    );
    return { power, cod, low: Math.round(power * 0.62), high: Math.round(power * 1.38) };
  }, [simulation]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="BioVolt AI home">
          <span className="brand-mark">BV</span>
          <span>
            <strong>BioVolt AI</strong>
            <small>MFC research intelligence</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#evidence">Research</a>
          <a href="#experiment">My experiment</a>
          <a href="#twin">Digital twin</a>
        </nav>
        <a className="header-cta" href="#experiment">
          Explore the record
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Evidence-led bioelectricity
          </p>
          <h1>
            From microbial metabolism to <em>measurable electricity.</em>
          </h1>
          <p className="hero-lede">
            BioVolt AI connects published MFC evidence, a real college experiment,
            and an evolving digital twin—without hiding where the data came from.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#evidence">
              Enter the evidence library
            </a>
            <a className="button button-secondary" href="#twin">
              Try the twin preview
            </a>
          </div>
          <dl className="hero-metrics">
            <div>
              <dt>21</dt>
              <dd>historical slides reviewed</dd>
            </div>
            <div>
              <dt>11</dt>
              <dd>growth observations</dd>
            </div>
            <div>
              <dt>0.61 V</dt>
              <dd>image-derived evidence</dd>
            </div>
          </dl>
        </div>

        <div className="hero-visual">
          <ReactorScene selected={selectedHotspot} onSelect={setSelectedHotspot} />
          <div className="hotspot-detail" aria-live="polite">
            <span>{hotspots[selectedHotspot].evidence}</span>
            <strong>{hotspots[selectedHotspot].label}</strong>
            <p>{hotspots[selectedHotspot].copy}</p>
          </div>
        </div>
      </section>

      <section className="evidence-strip" aria-label="Data provenance legend">
        <span>Every number carries its provenance</span>
        <ul>
          <li><i className="dot measured" /> Measured</li>
          <li><i className="dot documented" /> Documented</li>
          <li><i className="dot image-derived" /> Image-derived</li>
          <li><i className="dot synthetic" /> Synthetic</li>
        </ul>
      </section>

      <section className="section" id="evidence">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow"><span /> Research library</p>
            <h2>Turn reading into structured evidence.</h2>
          </div>
          <p>
            The first records come from your presentation. Full DOI, journal,
            volume and page details remain visibly pending until the source papers
            are uploaded or verified.
          </p>
        </div>

        <div className="filter-row" aria-label="Filter papers">
          {(["All", "Review", "Primary research"] as const).map((filter) => (
            <button
              type="button"
              key={filter}
              className={paperFilter === filter ? "filter is-active" : "filter"}
              onClick={() => setPaperFilter(filter)}
              aria-pressed={paperFilter === filter}
            >
              {filter}
            </button>
          ))}
          <span>{visiblePapers.length} records shown</span>
        </div>

        <div className="paper-list">
          {visiblePapers.map((paper, index) => (
            <article className="paper-row" key={`${paper.title}-${paper.year}`}>
              <div className="paper-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="paper-main">
                <div className="paper-meta">
                  <span>{paper.kind}</span>
                  <span>{paper.year}</span>
                  <span>{paper.focus}</span>
                </div>
                <h3>{paper.title}</h3>
                <p>{paper.authors}</p>
              </div>
              <div className="paper-status">
                <i />
                {paper.status}
              </div>
            </article>
          ))}
        </div>
        <div className="section-note">
          Next library step: upload the PDFs, DOI list or BibTeX export so every
          citation and extracted value can be verified against its source.
        </div>
      </section>

      <section className="section experiment-section" id="experiment">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow"><span /> College experiment</p>
            <h2>A transparent record of what was actually done.</h2>
          </div>
          <p>
            Sambhar Lake isolates, microbial characterization, growth kinetics,
            and a double-chamber MFC—presented with gaps instead of filling them
            with assumptions.
          </p>
        </div>

        <div className="experiment-tabs" role="tablist" aria-label="Experiment views">
          {(
            [
              ["apparatus", "MFC apparatus"],
              ["microbiology", "Microbiology"],
              ["growth", "Growth curve"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={experimentView === key}
              className={experimentView === key ? "experiment-tab is-active" : "experiment-tab"}
              onClick={() => setExperimentView(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {experimentView === "apparatus" && (
          <div className="experiment-grid">
            <figure className="experiment-photo">
              <img
                src="/images/historical-mfc-setup.png"
                alt="Historical double-chamber microbial fuel cell with amber anolyte, purple catholyte and salt bridge"
              />
              <figcaption>
                Historical setup · double chamber · photographic evidence
              </figcaption>
            </figure>
            <div className="experiment-details">
              <div className="detail-block">
                <span className="record-state documented-state">Documented</span>
                <h3>Double-chamber construction</h3>
                <dl className="fact-list">
                  <div><dt>Anode</dt><dd>Halophilic broth</dd></div>
                  <div><dt>Cathode</dt><dd>KMnO₄ solution</dd></div>
                  <div><dt>Bridge</dt><dd>KNO₃ + agar</dd></div>
                  <div><dt>Electrodes</dt><dd>Graphite rods</dd></div>
                </dl>
              </div>
              <div className="electrode-record">
                <img src="/images/graphite-electrodes.png" alt="Pair of pointed graphite rod electrodes" />
                <div>
                  <span className="record-state verify-state">Needs verification</span>
                  <h3>Achalnath Tools graphite rod</h3>
                  <p>
                    Listed as 6 × 1 × 1 cm, while the product description also
                    says 6 inches. Actual diameter, immersed length, grade and
                    exposed surface area must be measured before power density is
                    calculated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {experimentView === "microbiology" && (
          <div className="microbiology-grid">
            <div className="protocol-timeline">
              {[
                ["01", "Sampling", "Water and salt samples collected from Sambhar Lake."],
                ["02", "Isolation", "Mueller Hinton Agar with 7.5% NaCl and Mannitol Motility Agar with 5% NaCl."],
                ["03", "Characterization", "Gram-positive rods with colony and biochemical testing."],
                ["04", "MFC inoculation", "Halophilic broth introduced into the anodic chamber."],
              ].map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </article>
              ))}
            </div>
            <div className="character-table-wrap">
              <h3>Isolate comparison</h3>
              <table>
                <thead><tr><th>Test</th><th>Water</th><th>Salt</th></tr></thead>
                <tbody>
                  <tr><td>Gram reaction</td><td>Positive</td><td>Positive</td></tr>
                  <tr><td>Colony diameter</td><td>0.7 cm</td><td>0.9 cm</td></tr>
                  <tr><td>Catalase</td><td>Positive</td><td>Negative</td></tr>
                  <tr><td>Motility</td><td>Negative</td><td>Negative</td></tr>
                  <tr><td>Triple Sugar Iron</td><td>Negative</td><td>Positive</td></tr>
                </tbody>
              </table>
              <p className="table-note">Phenotype does not establish species identity.</p>
            </div>
          </div>
        )}

        {experimentView === "growth" && (
          <div className="growth-grid">
            <div className="growth-chart-wrap">
              <div className="chart-heading">
                <div><span>Measured workbook values</span><h3>Pseudomonas growth curve</h3></div>
                <strong>n = 11</strong>
              </div>
              <GrowthCurve />
            </div>
            <div className="growth-summary">
              <span className="record-state measured-state">Measured</span>
              <div><strong>0.71</strong><span>maximum absorbance</span></div>
              <div><strong>25–29</strong><span>observed plateau time</span></div>
              <div><strong>0.66</strong><span>final absorbance</span></div>
              <p>
                Time unit, wavelength, culture conditions and replicates are not
                present in the workbook. They remain blank in the normalized data.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="section twin-section" id="twin">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow"><span /> Digital twin preview</p>
            <h2>Explore the interface before a trained model exists.</h2>
          </div>
          <p>
            This interactive preview uses an illustrative response surface—not
            experimental predictions. It demonstrates how future validated models
            will communicate trade-offs and uncertainty.
          </p>
        </div>

        <div className="twin-grid">
          <form className="twin-controls" onSubmit={(event) => event.preventDefault()}>
            <div className="simulation-label">
              <span className="record-state synthetic-state">Synthetic preview</span>
              <p>Adjust proposed operating conditions</p>
            </div>
            <label>
              <span>Temperature <strong>{simulation.temperature} °C</strong></span>
              <input
                type="range" min="18" max="42" step="1"
                value={simulation.temperature}
                onChange={(event) => setSimulation({ ...simulation, temperature: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>pH <strong>{simulation.ph.toFixed(1)}</strong></span>
              <input
                type="range" min="4.5" max="9.5" step="0.1"
                value={simulation.ph}
                onChange={(event) => setSimulation({ ...simulation, ph: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>External resistance <strong>{simulation.resistance} Ω</strong></span>
              <input
                type="range" min="100" max="3000" step="100"
                value={simulation.resistance}
                onChange={(event) => setSimulation({ ...simulation, resistance: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>HRT <strong>{simulation.hrt} h</strong></span>
              <input
                type="range" min="4" max="72" step="2"
                value={simulation.hrt}
                onChange={(event) => setSimulation({ ...simulation, hrt: Number(event.target.value) })}
              />
            </label>
          </form>

          <div className="twin-output" aria-live="polite">
            <div className="output-header">
              <span>Illustrative response</span>
              <i className="status-pulse" />
            </div>
            <div className="output-primary">
              <div><span>Power density</span><strong>{simulationResult.power}</strong><small>mW/m²</small></div>
              <div><span>COD removal</span><strong>{simulationResult.cod}</strong><small>%</small></div>
            </div>
            <div className="interval-bar">
              <span>Illustrative range</span>
              <div><i style={{ left: "14%", right: "14%" }} /><b style={{ left: "50%" }} /></div>
              <p>{simulationResult.low} — {simulationResult.high} mW/m²</p>
            </div>
            <div className="recommendation-copy">
              <span>How the real system will respond</span>
              <p>
                It will show predicted outcomes, a validated prediction interval,
                the closest historical experiments, data-domain warnings and the
                variables driving each recommendation.
              </p>
            </div>
          </div>
        </div>
        <p className="simulation-disclaimer">
          Demonstration only. These values are not trained on your experiment and
          must not be used to operate an MFC.
        </p>
      </section>

      <section className="next-step-section">
        <p className="eyebrow"><span /> Build sequence</p>
        <h2>The next evidence makes the next feature possible.</h2>
        <ol>
          <li><span>01</span><strong>Verify citations</strong><p>Upload papers or DOI/BibTeX records.</p></li>
          <li><span>02</span><strong>Recover metadata</strong><p>Confirm growth units and electrode dimensions.</p></li>
          <li><span>03</span><strong>Expand observations</strong><p>Add voltage, resistance, current and COD records.</p></li>
          <li><span>04</span><strong>Train responsibly</strong><p>Activate models only after grouped validation.</p></li>
        </ol>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">BV</span>
          <span><strong>BioVolt AI</strong><small>Research with provenance</small></span>
        </a>
        <p>Created from Yatharth Sharma&apos;s historical MFC research record.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
