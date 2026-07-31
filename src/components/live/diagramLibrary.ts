/** Reusable, step-through clinical animation scenes professors can push to the class. */
export interface DiagramStep {
  label: string;
  description: string;
  svgElements: string;
  highlight?: string;
}

export interface DiagramScene {
  id: string;
  title: string;
  viewBox: string;
  steps: DiagramStep[];
}

const BLUE = "#0077C8";
const INK = "#002B49";
const RED = "#DC2626";

export const DIAGRAM_LIBRARY: DiagramScene[] = [
  {
    id: "acs-pathway",
    title: "Acute Coronary Syndrome — plaque to infarct",
    viewBox: "0 0 400 300",
    steps: [
      {
        label: "Normal coronary artery",
        description: "Laminar flow through a patent lumen. Endothelium is intact and non-thrombogenic.",
        svgElements: `<path d="M40 150 C 120 90, 280 210, 360 150" stroke="${INK}" stroke-width="26" fill="none" stroke-linecap="round" opacity="0.25"/><path d="M40 150 C 120 90, 280 210, 360 150" stroke="${RED}" stroke-width="14" fill="none" stroke-linecap="round"/>`,
      },
      {
        label: "Atherosclerotic plaque",
        description: "Lipid-laden intimal plaque narrows the lumen. Flow-limiting stenosis produces exertional angina.",
        svgElements: `<ellipse cx="205" cy="153" rx="34" ry="13" fill="#F2C94C" stroke="${INK}" stroke-width="2"/>`,
      },
      {
        label: "Plaque rupture",
        description: "The thin fibrous cap ruptures, exposing thrombogenic lipid core and collagen to circulating platelets.",
        svgElements: `<path d="M188 143 l10 -14 l8 12 l10 -10" stroke="${RED}" stroke-width="3" fill="none"/>`,
      },
      {
        label: "Occlusive thrombus",
        description: "Platelet aggregation and fibrin form an occlusive thrombus — complete occlusion causes transmural (STEMI) infarction.",
        svgElements: `<circle cx="205" cy="152" r="20" fill="${INK}"/><text x="205" y="200" font-size="13" text-anchor="middle" fill="${INK}">Occlusion → STEMI</text>`,
      },
    ],
  },
  {
    id: "nephron-diuretics",
    title: "Nephron — diuretic sites of action",
    viewBox: "0 0 400 300",
    steps: [
      {
        label: "Nephron overview",
        description: "Filtrate flows from glomerulus → proximal tubule → loop of Henle → distal tubule → collecting duct.",
        svgElements: `<path d="M60 60 C 130 40, 150 120, 130 150 L130 210 C 130 250, 200 250, 210 210 L230 120 C 240 70, 320 70, 330 120 L330 240" stroke="${BLUE}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="55" cy="60" r="18" fill="none" stroke="${INK}" stroke-width="4"/>`,
      },
      {
        label: "Proximal tubule",
        description: "Acetazolamide inhibits carbonic anhydrase here → bicarbonate diuresis and metabolic acidosis.",
        svgElements: `<circle cx="128" cy="120" r="12" fill="${RED}" opacity="0.8"/><text x="150" y="118" font-size="11" fill="${INK}">Acetazolamide</text>`,
      },
      {
        label: "Thick ascending limb",
        description: "Loop diuretics block NKCC2 → most potent diuresis, loss of the medullary gradient, hypokalaemia and hypocalcaemia.",
        svgElements: `<circle cx="205" cy="215" r="12" fill="${RED}" opacity="0.8"/><text x="222" y="228" font-size="11" fill="${INK}">Furosemide</text>`,
      },
      {
        label: "Distal tubule & collecting duct",
        description: "Thiazides block NCC (hypercalcaemia, hyponatraemia); spironolactone antagonises aldosterone (hyperkalaemia).",
        svgElements: `<circle cx="245" cy="105" r="12" fill="${RED}" opacity="0.8"/><text x="262" y="103" font-size="11" fill="${INK}">Thiazide</text><circle cx="330" cy="205" r="12" fill="${RED}" opacity="0.8"/><text x="250" y="255" font-size="11" fill="${INK}">Spironolactone</text>`,
      },
    ],
  },
  {
    id: "shock-hemodynamics",
    title: "Shock — haemodynamic profiles",
    viewBox: "0 0 400 300",
    steps: [
      {
        label: "The three levers",
        description: "Every shock state is described by preload (CVP/PCWP), pump (cardiac output) and afterload (SVR).",
        svgElements: `<rect x="30" y="60" width="100" height="180" rx="12" fill="none" stroke="${INK}" stroke-width="3"/><rect x="150" y="60" width="100" height="180" rx="12" fill="none" stroke="${INK}" stroke-width="3"/><rect x="270" y="60" width="100" height="180" rx="12" fill="none" stroke="${INK}" stroke-width="3"/><text x="80" y="50" font-size="12" text-anchor="middle" fill="${INK}">Preload</text><text x="200" y="50" font-size="12" text-anchor="middle" fill="${INK}">Output</text><text x="320" y="50" font-size="12" text-anchor="middle" fill="${INK}">SVR</text>`,
      },
      {
        label: "Hypovolaemic",
        description: "Low preload, low output, compensatory high SVR — cool, clamped extremities. Treat with volume.",
        svgElements: `<rect x="40" y="200" width="80" height="30" fill="${BLUE}"/><rect x="160" y="200" width="80" height="30" fill="${BLUE}"/><rect x="280" y="90" width="80" height="140" fill="${BLUE}"/>`,
      },
      {
        label: "Cardiogenic",
        description: "High preload, low output, high SVR — congested and cold. Treat the pump, not the tank.",
        svgElements: `<rect x="40" y="90" width="80" height="140" fill="${INK}" opacity="0.7"/><rect x="160" y="205" width="80" height="25" fill="${INK}" opacity="0.7"/><rect x="280" y="100" width="80" height="130" fill="${INK}" opacity="0.7"/>`,
      },
      {
        label: "Distributive (septic)",
        description: "Low preload, high output, low SVR — warm and vasoplegic. Fluids then noradrenaline.",
        svgElements: `<rect x="40" y="195" width="80" height="35" fill="${RED}" opacity="0.75"/><rect x="160" y="95" width="80" height="135" fill="${RED}" opacity="0.75"/><rect x="280" y="205" width="80" height="25" fill="${RED}" opacity="0.75"/>`,
      },
    ],
  },
];

export const findScene = (id?: string) => DIAGRAM_LIBRARY.find((s) => s.id === id);