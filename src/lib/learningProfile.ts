// Learning Profile Assessment — research-backed (VARK, Kolb, MSLQ, cognitive load).
// Stored as JSONB on profiles.learning_profile.

export type VarkKey = "visual" | "aural" | "read" | "kinesthetic";
export type KolbStyle = "diverger" | "assimilator" | "converger" | "accommodator";
export type TestAnxiety = "low" | "moderate" | "high";
export type ChunkPref = "micro" | "balanced" | "long";
export type AmbiguityTol = "low" | "moderate" | "high";
export type ClinicalStage = "pre_clinical" | "early_clinical" | "sub_i" | "post_grad";

export interface LearningProfile {
  vark: Record<VarkKey, number> & { dominant: VarkKey };
  kolb_style: KolbStyle;
  self_regulation_score: number; // 0-100
  test_anxiety: TestAnxiety;
  preferred_session_min: 5 | 15 | 30 | 60;
  chunk_preference: ChunkPref;
  ambiguity_tolerance: AmbiguityTol;
  english_comfort: 1 | 2 | 3 | 4 | 5;
  clinical_stage: ClinicalStage;
  prior_qbank: string[];
  assessed_at: string;
}

// ── Question schema ──────────────────────────────────────────────────────

export type QuestionType = "single" | "multi" | "likert";

export interface AssessmentQuestion {
  id: string;
  section: "vark" | "kolb" | "mslq" | "pacing" | "context";
  type: QuestionType;
  prompt: string;
  // For single/multi: options with optional scoring weight
  options?: { value: string; label: string }[];
  // For likert: a 1-5 scale labelled at extremes
  likert?: { low: string; high: string };
}

export const SECTIONS: { id: AssessmentQuestion["section"]; title: string; subtitle: string }[] = [
  { id: "vark", title: "How you take information in", subtitle: "Pick what feels most natural — there are no wrong answers." },
  { id: "kolb", title: "How you process new ideas", subtitle: "Case-first vs. theory-first." },
  { id: "mslq", title: "How you study", subtitle: "Rate how true each statement is for you." },
  { id: "pacing", title: "Your pacing & focus", subtitle: "How long and how deep you like to go." },
  { id: "context", title: "Where you are clinically", subtitle: "So we calibrate difficulty correctly." },
];

