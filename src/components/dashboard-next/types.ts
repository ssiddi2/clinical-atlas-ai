import type { LucideIcon } from "lucide-react";

export type CardType =
  | "live"
  | "lecture"
  | "invite"
  | "resume"
  | "weak-area"
  | "qbank"
  | "score"
  | "verification"
  | "onboarding";

export interface PredictiveCard {
  /** Stable key used to persist bookmark / snooze / dismiss state. */
  key: string;
  type: CardType;
  /** Higher surfaces first. */
  priority: number;
  eyebrow: string;
  title: string;
  body?: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip background. */
  tone: string;
  href?: string;
  ctaLabel?: string;
  /** Hidden framing handed to ATLAS when the student asks about this card. */
  atlasContext: string;
  /** Pre-filled question when the student taps "Ask ATLAS". */
  askPrompt: string;
  /** Pre-filled request when the student taps "Build study guide". */
  studyGuidePrompt: string;
}

export interface CardState {
  bookmarked: boolean;
  group_name: string | null;
  snoozed_until: string | null;
  dismissed: boolean;
}
