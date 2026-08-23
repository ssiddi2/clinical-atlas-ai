export type StepKey = "objectives" | "reading" | "videos" | "images" | "discussion" | "mcqs";

export interface SessionStep {
  id: string;
  topic_id: string;
  step_key: StepKey;
  title: string;
  description: string | null;
  duration_minutes: number;
  sort_order: number;
}

export interface SessionItem {
  id: string;
  step_id: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  url: string | null;
  source: string | null;
  image_url: string | null;
  duration_label: string | null;
}

/** The standard pre-session flow, applied to any learning unit in any course. */
export const DEFAULT_STEPS: Array<Omit<SessionStep, "id" | "topic_id">> = [
  { step_key: "objectives", title: "Review the objectives", description: "What you should be able to do by the end of the session.", duration_minutes: 2, sort_order: 0 },
  { step_key: "reading", title: "Preliminary reading", description: "Skim these before the videos. They give you the search pattern the didactic assumes.", duration_minutes: 8, sort_order: 1 },
  { step_key: "videos", title: "Watch the didactic block", description: "Embedded from the original source and linked back to it; nothing is rehosted.", duration_minutes: 43, sort_order: 2 },
  { step_key: "images", title: "Review the images", description: "One film per finding. Open a case to see what it teaches.", duration_minutes: 8, sort_order: 3 },
  { step_key: "discussion", title: "Come ready to discuss", description: "The faculty block runs to this shape. Have an answer ready for each.", duration_minutes: 15, sort_order: 4 },
  { step_key: "mcqs", title: "Answer the MCQs", description: "Pick an answer and you will see why that option is right or wrong.", duration_minutes: 8, sort_order: 5 },
];

export const STEP_COUNT_LABEL: Record<StepKey, (n: number) => string> = {
  objectives: n => `${n} objective${n === 1 ? "" : "s"}`,
  reading: n => `${n} short reference${n === 1 ? "" : "s"}`,
  videos: n => `${n} video${n === 1 ? "" : "s"}`,
  images: n => `${n} case${n === 1 ? "" : "s"}`,
  discussion: n => `${n} prompt${n === 1 ? "" : "s"}`,
  mcqs: n => `${n} question${n === 1 ? "" : "s"}`,
};

export function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
