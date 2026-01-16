import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Brain,
  Stethoscope,
  Award,
  Globe,
  Users,
  BookOpen,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "ELI™ AI Professor",
      description:
        "Your personal AI faculty member delivering Socratic teaching, clinical reasoning, and personalized guidance 24/7.",
    },
    {
      icon: Stethoscope,
      title: "Virtual U.S. Rotations",
      description:
        "Experience authentic U.S. clinical training with real case discussions, attending rounds, and faculty evaluations.",
    },
    {
      icon: BookOpen,
      title: "USMLE-Aligned Curriculum",
      description:
        "Comprehensive medical education mapped to USMLE, ACGME, and LCME standards with competency tracking.",
    },
    {
      icon: Award,
      title: "Residency Readiness",
      description:
        "CV building, personal statement coaching, mock interviews, and a shareable portfolio for program directors.",
    },
  ];

  const stats = [
    { value: "50+", label: "Partner Institutions" },
    { value: "10,000+", label: "Students Enrolled" },
    { value: "95%", label: "USMLE Pass Rate" },
    { value: "500+", label: "Residency Placements" },
  ];

  const programs = [
    {
      title: "Pre-Clinical",
      years: "Years 1-2",
      description: "Master foundational medical sciences with AI-enhanced learning",
      href: "/programs/pre-clinical",
    },
    {
      title: "Clinical",
      years: "Years 3-4",
      description: "Virtual rotations and clinical reasoning development",
      href: "/programs/clinical",
    },
    {
      title: "Residency Prep",
      years: "IMG Track",
      description: "Comprehensive preparation for U.S. residency matching",
      href: "/programs/residency",
    },
    {
      title: "CME",
      years: "Physicians",
      description: "Continuing education and specialty upskilling",
      href: "/programs/cme",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--livemed-blue)/0.15),transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Now enrolling for 2026 cohorts
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              The Future of{" "}
              <span className="text-gradient-livemed">Medical Education</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              LIVEMED University delivers U.S.-standard medical education through 
              AI faculty, virtual clinical rotations, and competency-based 
              assessments — preparing the next generation of physicians worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-livemed text-lg px-8" asChild>
                <Link to="/auth?mode=signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient-livemed mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              A Complete Medical Education Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become a world-class physician, powered by 
              AI and designed for global accessibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group hover:shadow-livemed transition-all duration-300 border-border/50"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Programs for Every Stage
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From foundational sciences to residency preparation, our curriculum 
              adapts to where you are in your medical journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program) => (
              <Link key={program.title} to={program.href}>
                <Card className="h-full hover:shadow-livemed transition-all duration-300 hover:-translate-y-1 border-border/50 group">
                  <CardContent className="p-6">
                    <div className="text-xs font-medium text-accent mb-2">
                      {program.years}
                    </div>
                    <h3 className="font-semibold text-xl mb-2 group-hover:text-accent transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {program.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ELI Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--livemed-blue)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MessageSquare className="h-4 w-4" />
                Meet Your AI Professor
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ELI™ — The Most Patient Professor You'll Ever Have
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                ELI is not a chatbot. It's a faculty-grade AI system that teaches 
                using Socratic methodology, tracks your progress longitudinally, 
                and grades your clinical reasoning — not just your answers.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Personalized study plans based on your weak areas",
                  "Clinical case simulations with real-time feedback",
                  "USMLE-style question explanations",
                  "Available 24/7 in any timezone",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button className="gradient-livemed" asChild>
                <Link to="/eli">
                  Learn More About ELI™
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-livemed">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full gradient-livemed flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">ELI™</div>
                    <div className="text-xs text-muted-foreground">
                      AI Professor · Cardiology Module
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm">
                      "A 55-year-old male presents with crushing chest pain 
                      radiating to the left arm. What's your initial differential, 
                      and what would you order first?"
                    </p>
                  </div>

                  <div className="bg-accent/10 rounded-lg p-4 ml-8">
                    <p className="text-sm text-accent">
                      "I would consider acute MI, unstable angina, or aortic 
                      dissection. I'd start with an ECG and troponins..."
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm">
                      "Good start! You mentioned aortic dissection — what 
                      physical exam finding would make you more suspicious of 
                      that over MI?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institution CTA */}
      <section className="py-20 md:py-32 gradient-livemed">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Globe className="h-8 w-8 text-white/80" />
            <Users className="h-8 w-8 text-white/80" />
            <GraduationCap className="h-8 w-8 text-white/80" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Partner With LIVEMED University
          </h2>

          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            We work with medical schools, universities, and ministries of health 
            to bring U.S.-standard medical education to students worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              asChild
            >
              <Link to="/institutions">
                Institutional Partnerships
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
