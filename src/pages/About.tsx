import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Globe, Target, Heart, Users, Award, ArrowRight, BookOpen, Shield, Stethoscope, Brain } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

const About = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Target, title: t("about.missionDriven"), description: t("about.missionDrivenDesc") },
    { icon: Heart, title: t("about.studentCentered"), description: t("about.studentCenteredDesc") },
    { icon: Globe, title: t("about.globallyInclusive"), description: t("about.globallyInclusiveDesc") },
    { icon: Award, title: t("about.academicExcellence"), description: t("about.academicExcellenceDesc") },
  ];

  const offerings = [
    { icon: BookOpen, title: t("about.usStandardCurriculum"), description: t("about.usStandardCurriculumDesc") },
    { icon: Stethoscope, title: t("about.virtualClinicalRotations"), description: t("about.virtualClinicalRotationsDesc") },
    { icon: Brain, title: t("about.atlasAIProfessor"), description: t("about.atlasAIProfessorDesc") },
    { icon: Award, title: t("about.professionalCertificates"), description: t("about.professionalCertificatesDesc") },
  ];

  const team = [
    { name: "Dr. Sarah Chen", role: "CEO & Co-Founder", bio: "Former residency program director with 15 years in academic medical education." },
    { name: "Dr. Michael Rivera", role: "Chief Medical Officer", bio: "Board-certified internist and USMLE curriculum development specialist." },
    { name: "Dr. Aisha Patel", role: "VP of Clinical Education", bio: "Led clinical curriculum development at international medical institutions." },
  ];

  return (
    <div className="flex-1">
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              {t("about.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("about.title")}</h1>
            <p className="text-xl text-muted-foreground mb-2">{t("about.subtitle")}</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">{t("about.description")}</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t("about.ourMission")}</h2>
                <p className="text-muted-foreground mb-4">{t("about.missionP1")}</p>
                <p className="text-muted-foreground mb-4">{t("about.missionP2")}</p>
                <p className="text-muted-foreground">{t("about.missionP3")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6"><CardContent className="p-0"><div className="text-3xl font-bold text-accent mb-2">50+</div><div className="text-sm text-muted-foreground">{t("stats.partnerHospitals")}</div></CardContent></Card>
                <Card className="text-center p-6"><CardContent className="p-0"><div className="text-3xl font-bold text-accent mb-2">100+</div><div className="text-sm text-muted-foreground">{t("about.countriesServed")}</div></CardContent></Card>
                <Card className="text-center p-6"><CardContent className="p-0"><div className="text-3xl font-bold text-accent mb-2">10K+</div><div className="text-sm text-muted-foreground">{t("about.activeLearners")}</div></CardContent></Card>
                <Card className="text-center p-6"><CardContent className="p-0"><div className="text-3xl font-bold text-accent mb-2">95%</div><div className="text-sm text-muted-foreground">{t("about.satisfactionRate")}</div></CardContent></Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("about.whatWeOffer")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("about.whatWeOfferDesc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {offerings.map((offering) => (
              <Card key={offering.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mx-auto mb-4"><offering.icon className="h-6 w-6 text-white" /></div>
                  <h3 className="font-semibold mb-2">{offering.title}</h3>
                  <p className="text-sm text-muted-foreground">{offering.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("about.ourValues")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("about.ourValuesDesc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mx-auto mb-4"><value.icon className="h-6 w-6 text-white" /></div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-6"><Shield className="h-8 w-8 text-white" /></div>
              <h2 className="text-3xl font-bold mb-4">{t("about.educationalStandards")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">{t("about.educationalStandardsDesc")}</p>
              <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto">{t("about.jcNote")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card><CardContent className="p-6 text-center"><h3 className="font-semibold mb-2">{t("about.usmleAligned")}</h3><p className="text-sm text-muted-foreground">{t("about.usmleAlignedDesc")}</p></CardContent></Card>
              <Card><CardContent className="p-6 text-center"><h3 className="font-semibold mb-2">{t("about.acgmeCompetencies")}</h3><p className="text-sm text-muted-foreground">{t("about.acgmeCompetenciesDesc")}</p></CardContent></Card>
              <Card><CardContent className="p-6 text-center"><h3 className="font-semibold mb-2">{t("about.cmeCredits")}</h3><p className="text-sm text-muted-foreground">{t("about.cmeCreditsDesc")}</p></CardContent></Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("about.leadershipTeam")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("about.leadershipDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"><Users className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-accent mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/50">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-2"><strong>{t("about.educationalDisclaimer")}</strong> {t("about.disclaimerText")}</p>
            <p className="text-xs text-muted-foreground/70">{t("about.jcDisclaimer")}</p>
          </div>
        </div>
      </section>

      <section className="py-20 gradient-livemed">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("about.readyAdvance")}</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">{t("about.readyAdvanceDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild><Link to="/auth?mode=signup">{t("about.getStarted")}<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild><Link to="/contact">{t("about.contactUs")}</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
