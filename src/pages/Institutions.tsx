import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Globe, GraduationCap, TrendingUp, Shield, Users, BarChart3, CheckCircle, ArrowRight, BookOpen, Award } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

const Institutions = () => {
  const { t } = useTranslation();

  const benefits = [
    { icon: Globe, title: t("institutions.usStandard"), description: t("institutions.usStandardDesc") },
    { icon: TrendingUp, title: t("institutions.scalableAI"), description: t("institutions.scalableAIDesc") },
    { icon: BarChart3, title: t("institutions.realTimeAnalytics"), description: t("institutions.realTimeAnalyticsDesc") },
    { icon: Shield, title: t("institutions.govSecurity"), description: t("institutions.govSecurityDesc") },
    { icon: Users, title: t("institutions.facultyTraining"), description: t("institutions.facultyTrainingDesc") },
    { icon: Award, title: t("institutions.accreditationSupport"), description: t("institutions.accreditationSupportDesc") },
  ];

  const useCases = [
    { title: t("institutions.medicalSchools"), description: t("institutions.medicalSchoolsDesc"), features: ["Pre-clinical support", "Clinical skills training", "USMLE preparation"] },
    { title: t("institutions.ministriesOfHealth"), description: t("institutions.ministriesOfHealthDesc"), features: ["Workforce analytics", "CME compliance", "Quality assurance"] },
    { title: t("institutions.teachingHospitals"), description: t("institutions.teachingHospitalsDesc"), features: ["Resident education", "Grand rounds", "Faculty development"] },
  ];

  const stats = [
    { value: "50+", label: t("stats.partnerHospitals") },
    { value: "15", label: t("institutions.countries") },
    { value: "8+", label: t("stats.specialtyRotations") },
    { value: "Live", label: t("stats.usPhysicianRounds") },
  ];

  return (
    <main className="flex-1">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="container mx-auto">
          <div className="cta-surface rounded-[32px] p-10 md:p-16 max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="h-4 w-4" />
                {t("institutions.badge")}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">{t("institutions.title")}</h1>
              <p className="text-lg text-white/80 mb-8">{t("institutions.subtitle")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/contact">{t("institutions.requestDemo")}<ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" className="bg-white/10 border border-white/40 text-white hover:bg-white/20 backdrop-blur-sm" asChild>
                  <Link to="/case-studies">{t("institutions.viewCaseStudies")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b border-border bg-section-tinted">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="lm-card text-center p-6">
                <div className="text-3xl md:text-4xl font-bold text-gradient-livemed mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t("institutions.whyChoose")}</h2>
            <p className="text-lg text-soft max-w-2xl mx-auto">{t("institutions.whyChooseDesc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="lm-card lm-card-interactive p-6">
                <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-soft">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-section-tinted">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t("institutions.solutions")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <article key={useCase.title} className="lm-card p-6 h-full">
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-soft mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">{t("institutions.rapidImplementation")}</h2>
              <p className="text-lg text-soft mb-8">{t("institutions.rapidDesc")}</p>
              <div className="space-y-6">
                {[
                  { step: "1", title: t("institutions.discovery"), description: t("institutions.discoveryDesc") },
                  { step: "2", title: t("institutions.integration"), description: t("institutions.integrationDesc") },
                  { step: "3", title: t("institutions.training"), description: t("institutions.trainingDesc") },
                  { step: "4", title: t("institutions.launch"), description: t("institutions.launchDesc") },
                  { step: "5", title: t("institutions.optimization"), description: t("institutions.optimizationDesc") },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cta-surface rounded-[28px] p-8 md:p-10 text-white">
              <GraduationCap className="h-12 w-12 mb-6 opacity-80" />
              <h3 className="font-display text-2xl font-bold mb-4 text-white">{t("institutions.readyTransform")}</h3>
              <p className="text-white/85 mb-6">{t("institutions.readyTransformDesc")}</p>
              <Button size="lg" variant="secondary" className="w-full bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/contact">{t("institutions.scheduleConsultation")}<ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Institutions;