export const QUESTIONS: AssessmentQuestion[] = [
  // VARK (4)
  { id: "v1", section: "vark", type: "multi", prompt: "When learning a new disease, I understand it best when I…",
    options: [
      { value: "visual", label: "See a diagram or flowchart" },
      { value: "aural", label: "Hear it explained in a lecture or podcast" },
      { value: "read", label: "Read a textbook chapter" },
      { value: "kinesthetic", label: "Work through a patient case" },
    ] },
  { id: "v2", section: "vark", type: "single", prompt: "A confusing concept finally clicks for me when someone…",
    options: [
      { value: "visual", label: "Draws it out on a whiteboard" },
      { value: "aural", label: "Talks me through it step by step" },
      { value: "read", label: "Gives me clear written notes" },
      { value: "kinesthetic", label: "Has me do practice questions on it" },
    ] },
  { id: "v3", section: "vark", type: "single", prompt: "I retain pharmacology best via…",
    options: [
      { value: "visual", label: "Mnemonic images and mechanism diagrams" },
      { value: "aural", label: "Spoken explanations" },
      { value: "read", label: "Written tables and bullet lists" },
      { value: "kinesthetic", label: "Patient cases where I pick the drug" },
    ] },
  { id: "v4", section: "vark", type: "single", prompt: "Given 30 minutes to learn ECGs, I would…",
    options: [
      { value: "visual", label: "Watch an annotated video" },
      { value: "aural", label: "Listen to a lecture or podcast" },
      { value: "read", label: "Read a chapter with example strips" },
      { value: "kinesthetic", label: "Practice interpreting strips immediately" },
    ] },

  // Kolb (3) — value 'ce' = concrete experience (case-first), 'ac' = abstract (theory-first),
  // 'ro' = reflective, 'ae' = active experimentation
  { id: "k1", section: "kolb", type: "single", prompt: "I prefer to start a new topic with…",
    options: [
      { value: "ce", label: "A real patient case" },
      { value: "ac", label: "The underlying mechanism or framework" },
    ] },
  { id: "k2", section: "kolb", type: "single", prompt: "After a lecture, I learn most by…",
    options: [
      { value: "ro", label: "Reflecting, taking notes, organizing ideas" },
      { value: "ae", label: "Immediately doing practice questions" },
    ] },
  { id: "k3", section: "kolb", type: "single", prompt: "I'd rather be given…",
    options: [
      { value: "ac", label: "A framework I can apply to many cases" },
      { value: "ce", label: "Examples I can derive the rule from" },
    ] },

  // MSLQ subset (5) — Likert. m_anxiety is reverse-coded into self_regulation.
  { id: "m1", section: "mslq", type: "likert", prompt: "I set specific study goals each week.", likert: { low: "Rarely", high: "Always" } },
  { id: "m2", section: "mslq", type: "likert", prompt: "When I don't understand, I keep trying different strategies.", likert: { low: "Rarely", high: "Always" } },
  { id: "m_anxiety", section: "mslq", type: "likert", prompt: "I get anxious during timed tests.", likert: { low: "Never", high: "Very often" } },
  { id: "m3", section: "mslq", type: "likert", prompt: "I review material at spaced intervals rather than cramming.", likert: { low: "Rarely", high: "Always" } },
  { id: "m4", section: "mslq", type: "likert", prompt: "I can study for 45+ minutes without losing focus.", likert: { low: "Rarely", high: "Always" } },

  // Pacing (3)
  { id: "p1", section: "pacing", type: "single", prompt: "My ideal lesson length is…",
    options: [
      { value: "5", label: "5 minutes (micro)" },
      { value: "15", label: "15 minutes" },
      { value: "30", label: "30 minutes" },
      { value: "60", label: "60 minutes (deep dive)" },
    ] },
  { id: "p2", section: "pacing", type: "single", prompt: "I prefer content in…",
    options: [
      { value: "micro", label: "Short cards / quick notes" },
      { value: "balanced", label: "A mix" },
      { value: "long", label: "Long-form chapters" },
    ] },
  { id: "p3", section: "pacing", type: "likert", prompt: "I'm comfortable when a case has no single right answer.", likert: { low: "Uncomfortable", high: "Very comfortable" } },

  // Context (3)
  { id: "c1", section: "context", type: "multi", prompt: "Which QBanks have you used before?",
    options: [
      { value: "none", label: "None yet" },
      { value: "uworld", label: "UWorld" },
      { value: "amboss", label: "Amboss" },
      { value: "kaplan", label: "Kaplan" },
      { value: "other", label: "Other" },
    ] },
  { id: "c2", section: "context", type: "likert", prompt: "My comfort with English clinical vocabulary.", likert: { low: "Basic", high: "Fluent" } },
  { id: "c3", section: "context", type: "single", prompt: "My current clinical stage:",
    options: [
      { value: "pre_clinical", label: "Pre-clinical (years 1–2)" },
      { value: "early_clinical", label: "Early clinical (years 3–4)" },
      { value: "sub_i", label: "Sub-internship / final year" },
      { value: "post_grad", label: "Graduated / post-grad" },
    ] },
];

// ── Scoring ──────────────────────────────────────────────────────────────

export type Answers = Record<string, string | string[] | number>;

