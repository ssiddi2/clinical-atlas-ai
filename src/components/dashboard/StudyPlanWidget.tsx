import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/LanguageContext";
import { useLearningProfile } from "@/hooks/useLearningProfile";
import AdaptedBadge from "@/components/learning/AdaptedBadge";

interface StudyPlanItem {
  specialty_id: string;
  specialty_name: string;
  priority: number;
  reason: string;
}

export default function StudyPlanWidget({ userId }: { userId: string | null }) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { adaptation } = useLearningProfile();

  useEffect(() => {
    if (!userId) return;
    loadPlan();
  }, [userId]);

  const loadPlan = async () => {
    const { data } = await supabase
      .from("study_plans")
      .select("plan_data")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.plan_data && Array.isArray(data.plan_data)) {
      setPlan(data.plan_data as unknown as StudyPlanItem[]);
    }
    setLoading(false);
  };

  if (loading || plan.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            {t("studyPlan.title")}
          </CardTitle>
          <AdaptedBadge />
        </div>
        {adaptation && (
          <p className="text-xs text-muted-foreground mt-1">
            {adaptation.dailyGoalQuestions} questions/day · {adaptation.sessionLengthMin}-min sessions
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.slice(0, 4).map((item, i) => (
          <div key={item.specialty_id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.specialty_name}</p>
              <p className="text-xs text-muted-foreground truncate">{item.reason}</p>
            </div>
            <Link to="/curriculum">
              <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/curriculum">
            <BookOpen className="h-4 w-4 mr-2" />
            {t("studyPlan.viewFullPlan")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
