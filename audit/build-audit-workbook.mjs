import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = new URL("../", import.meta.url);
const outputDir = new URL("../audit-output/", import.meta.url);
await fs.mkdir(outputDir, { recursive: true });

const evidenceCsv = await fs.readFile(new URL("../public/audit/literature-audit.csv", import.meta.url), "utf8");
const paperCsv = await fs.readFile(new URL("../public/audit/paper-register.csv", import.meta.url), "utf8");
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(cell); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
};

const workbook = await Workbook.fromCSV(evidenceCsv, { sheetName: "Evidence rows" });
const evidence = workbook.worksheets.getItem("Evidence rows");

const readme = workbook.worksheets.add("README");
readme.showGridLines = false;
readme.getRange("A1:B1").merge();
readme.getRange("A1").values = [["BioVolt AI literature audit / v0.1"]];
readme.getRange("A3:B9").values = [
  ["Purpose", "Prepare traceable, condition-level evidence before building the MFC performance estimator."],
  ["Paper register", "14 records: 6 reviews, 6 primary research papers and 2 supporting sources."],
  ["Condition rows", "Each row represents one reported substrate, salinity, load or treatment condition."],
  ["Missing values", "Blank means not reported in a comparable form; it is not an inferred zero."],
  ["Quality rule", "Open-circuit voltage, loaded voltage, peak power and current density remain separate fields."],
  ["Private source", "PDF 11 was reviewed privately; only derived fields and citation metadata are included."],
  ["Next gate", "Review units and flags before using rows for a literature-anchored calculator estimate."],
];
readme.getRange("A1:B1").format = { fill: "#141714", font: { bold: true, color: "#FFFFFF", size: 15 } };
readme.getRange("A3:A9").format = { fill: "#E8E5DC", font: { bold: true, color: "#141714" } };
readme.getRange("A1:B9").format.wrapText = true;
readme.getRange("A1:A9").format.columnWidth = 20;
readme.getRange("B1:B9").format.columnWidth = 95;
readme.getRange("A1:B9").format.rowHeight = 24;
readme.getRange("A1:B1").format.rowHeight = 32;

evidence.showGridLines = false;
evidence.freezePanes.freezeRows(1);
evidence.getUsedRange().format.wrapText = true;
evidence.getRange("A1:X1").format = { fill: "#174EE6", font: { bold: true, color: "#FFFFFF" }, wrapText: true };
evidence.getRange("A1:A17").format.columnWidth = 22;
evidence.getRange("B1:E17").format.columnWidth = 16;
evidence.getRange("F1:F17").format.columnWidth = 27;
evidence.getRange("G1:I17").format.columnWidth = 28;
evidence.getRange("J1:J17").format.columnWidth = 24;
evidence.getRange("K1:U17").format.columnWidth = 15;
evidence.getRange("V1:V17").format.columnWidth = 32;
evidence.getRange("W1:W17").format.columnWidth = 20;
evidence.getRange("X1:X17").format.columnWidth = 56;
evidence.getRange("A1:X17").format.borders = { insideHorizontal: { style: "thin", color: "#D9D9D9" }, bottom: { style: "thin", color: "#D9D9D9" } };

const papers = workbook.worksheets.add("Paper register");
const paperValues = parseCsv(paperCsv);
papers.getRange(`A1:G${paperValues.length}`).values = paperValues;
papers.showGridLines = false;
papers.freezePanes.freezeRows(1);
papers.getUsedRange().format.wrapText = true;
papers.getRange("A1:G1").format = { fill: "#174EE6", font: { bold: true, color: "#FFFFFF" }, wrapText: true };
papers.getRange(`A1:A${paperValues.length}`).format.columnWidth = 16;
papers.getRange(`B1:B${paperValues.length}`).format.columnWidth = 18;
papers.getRange(`C1:C${paperValues.length}`).format.columnWidth = 10;
papers.getRange(`D1:D${paperValues.length}`).format.columnWidth = 62;
papers.getRange(`E1:E${paperValues.length}`).format.columnWidth = 38;
papers.getRange(`F1:G${paperValues.length}`).format.columnWidth = 40;

const evidencePreview = await evidence.getRange("A1:J17").getCurrentRegion();
const inspection = await workbook.inspect({ kind: "workbook,sheet,table", maxChars: 5000, tableMaxRows: 4, tableMaxCols: 8 });
console.log(inspection.ndjson);
const preview = await workbook.render({ sheetName: "README", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(new URL("../audit-output/readme-preview.png", import.meta.url), new Uint8Array(await preview.arrayBuffer()));
const evidencePreviewImage = await workbook.render({ sheetName: "Evidence rows", range: "A1:J17", scale: 1, format: "png" });
await fs.writeFile(new URL("../audit-output/evidence-preview.png", import.meta.url), new Uint8Array(await evidencePreviewImage.arrayBuffer()));
const paperPreviewImage = await workbook.render({ sheetName: "Paper register", range: "A1:G15", scale: 1, format: "png" });
await fs.writeFile(new URL("../audit-output/paper-register-preview.png", import.meta.url), new Uint8Array(await paperPreviewImage.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(fileURLToPath(new URL("../audit-output/Literature_Audit.xlsx", import.meta.url)));
console.log("Wrote Literature_Audit.xlsx");