export function scoreProfile(answers: Answers): LearningProfile {
  // VARK weights
  const vark: Record<VarkKey, number> = { visual: 0, aural: 0, read: 0, kinesthetic: 0 };
  const varkQs = ["v1", "v2", "v3", "v4"];
  varkQs.forEach((qid) => {
    const a = answers[qid];
    if (Array.isArray(a)) a.forEach((v) => { if (v in vark) vark[v as VarkKey] += 1; });
    else if (typeof a === "string" && a in vark) vark[a as VarkKey] += 2;
  });
  const varkMax = Math.max(1, ...Object.values(vark));
  (Object.keys(vark) as VarkKey[]).forEach((k) => { vark[k] = +(vark[k] / varkMax).toFixed(2); });
  const dominant = (Object.keys(vark) as VarkKey[]).reduce((a, b) => vark[a] >= vark[b] ? a : b);

  // Kolb — Concrete vs Abstract × Reflective vs Active
  const ce_ac = [answers.k1, answers.k3].filter((v) => v === "ce").length
    - [answers.k1, answers.k3].filter((v) => v === "ac").length; // + = concrete
  const ro_ae = (answers.k2 === "ro" ? 1 : answers.k2 === "ae" ? -1 : 0); // + = reflective
  const kolb_style: KolbStyle =
    ce_ac >= 0 && ro_ae >= 0 ? "diverger" :
    ce_ac < 0 && ro_ae >= 0 ? "assimilator" :
    ce_ac < 0 && ro_ae < 0 ? "converger" : "accommodator";

  // MSLQ → self-regulation 0-100 (m_anxiety reverse-coded)
  const likert = (id: string) => Number(answers[id] ?? 3);
  const positive = ["m1", "m2", "m3", "m4"].reduce((s, id) => s + likert(id), 0); // 4-20
  const anxRaw = likert("m_anxiety"); // 1-5, high = anxious
  const reg = ((positive - 4) / 16) * 100; // 0-100
  const self_regulation_score = Math.round(reg);
  const test_anxiety: TestAnxiety = anxRaw >= 4 ? "high" : anxRaw <= 2 ? "low" : "moderate";

  // Pacing
  const preferred_session_min = (Number(answers.p1) || 30) as 5 | 15 | 30 | 60;
  const chunk_preference = (answers.p2 as ChunkPref) || "balanced";
  const ambRaw = likert("p3");
  const ambiguity_tolerance: AmbiguityTol = ambRaw >= 4 ? "high" : ambRaw <= 2 ? "low" : "moderate";

  // Context
  const english_comfort = (likert("c2") as 1|2|3|4|5) || 3;
  const clinical_stage = (answers.c3 as ClinicalStage) || "pre_clinical";
  const prior_qbank = Array.isArray(answers.c1) ? (answers.c1 as string[]).filter((v) => v !== "none") : [];

  return {
    vark: { ...vark, dominant },
    kolb_style,
    self_regulation_score,
    test_anxiety,
    preferred_session_min,
    chunk_preference,
    ambiguity_tolerance,
    english_comfort,
    clinical_stage,
    prior_qbank,
    assessed_at: new Date().toISOString(),
  };
}

// Short, plain-English summary used both in the result card and in AI system prompts.
export function profileSummary(p: LearningProfile): string {
  const varkLabel: Record<VarkKey, string> = {
    visual: "visual (diagrams, mechanisms)",
    aural: "auditory (lectures, podcasts)",
    read: "reading/writing (notes, tables)",
    kinesthetic: "kinesthetic (cases, doing)",
  };
  const kolbLabel: Record<KolbStyle, string> = {
    diverger: "case-first, reflective",
    assimilator: "theory-first, reflective",
    converger: "theory-first, hands-on",
    accommodator: "case-first, hands-on",
  };
  return [
    `Dominant input: ${varkLabel[p.vark.dominant]}`,
    `Processing: ${kolbLabel[p.kolb_style]}`,
    `Self-regulation: ${p.self_regulation_score}/100`,
    `Test anxiety: ${p.test_anxiety}`,
    `Preferred session: ${p.preferred_session_min} min, ${p.chunk_preference} chunks`,
    `Ambiguity tolerance: ${p.ambiguity_tolerance}`,
    `English comfort: ${p.english_comfort}/5`,
    `Clinical stage: ${p.clinical_stage.replace("_", " ")}`,
  ].join(" • ");
}

