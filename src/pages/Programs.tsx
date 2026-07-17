import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  GraduationCap,
  Microscope,
  Stethoscope,
  Award,
  Clock,
  Users,
  Brain,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "@/i18n";

const Programs = () => {
  const { t } = useTranslation();

  const programs = {
    "pre-clinical": {
      title: t("programs.preClinical"),
      subtitle: t("programs.preClinical.years"),
      description: t("programs.preClinical.description"),
      icon: Microscope,
      duration: "24",
      modules: "180+",
      features: [
        t("programs.page.feature.organSystems", "Organ systems-based curriculum"),
        t("programs.page.feature.pathophysiology", "Interactive pathophysiology modules"),
        t("programs.page.feature.histology", "Histology & anatomy virtual labs"),
        t("programs.page.feature.biochemistry", "Biochemistry & pharmacology integration"),
        t("programs.page.feature.weeklyAI", "Weekly AI-powered assessments"),
        t("programs.page.feature.step1QB", "USMLE Step 1 question banks"),
      ],
      subjects: [
        "Anatomy & Embryology",
        "Biochemistry & Nutrition",
        "Physiology",
        "Pathology",
        "Pharmacology",
        "Microbiology & Immunology",
        "Behavioral Sciences",
        "Biostatistics & Epidemiology",
      ],
    },
    clinical: {
      title: t("programs.clinical"),
      subtitle: t("programs.clinical.years"),
      description: t("programs.clinical.description"),
      icon: Stethoscope,
      duration: "24",
      modules: "200+",
      features: [
        t("programs.page.feature.virtualRotations", "Virtual U.S. clinical rotations"),
        t("programs.page.feature.casePresentations", "Real case presentations"),
        t("programs.page.feature.clinicalReasoning", "Clinical reasoning curriculum"),
        t("programs.page.feature.osce", "OSCE preparation modules"),
        t("programs.page.feature.noteWriting", "Note-writing with AI feedback"),
        t("programs.page.feature.step2QB", "USMLE Step 2 CK question banks"),
      ],
      subjects: [
        "Internal Medicine",
        "Surgery",
        "Pediatrics",
        "Obstetrics & Gynecology",
        "Psychiatry",
        "Family Medicine",
        "Emergency Medicine",
        "Neurology",
      ],
    },
    residency: {
      title: t("programs.residencyPrep"),
      subtitle: t("programs.residencyPrep.years"),
      description: t("programs.residencyPrep.description"),
      icon: GraduationCap,
      duration: "6-12",
      modules: "80+",
      features: [
        t("programs.page.feature.usHealthcare", "U.S. healthcare system orientation"),
        t("programs.page.feature.mockInterviews", "Mock residency interviews"),
        t("programs.page.feature.personalStatement", "Personal statement coaching"),
        t("programs.page.feature.cvBuilding", "CV building workshop"),
        t("programs.page.feature.commSkills", "Communication skills training"),
        t("programs.page.feature.readinessScoring", "Residency readiness scoring"),
      ],
      subjects: [
        "ERAS Application Guide",
        "Interview Skills",
        "Personal Statement",
        "Professional Communication",
        "U.S. Medical Culture",
        "Program Research",
        "Match Strategy",
        "Visa & Immigration",
      ],
    },
    cme: {
      title: t("programs.cme"),
      subtitle: t("programs.cme.years"),
      description: t("programs.cme.description"),
      icon: Award,
      duration: t("programs.page.ongoing", "Ongoing"),
      modules: "500+",
      features: [
        t("programs.page.feature.cmeAccredited", "CME-accredited courses"),
        t("programs.page.feature.specialtyUpdates", "Specialty-specific updates"),
        t("programs.page.feature.aiCaseReviews", "AI-powered case reviews"),
        t("programs.page.feature.ebm", "Evidence-based medicine"),
        t("programs.page.feature.qi", "Quality improvement training"),
        t("programs.page.feature.leadership", "Leadership development"),
      ],
      subjects: [
        "Board Review",
        "New Treatment Guidelines",
        "Procedure Updates",
        "Patient Safety",
        "Medical Informatics",
        "Practice Management",
        "Medical Ethics",
        "Research Methods",
      ],
    },
  };

  return (
    <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-section-glow">
          <div className="absolute inset-0 gradient-livemed-light" />
          <div className="container mx-auto relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="chip chip-brand mb-6">{t("nav.programs", "Programs")}</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 mt-4">
                {t("programs.page.title")}
              </h1>
              <p className="text-lg text-soft mb-8">
                {t("programs.page.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Programs Tabs */}
        <section className="py-20 bg-section-tinted">
          <div className="container mx-auto">
            <Tabs defaultValue="pre-clinical" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
                <TabsTrigger value="pre-clinical">{t("programs.preClinical")}</TabsTrigger>
                <TabsTrigger value="clinical">{t("programs.clinical")}</TabsTrigger>
                <TabsTrigger value="residency">{t("programs.residencyPrep")}</TabsTrigger>
                <TabsTrigger value="cme">{t("programs.cme")}</TabsTrigger>
              </TabsList>

              {Object.entries(programs).map(([key, program]) => (
                <TabsContent key={key} value={key}>
                  <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Program Info */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl gradient-livemed flex items-center justify-center">
                          <program.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-accent">{program.subtitle}</p>
                          <h2 className="text-3xl font-bold">{program.title}</h2>
                        </div>
                      </div>

                      <p className="text-lg text-muted-foreground mb-8">
                        {program.description}
                      </p>

                      <div className="flex gap-6 mb-8">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-accent" />
                          <span className="text-sm">
                            <strong>{program.duration}</strong> {t("programs.page.months", "months")} {t("programs.page.program")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-accent" />
                          <span className="text-sm">
                            <strong>{program.modules}</strong> {t("programs.page.modules")}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-4">{t("programs.page.whatYoullLearn")}</h3>
                      <div className="grid grid-cols-2 gap-2 mb-8">
                        {program.subjects.map((subject) => (
                          <div key={subject} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            <span className="text-muted-foreground">{subject}</span>
                          </div>
                        ))}
                      </div>

                      <Button size="lg" className="gradient-livemed" asChild>
                        <Link to="/auth?mode=signup">
                          {t("programs.page.enrollNow")}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>

                    {/* Features Card */}
                    <div className="lm-card-lg sticky top-24 p-6 md:p-8">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-1">{t("programs.page.programFeatures")}</h3>
                        <p className="text-sm text-soft">
                          {t("programs.page.everythingIncluded")} {program.title}
                        </p>
                      </div>
                      <div>
                        <div className="space-y-4">
                          {program.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="h-4 w-4 text-accent" />
                              </div>
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                      <div className="mt-8 p-4 bg-muted/60 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Brain className="h-5 w-5 text-accent" />
                            <span className="font-medium">{t("programs.page.atlasIncluded")}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("programs.page.atlasDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto">
            <div className="cta-surface rounded-[28px] p-10 md:p-14 text-center max-w-5xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{t("programs.page.notSure")}</h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                {t("programs.page.notSureDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/auth?mode=signup">{t("programs.page.createFreeAccount")}</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to="/contact">{t("programs.page.talkAdmissions")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
};

export default Programs;
