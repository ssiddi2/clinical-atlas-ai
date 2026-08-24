import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, CalendarCheck, ClipboardCheck, Mail, PlayCircle,
  ShieldCheck, Sparkles, Target, TrendingUp,
} from "lucide-react";
import type { CardState, PredictiveCard } from "./types";

/**
 * Deterministic predictive ranker.
 * Reads the student's real signals (live/upcoming lectures, invitations,
 * unfinished topics, weak areas, QBank volume, verification) and orders them
 * by urgency. An AI ranking layer can wrap this later without UI changes.
 */
export function usePredictiveCards(userId: string | null | undefined) {
  const [cards, setCards] = useState<PredictiveCard[]>([]);
  const [states, setStates] = useState<Record<string, CardState>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [profileRes, enrollRes, invitesRes, qbankRes, cardStateRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("weak_areas, verification_status, onboarding_completed, target_specialty")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("course_enrollments").select("course_id").eq("student_id", userId).eq("status", "approved"),
      supabase.from("course_enrollments").select("id", { count: "exact", head: true }).eq("student_id", userId).eq("status", "invited"),
      supabase.from("qbank_user_progress").select("is_correct").eq("user_id", userId).limit(500),
      supabase.from("student_card_state").select("card_key, bookmarked, group_name, snoozed_until, dismissed").eq("user_id", userId),
    ]);

    const profile = profileRes.data;
    const courseIds = (enrollRes.data || []).map((e: any) => e.course_id);
    const next: PredictiveCard[] = [];

    if (courseIds.length > 0) {
      const [lecturesRes, coursesRes, topicsRes, progressRes] = await Promise.all([
        supabase
          .from("virtual_classrooms")
          .select("id, title, scheduled_start, status")
          .in("course_id", courseIds)
          .in("status", ["scheduled", "live"])
          .order("scheduled_start", { ascending: true })
          .limit(3),
        supabase.from("courses").select("id, title").in("id", courseIds),
        supabase.from("course_topics").select("id, course_id, title, parent_topic_id, is_high_yield").in("course_id", courseIds),
        supabase.from("learning_unit_progress").select("topic_id, completed, updated_at, quiz_score").eq("student_id", userId),
      ]);

      const lectures = lecturesRes.data || [];
      const courses = coursesRes.data || [];
      const topics = topicsRes.data || [];
      const progress = progressRes.data || [];

      lectures.forEach((l: any) => {
        const isLive = l.status === "live";
        const when = new Date(l.scheduled_start).toLocaleString(undefined, {
          weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        });
        next.push({
          key: `lecture:${l.id}`,
          type: isLive ? "live" : "lecture",
          priority: isLive ? 100 : 70,
          eyebrow: isLive ? "Live now" : "Upcoming lecture",
          title: l.title,
          body: isLive ? "Your instructor is teaching right now." : when,
          icon: isLive ? PlayCircle : CalendarCheck,
          tone: isLive ? "bg-rose-500" : "bg-blue-500",
          href: `/studio/${l.id}`,
          ctaLabel: isLive ? "Join now" : "Open lecture",
          atlasContext: `The student is preparing for the lecture "${l.title}".`,
          askPrompt: `What should I review before the "${l.title}" lecture?`,
          studyGuidePrompt: `Build a short pre-lecture study guide for "${l.title}".`,
        });
      });

      const completedIds = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.topic_id));
      const unfinished = progress
        .filter((p: any) => !p.completed)
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      const resumeTopicId = unfinished[0]?.topic_id
        ?? topics.find((t: any) => t.parent_topic_id !== null && !completedIds.has(t.id))?.id;
      const resumeTopic = topics.find((t: any) => t.id === resumeTopicId);
      if (resumeTopic) {
        const course = courses.find((c: any) => c.id === resumeTopic.course_id);
        next.push({
          key: `resume:${resumeTopic.id}`,
          type: "resume",
          priority: 90,
          eyebrow: course?.title || "Continue",
          title: resumeTopic.title,
          body: unfinished.length > 0 ? "Pick up where you left off." : "Start your next learning unit.",
          icon: BookOpen,
          tone: "bg-primary",
          href: `/learning-unit/${resumeTopic.id}`,
          ctaLabel: "Resume",
          atlasContext: `The student is working through the learning unit "${resumeTopic.title}" in the course "${course?.title || ""}".`,
          askPrompt: `Teach me the high-yield essentials of ${resumeTopic.title}.`,
          studyGuidePrompt: `Build a study guide for ${resumeTopic.title} with high-yield points and exam traps.`,
        });
      }

      // Low quiz scores → targeted remediation
      const weakUnit = progress
        .filter((p: any) => typeof p.quiz_score === "number" && p.quiz_score < 70)
        .sort((a: any, b: any) => (a.quiz_score ?? 0) - (b.quiz_score ?? 0))[0];
      const weakTopic = weakUnit && topics.find((t: any) => t.id === weakUnit.topic_id);
      if (weakTopic) {
        next.push({
          key: `remediate:${weakTopic.id}`,
          type: "weak-area",
          priority: 85,
          eyebrow: `Scored ${weakUnit.quiz_score}%`,
          title: `Remediate ${weakTopic.title}`,
          body: "Below the 70% passing threshold — worth another pass.",
          icon: Target,
          tone: "bg-amber-500",
          href: `/learning-unit/${weakTopic.id}`,
          ctaLabel: "Review unit",
          atlasContext: `The student scored ${weakUnit.quiz_score}% on the unit quiz for "${weakTopic.title}".`,
          askPrompt: `I scored ${weakUnit.quiz_score}% on ${weakTopic.title}. Where am I likely going wrong?`,
          studyGuidePrompt: `Build a remediation plan for ${weakTopic.title} targeting my weak points.`,
        });
      }
    }

    if ((invitesRes.count || 0) > 0) {
      next.push({
        key: "invites",
        type: "invite",
        priority: 95,
        eyebrow: "Action needed",
        title: `${invitesRes.count} course invitation${invitesRes.count === 1 ? "" : "s"}`,
        body: "An instructor invited you to a course.",
        icon: Mail,
        tone: "bg-violet-500",
        href: "/invitations",
        ctaLabel: "Review invitations",
        atlasContext: "The student has pending course invitations from instructors.",
        askPrompt: "What should I consider before accepting a course invitation?",
        studyGuidePrompt: "Outline how to prepare for joining a new clinical course.",
      });
    }

    (profile?.weak_areas || []).slice(0, 2).forEach((area: string) => {
      next.push({
        key: `weak:${area}`,
        type: "weak-area",
        priority: 60,
        eyebrow: "Diagnostic weak area",
        title: area,
        body: "Flagged by your diagnostic assessment.",
        icon: Sparkles,
        tone: "bg-orange-500",
        href: "/qbank",
        ctaLabel: "Drill questions",
        atlasContext: `The student's diagnostic assessment flagged "${area}" as a weak area.`,
        askPrompt: `Walk me through the highest-yield concepts in ${area}.`,
        studyGuidePrompt: `Build a one-week study guide for ${area}.`,
      });
    });

    const attempted = qbankRes.data?.length || 0;
    if (attempted < 25) {
      next.push({
        key: "score-threshold",
        type: "score",
        priority: 55,
        eyebrow: "Score Predictor",
        title: `${25 - attempted} more questions to unlock your prediction`,
        body: "The predictor needs 25 answered questions for a reliable estimate.",
        icon: TrendingUp,
        tone: "bg-emerald-500",
        href: "/qbank",
        ctaLabel: "Start a set",
        atlasContext: `The student has answered ${attempted} QBank questions and needs 25 to unlock score prediction.`,
        askPrompt: "How should I structure my first QBank blocks?",
        studyGuidePrompt: "Build a QBank practice plan for my first 25 questions.",
      });
    } else {
      const correct = (qbankRes.data || []).filter((q: any) => q.is_correct).length;
      const pct = Math.round((correct / attempted) * 100);
      next.push({
        key: "qbank-progress",
        type: "qbank",
        priority: 45,
        eyebrow: "QBank",
        title: `${pct}% accuracy across ${attempted} questions`,
        body: "Keep the streak going with a fresh timed block.",
        icon: ClipboardCheck,
        tone: "bg-emerald-500",
        href: "/qbank",
        ctaLabel: "New block",
        atlasContext: `The student's QBank accuracy is ${pct}% across ${attempted} questions.`,
        askPrompt: `My QBank accuracy is ${pct}%. How do I push it higher?`,
        studyGuidePrompt: "Build a QBank strategy to raise my accuracy.",
      });
    }

    if (profile?.verification_status && profile.verification_status !== "verified") {
      next.push({
        key: "verification",
        type: "verification",
        priority: 80,
        eyebrow: "Verification",
        title: "Finish student verification",
        body: "Upload your student ID to unlock the clinical pathway.",
        icon: ShieldCheck,
        tone: "bg-slate-600",
        href: "/profile",
        ctaLabel: "Upload document",
        atlasContext: "The student has not completed identity verification yet.",
        askPrompt: "What documents do I need for student verification?",
        studyGuidePrompt: "Summarize the steps to complete verification and apply for rotations.",
      });
    }

    const stateMap: Record<string, CardState> = {};
    (cardStateRes.data || []).forEach((s: any) => {
      stateMap[s.card_key] = {
        bookmarked: s.bookmarked,
        group_name: s.group_name,
        snoozed_until: s.snoozed_until,
        dismissed: s.dismissed,
      };
    });

    setStates(stateMap);
    setCards(next.sort((a, b) => b.priority - a.priority));
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const updateState = useCallback(async (card: PredictiveCard, patch: Partial<CardState>) => {
    if (!userId) return;
    const current = states[card.key] || { bookmarked: false, group_name: null, snoozed_until: null, dismissed: false };
    const merged = { ...current, ...patch };
    setStates((prev) => ({ ...prev, [card.key]: merged }));
    await supabase.from("student_card_state").upsert({
      user_id: userId,
      card_key: card.key,
      card_type: card.type,
      bookmarked: merged.bookmarked,
      group_name: merged.group_name,
      snoozed_until: merged.snoozed_until,
      dismissed: merged.dismissed,
    }, { onConflict: "user_id,card_key" });
  }, [userId, states]);

  const now = Date.now();
  const visible = cards.filter((c) => {
    const s = states[c.key];
    if (!s) return true;
    if (s.dismissed) return false;
    if (s.snoozed_until && new Date(s.snoozed_until).getTime() > now) return false;
    return true;
  });

  return { cards: visible, allCards: cards, states, loading, reload: load, updateState };
}
