import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Heart, Brain, Zap, Activity, Users, CheckCircle, Clock, Award, FileText, ArrowRight, Video, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/LanguageContext";
import RotationApplicationModal from "@/components/rotations/RotationApplicationModal";
import UpgradeToApplyDialog from "@/components/rotations/UpgradeToApplyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

const Rotations = () => {
  const { t } = useTranslation();
  const [applyFor, setApplyFor] = useState<{ id: string; title: string } | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { canAccessRotationExperience, loading: tierLoading } = useFeatureAccess(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const handleApply = (rotation: { id: string; title: string }) => {
    if (userId && !tierLoading && !canAccessRotationExperience) {
      setShowUpgrade(true);
      return;
    }
    setApplyFor(rotation);
  };

  const showClinicalBadge = !!userId && !tierLoading && !canAccessRotationExperience;

  const rotations = [
    { id: "internal-medicine", title: "Internal Medicine", icon: Stethoscope, duration: "8 weeks", cases: 40, description: "Master comprehensive adult medicine with complex multi-system cases, diagnostic reasoning, and evidence-based management.", topics: ["Hospital Medicine", "Ambulatory Care", "Critical Care", "Consultative Medicine"] },
    { id: "surgery", title: "Surgery", icon: Activity, duration: "6 weeks", cases: 32, description: "Develop surgical decision-making through pre-operative evaluation, operative principles, and post-operative care.", topics: ["General Surgery", "Trauma", "Surgical Emergencies", "Perioperative Care"] },
    { id: "emergency-medicine", title: "Emergency Medicine", icon: Zap, duration: "4 weeks", cases: 50, description: "Handle high-acuity presentations with rapid assessment, stabilization, and disposition decision-making.", topics: ["Trauma", "Cardiac Emergencies", "Toxicology", "Pediatric Emergencies"] },
    { id: "cardiology", title: "Cardiology", icon: Heart, duration: "4 weeks", cases: 28, description: "Deep dive into cardiovascular pathology, EKG interpretation, heart failure, and acute coronary syndromes.", topics: ["Heart Failure", "Arrhythmias", "ACS", "Valvular Disease"] },
    { id: "neurology", title: "Neurology", icon: Brain, duration: "4 weeks", cases: 24, description: "Localize lesions, interpret imaging, and manage neurological emergencies and chronic conditions.", topics: ["Stroke", "Seizures", "Movement Disorders", "Neuro-oncology"] },
    { id: "family-medicine", title: "Family Medicine", icon: Users, duration: "6 weeks", cases: 36, description: "Provide comprehensive primary care across the lifespan with emphasis on prevention and chronic disease management.", topics: ["Preventive Care", "Chronic Disease", "Pediatrics", "Women's Health"] },
  ];

  const features = [
    { icon: Video, title: t("rotations.liveRounds"), description: t("rotations.liveRoundsDesc") },
    { icon: Users, title: t("rotations.facultyEval"), description: t("rotations.facultyEvalDesc") },
    { icon: Award, title: t("rotations.lors"), description: t("rotations.lorsDesc") },
    { icon: Clock, title: t("rotations.flexScheduling"), description: t("rotations.flexSchedulingDesc") },
  ];

  return (
    <div className="flex-1">
      <section className="relative py-20 md:py-28 overflow-hidden bg-section-glow">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="chip chip-brand mb-6">
              <Video className="h-4 w-4" />
              {t("rotations.badge")}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{t("rotations.title")}</h1>
            <p className="text-lg text-soft mb-4">{t("rotations.subtitle")}</p>
            <div className="flex items-center gap-2 text-sm text-soft mb-8">
              <Globe className="h-4 w-4" />
              <span>{t("rotations.timezones")}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-brand" onClick={() => handleApply({ id: rotations[0].id, title: rotations[0].title })}>
                Apply for a Rotation<ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{t("rotations.requestInfo")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-border bg-section-tinted">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">{t("rotations.whatYouGet", "What you get")}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">{t("rotations.available")}</h2>
            <p className="text-soft max-w-2xl mx-auto">{t("rotations.availableDesc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rotations.map((rotation) => (
              <article key={rotation.id} className="lm-card lm-card-interactive p-6 group">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center group-hover:scale-110 transition-transform">
                      <rotation.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{rotation.duration}</div>
                      <div className="text-muted-foreground">{rotation.cases} {t("rotations.cases")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{rotation.title}</h3>
                    {showClinicalBadge && (
                      <Badge variant="outline" className="text-xs gap-1"><Lock className="h-3 w-3" /> Clinical tier</Badge>
                    )}
                  </div>
                  <p className="text-sm text-soft mt-2">{rotation.description}</p>
                </div>
                <div>
                  <div className="space-y-2 mb-4">
                    {rotation.topics.map((topic) => (
                      <div key={topic} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">{topic}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => handleApply({ id: rotation.id, title: rotation.title })}>
                    {showClinicalBadge ? "Upgrade to apply" : "Apply now"}<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="cta-surface rounded-[32px] p-12 md:p-16 text-center max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{t("rotations.readyStart")}</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">{t("rotations.readyStartDesc")}</p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => handleApply({ id: rotations[0].id, title: rotations[0].title })}>
              Start your application<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {applyFor && (
        <RotationApplicationModal
          open={!!applyFor}
          onOpenChange={(o) => !o && setApplyFor(null)}
          rotation={applyFor}
        />
      )}

      <UpgradeToApplyDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default Rotations;
