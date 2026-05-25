import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Answers,
  QUESTIONS,
  SECTIONS,
  AssessmentQuestion,
  scoreProfile,
  profileSummary,
  profileTailoring,
} from "@/lib/learningProfile";

const LIKERT = [1, 2, 3, 4, 5] as const;

function QuestionView({
  q,
  value,
  onChange,
}: {
  q: AssessmentQuestion;
  value: string | string[] | number | undefined;
  onChange: (v: string | string[] | number) => void;
}) {
  if (q.type === "likert") {
    const current = typeof value === "number" ? value : undefined;
    return (
      <div className="space-y-3">
        <p className="text-base font-medium text-foreground">{q.prompt}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground w-20 text-left">{q.likert?.low}</span>
          <div className="flex gap-2">
            {LIKERT.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${
                  current === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground w-20 text-right">{q.likert?.high}</span>
        </div>
      </div>
    );
  }

  if (q.type === "multi") {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (v: string) =>
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    return (
      <div className="space-y-3">
        <p className="text-base font-medium text-foreground">{q.prompt}</p>
        <p className="text-xs text-muted-foreground">Select all that apply.</p>
        <div className="grid gap-2">
          {q.options?.map((o) => {
            const sel = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                  sel ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // single
  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-foreground">{q.prompt}</p>
      <div className="grid gap-2">
        {q.options?.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`text-left px-4 py-3 rounded-xl border transition-colors ${
              value === o.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const LearningAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<ReturnType<typeof scoreProfile> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUserId(session.user.id);
    });
  }, [navigate]);

  const section = SECTIONS[sectionIdx];
  const sectionQs = useMemo(() => QUESTIONS.filter((q) => q.section === section.id), [section.id]);
  const isLast = sectionIdx === SECTIONS.length - 1;

  const sectionComplete = sectionQs.every((q) => {
    const v = answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    return v !== undefined && v !== "";
  });

  const overallProgress = Math.round(
    (Object.keys(answers).length / QUESTIONS.length) * 100
  );

  const handleSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const profile = scoreProfile(answers);
      const { error } = await supabase
        .from("profiles")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ learning_profile: profile as any, learning_assessment_completed: true })
        .eq("user_id", userId);
      if (error) throw error;
      setDone(profile);
    } catch (e) {
      toast({
        title: "Couldn't save your profile",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const tailoring = profileTailoring(done);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-xl w-full p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Your learning profile is ready</h1>
            <p className="text-sm text-muted-foreground">{profileSummary(done)}</p>
          </div>
          <div className="text-left bg-muted/40 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              What changes for you
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {tailoring.map((t, i) => (
                <li key={i}>• {t}</li>
              ))}
            </ul>
          </div>
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-base font-semibold leading-tight">Learning Profile</h1>
            <p className="text-xs text-muted-foreground">
              About 4 minutes. We use this to shape your lessons, QBank pacing, and ATLAS tutoring.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Step {sectionIdx + 1} of {SECTIONS.length} — {section.title}
            </span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.subtitle}</p>
              </div>
              <div className="space-y-8">
                {sectionQs.map((q) => (
                  <QuestionView
                    key={q.id}
                    q={q}
                    value={answers[q.id]}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            disabled={sectionIdx === 0 || submitting}
            onClick={() => setSectionIdx((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {isLast ? (
            <Button disabled={!sectionComplete || submitting} onClick={handleSubmit}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  Finish
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled={!sectionComplete}
              onClick={() => setSectionIdx((i) => Math.min(SECTIONS.length - 1, i + 1))}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningAssessment;