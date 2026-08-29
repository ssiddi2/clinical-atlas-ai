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
  | "onboarding"
  | "media"
  | "diagram"
  | "artifact";

/** Which expanded flow opens when the card itself is tapped. */
export type CardJourney = "topic" | "lecture" | "drill" | "media" | "diagram";


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
  /** Expanded journey opened from the card body. */
  journey?: CardJourney;
  /** Curriculum topic behind the card, when there is one. */
  topicId?: string;
  /** Virtual classroom behind the card, when there is one. */
  classroomId?: string;
  /** Concept tags used to pull practice questions. */
  focus?: string[];
  /** Best-guess QBank subject for drill filtering. */
  subject?: string;
  /** Preview / teaching image shown on the card and in the media journey. */
  imageUrl?: string;
  /** Teaching caption for media cards. */
  caption?: string;
  /** Attribution for media cards. */
  credit?: string;
  license?: string;
  /** Page the image came from. */
  sourceUrl?: string;
  /** Row id in medical_media, when the card came from the curated library. */
  mediaId?: string;
  /** Row id in atlas_artifacts, when the card came from the student's library. */
  artifactId?: string;
  /** Diagram scene id from the animated diagram library. */
  sceneId?: string;
}


export interface CardState {
  bookmarked: boolean;
  group_name: string | null;
  group_id?: string | null;
  snoozed_until: string | null;
  dismissed: boolean;
}
