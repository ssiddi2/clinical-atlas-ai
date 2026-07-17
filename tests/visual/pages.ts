/**
 * List of public routes captured by the visual regression suite.
 * Add a new entry here and the test file picks it up automatically.
 */
export interface VisualPage {
  name: string;
  path: string;
  /** CSS selector to wait for before capture. Defaults to `main`. */
  waitFor?: string;
}

export const pages: VisualPage[] = [
  { name: "landing", path: "/" },
  { name: "programs", path: "/programs" },
  { name: "rotations", path: "/rotations" },
  { name: "institutions", path: "/institutions" },
  { name: "residency", path: "/residency" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "apply", path: "/apply" },
  { name: "auth", path: "/auth" },
  { name: "terms", path: "/terms" },
  { name: "privacy", path: "/privacy" },
];