// Returns 2-3 short "what changes for you" bullets.
export function profileTailoring(p: LearningProfile): string[] {
  const out: string[] = [];
  if (p.vark.dominant === "visual") out.push("Lessons will lead with diagrams and visual mechanisms.");
  if (p.vark.dominant === "kinesthetic") out.push("We'll send you straight to vignettes after short intros.");
  if (p.vark.dominant === "aural") out.push("Audio lectures and spoken explanations will be prioritized.");
  if (p.vark.dominant === "read") out.push("Written notes, tables, and chapters will be surfaced first.");
  if (p.kolb_style === "diverger" || p.kolb_style === "accommodator") out.push("Lessons open with a patient case; theory follows.");
  else out.push("Lessons open with the framework; cases follow.");
  if (p.test_anxiety === "high") out.push("Timers in practice quizzes will be hidden by default.");
  if (p.self_regulation_score < 50) out.push("You'll get smaller daily goals and weekly check-ins.");
  if (p.english_comfort <= 2) out.push("ATLAS will use simpler phrasing and define jargon.");
  return out.slice(0, 3);
}

// ── Adaptation: derive concrete UI/UX settings from the profile ─────────
// Pure function — used by hooks/components to tailor behaviour without
// scattering profile branching across the app.

export interface Adaptation {
  caseFirst: boolean;                 // Kolb diverger/accommodator → lead with case
  preferredTab: "explanation" | "quick_notes" | "questions";
  hideTimerByDefault: boolean;        // test_anxiety high
  recommendedQuestionCount: 5 | 10 | 20 | 40;
  recommendedDifficulty: ("easy" | "medium" | "hard")[];
  defaultMode: "tutor" | "timed";
  dailyGoalQuestions: number;
  sessionLengthMin: 5 | 15 | 30 | 60;
  simplifyLanguage: boolean;          // english_comfort <= 2
  showConfidenceSlider: boolean;      // off when anxiety high (reduces pressure)
  rationale: string;                  // one-line "why" for the chip tooltip
}

export function deriveAdaptation(p: LearningProfile | null | undefined): Adaptation | null {
  if (!p) return null;

  const caseFirst = p.kolb_style === "diverger" || p.kolb_style === "accommodator";
  const preferredTab: Adaptation["preferredTab"] =
    p.vark.dominant === "kinesthetic" ? "questions"
      : p.vark.dominant === "read" ? "quick_notes"
      : "explanation";

  const hideTimerByDefault = p.test_anxiety === "high";
  const defaultMode: Adaptation["defaultMode"] = hideTimerByDefault ? "tutor" : "tutor";

  // Question count scales with session length and regulation.
  const baseByMin = { 5: 5, 15: 10, 30: 20, 60: 40 } as const;
  let count = baseByMin[p.preferred_session_min] as Adaptation["recommendedQuestionCount"];
  if (p.self_regulation_score < 40 && count > 10) count = 10;

  // Difficulty by clinical stage.
  const recommendedDifficulty: Adaptation["recommendedDifficulty"] =
    p.clinical_stage === "pre_clinical" ? ["easy", "medium"]
      : p.clinical_stage === "early_clinical" ? ["medium"]
      : ["medium", "hard"];

  const dailyGoalQuestions =
    p.self_regulation_score >= 70 ? 30
      : p.self_regulation_score >= 40 ? 20
      : 10;

  const rationaleBits: string[] = [];
  if (caseFirst) rationaleBits.push("case-first");
  rationaleBits.push(`${p.vark.dominant} learner`);
  if (hideTimerByDefault) rationaleBits.push("timer off");
  if (p.english_comfort <= 2) rationaleBits.push("simpler language");

  return {
    caseFirst,
    preferredTab,
    hideTimerByDefault,
    recommendedQuestionCount: count,
    recommendedDifficulty,
    defaultMode,
    dailyGoalQuestions,
    sessionLengthMin: p.preferred_session_min,
    simplifyLanguage: p.english_comfort <= 2,
    showConfidenceSlider: p.test_anxiety !== "high",
    rationale: rationaleBits.join(" • "),
  };
}