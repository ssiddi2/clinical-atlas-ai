import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const Programs = () => {
  const programs = {
    "pre-clinical": {
      title: "Pre-Clinical Program",
      subtitle: "Years 1-2",
      description: "Master foundational medical sciences with AI-enhanced learning, interactive case studies, and comprehensive USMLE Step 1 preparation.",
      icon: Microscope,
      duration: "24 months",
      modules: "180+",
      features: [
        "Organ systems-based curriculum",
        "Interactive pathophysiology modules",
        "Histology & anatomy virtual labs",
        "Biochemistry & pharmacology integration",
        "Weekly AI-powered assessments",
        "USMLE Step 1 question banks",
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
      title: "Clinical Program",
      subtitle: "Years 3-4",
      description: "Develop clinical reasoning and patient care skills through virtual rotations, case-based learning, and USMLE Step 2 CK preparation.",
      icon: Stethoscope,
      duration: "24 months",
      modules: "200+",
      features: [
        "Virtual U.S. clinical rotations",
        "Real case presentations",
        "Clinical reasoning curriculum",
        "OSCE preparation modules",
        "Note-writing with AI feedback",
        "USMLE Step 2 CK question banks",
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
      title: "Residency Preparation",
      subtitle: "IMG Track",
      description: "Comprehensive preparation for U.S. residency matching including mock interviews, personal statement coaching, and clinical skills development.",
      icon: GraduationCap,
      duration: "6-12 months",
      modules: "80+",
      features: [
        "U.S. healthcare system orientation",
        "Mock residency interviews",
        "Personal statement coaching",
        "CV building workshop",
        "Communication skills training",
        "Residency readiness scoring",
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
      title: "CME Programs",
      subtitle: "Physicians",
      description: "Continuing medical education for practicing physicians with specialty updates, upskilling modules, and certification maintenance.",
      icon: Award,
      duration: "Ongoing",
      modules: "500+",
      features: [
        "CME-accredited courses",
        "Specialty-specific updates",
        "AI-powered case reviews",
        "Evidence-based medicine",
        "Quality improvement training",
        "Leadership development",
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 gradient-livemed-light" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Programs for Every Stage of Your Medical Journey
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                From foundational sciences to residency preparation and continuing education, 
                our curriculum is mapped to U.S. standards and delivered through AI-enhanced learning.
              </p>
            </div>
          </div>
        </section>

        {/* Programs Tabs */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="pre-clinical" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
                <TabsTrigger value="pre-clinical">Pre-Clinical</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="residency">Residency Prep</TabsTrigger>
                <TabsTrigger value="cme">CME</TabsTrigger>
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
                            <strong>{program.duration}</strong> program
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-accent" />
                          <span className="text-sm">
                            <strong>{program.modules}</strong> modules
                          </span>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-4">What You'll Learn</h3>
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
                          Enroll Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>

                    {/* Features Card */}
                    <Card className="sticky top-24">
                      <CardHeader>
                        <CardTitle>Program Features</CardTitle>
                        <CardDescription>
                          Everything included in the {program.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
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

                        <div className="mt-8 p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Brain className="h-5 w-5 text-accent" />
                            <span className="font-medium">ELI™ AI Professor Included</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Get 24/7 access to your personal AI professor for questions, 
                            explanations, and guided learning.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Not Sure Which Program is Right for You?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Our admissions team can help you find the perfect program based on your 
              current training level and career goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-livemed" asChild>
                <Link to="/auth?mode=signup">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Talk to Admissions</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
