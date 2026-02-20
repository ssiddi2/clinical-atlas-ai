import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import InlineDemoPlayer from "@/components/InlineDemoPlayer";
import HeroBackground from "@/components/HeroBackground";
import jointCommissionBadge from "@/assets/joint-commission-badge.png";
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
  Sparkles,
  Activity,
} from "lucide-react";

// Animation variants - Apple-style smooth easing
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" as const }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" as const }
  }
};

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const demoPlayerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // On mobile: skip hero entrance animations so text paints instantly as LCP
  // On desktop: keep the staggered fade-in animations
  const noAnim = isMobile;

  const features = [
    {
      icon: Brain,
      title: "ATLAS™ AI Professor",
      description:
        "Personal AI faculty delivering Socratic teaching and clinical reasoning guidance 24/7.",
    },
    {
      icon: Stethoscope,
      title: "Virtual U.S. Rotations",
      description:
        "Authentic U.S. clinical training with real case discussions and faculty evaluations.",
      subtitle: "LORs from hospital-affiliated US physicians on institutional letterhead.",
    },
    {
      icon: BookOpen,
      title: "USMLE-Aligned Curriculum",
      description:
        "Medical education mapped to USMLE, ACGME, and LCME standards with competency tracking.",
    },
    {
      icon: Award,
      title: "Residency Readiness",
      description:
        "CV building, mock interviews, and a shareable portfolio for program directors.",
    },
  ];

  const stats = [
    { value: "50+", label: "Partner Hospitals" },
    { value: "8+", label: "Specialty Rotations" },
    { value: "Live", label: "US Physician Rounds" },
  ];

  const specialties = "Cardiology · Pulmonology · ICU/Critical Care · Nephrology · Neurology · Internal Medicine · Infectious Disease & more";

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
    <>
      <div ref={containerRef} className="flex flex-col bg-livemed-deep">
      {/* Hero Section - Apple Style Clean */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden lcp-priority">
        {/* New Apple-style animated background */}
        <HeroBackground />
        
        {/* FloatingMedicalIcons removed — already rendered in HeroBackground */}
        
        {/* Hero Content */}
        {isMobile ? (
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 glass-card-hover px-4 py-2 rounded-full text-xs mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-livemed-success"></span>
                </span>
                <span className="text-white/70 font-medium">Now enrolling for 2026</span>
              </div>

              <div className="text-xl sm:text-2xl font-semibold text-gradient-livemed mb-4 tracking-wide">
                Livemed Academy
              </div>

              <h1 className="relative text-4xl sm:text-5xl font-semibold tracking-[-0.025em] mb-4 leading-[1.1]">
                <span className="text-white/90">Where AI</span>
                <br />
                <span className="text-gradient-livemed">Meets Medicine.</span>
              </h1>

              <p className="text-lg text-white/45 mb-8 max-w-xl mx-auto leading-relaxed font-light tracking-tight">
                Train smarter. Heal better.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="btn-glow gradient-livemed text-lg px-12 py-7 rounded-full group font-semibold shadow-xl" 
                  asChild
                >
                  <Link to="/apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="text-sm px-6 py-5 rounded-full text-white/35 hover:text-white/50 hover:bg-white/[0.03] group font-normal"
                  onClick={() => demoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 glass-card-hover px-5 py-2.5 rounded-full text-sm mb-10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-livemed-success"></span>
                </span>
                <span className="text-white/70 font-medium">Now enrolling for 2026</span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="text-2xl md:text-3xl font-semibold text-gradient-livemed mb-4 tracking-wide"
              >
                Livemed Academy
              </motion.div>

              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(217 91% 60% / 0.08) 0%, hsl(190 95% 55% / 0.03) 40%, transparent 70%)",
                }}
                aria-hidden="true"
              />

              <motion.h1 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative text-5xl md:text-6xl lg:text-7xl xl:text-[96px] font-semibold tracking-[-0.025em] mb-6 leading-[1.1]"
              >
                <span className="text-white/90">Where AI</span>
                <br />
                <span className="text-gradient-livemed">Meets Medicine.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl lg:text-2xl text-white/45 mb-14 max-w-xl mx-auto leading-relaxed font-light tracking-tight"
              >
                Train smarter. Heal better.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button 
                  size="lg" 
                  className="btn-glow gradient-livemed text-lg px-12 py-7 rounded-full group font-semibold shadow-xl" 
                  asChild
                >
                  <Link to="/apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="text-sm px-6 py-5 rounded-full text-white/35 hover:text-white/50 hover:bg-white/[0.03] group font-normal"
                  onClick={() => demoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>
          </div>
        )}

      </section>

      {/* Inline Demo Player */}
      <section className="relative py-12 md:py-20 bg-livemed-deep overflow-hidden">
        <div className="relative">
          <InlineDemoPlayer ref={demoPlayerRef} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative pt-24 md:pt-32 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-livemed-deep" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          {noAnim ? (
            <div className="grid grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
              {stats.map((stat) => (
                <div 
                  key={stat.label} 
                  className="p-6 md:p-10 lg:p-12 text-center bg-white/[0.015]"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 text-gradient-livemed">
                    {stat.value}
                  </div>
                  <div className="uppercase tracking-[0.15em] font-medium text-[10px] md:text-xs text-white/30">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden"
            >
              {stats.map((stat) => (
                <motion.div 
                  key={stat.label} 
                  variants={fadeInScale}
                  className="p-6 md:p-10 lg:p-12 text-center bg-white/[0.015]"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 text-gradient-livemed">
                    {stat.value}
                  </div>
                  <div className="uppercase tracking-[0.15em] font-medium text-[10px] md:text-xs text-white/30">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <p className="text-center text-white/40 text-xs md:text-sm mt-6 max-w-2xl mx-auto">
            {specialties}
          </p>

          {/* Joint Commission Accreditation Badge */}
          <div
            className="mt-16 md:mt-24 max-w-2xl mx-auto"
          >
            <div className="border-t border-white/[0.06] pt-12 md:pt-16 flex flex-col items-center text-center">
               <img 
                 src={jointCommissionBadge} 
                 alt="The Joint Commission - National Quality Approval" 
                 className="h-20 md:h-28 w-auto object-contain mb-8"
                 width="128"
                 height="128"
                 loading="lazy"
                 decoding="async"
               />
              <p className="text-white/90 font-semibold text-lg md:text-xl tracking-tight mb-1">
                Accredited by The Joint Commission
              </p>
              <p className="text-white/60 text-sm md:text-base font-medium mb-2">
                Livemed — AI-Powered Virtual Specialty Care
              </p>
              <p className="text-white/35 text-xs md:text-sm max-w-lg mb-4 leading-relaxed">
                Livemed's telehealth and virtual specialty care services are accredited by The Joint Commission 
                for national quality standards. Livemed Academy is the clinical education division of Livemed.
              </p>
              <p className="text-white/40 text-sm md:text-base mb-4">
                Enrollments starting soon
              </p>
              <p className="text-white/30 text-xs md:text-sm">
                Interested medical students can reach out to{" "}
                <a 
                  href="mailto:info@livemedhealth.com" 
                  className="text-white/50 hover:text-white/70 underline underline-offset-2 transition-colors"
                >
                  info@livemedhealth.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-livemed-deep relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 text-white/40 text-xs md:text-sm font-medium mb-5 md:mb-6 border border-white/[0.06] px-4 py-2 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by AI
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6">
              <span className="text-gradient-livemed">Complete Medical Education</span>
            </h2>
            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-light px-4">
              Everything you need to become a world-class physician.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[hsl(230,50%,7%)] p-7 md:p-10"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                  <feature.icon className="h-[18px] w-[18px] text-white/50" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-base md:text-lg mb-2 text-white/90 tracking-tight">{feature.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
                {"subtitle" in feature && feature.subtitle && (
                  <p className="text-livemed-cyan/60 text-xs mt-2 leading-relaxed">
                    {feature.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-livemed-deep below-fold-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 text-white">
              Programs for <span className="text-gradient-livemed">Every Stage</span>
            </h2>
            <p className="text-base md:text-lg text-white/45 max-w-xl mx-auto font-light px-4 mb-2">
              From foundational sciences to residency preparation.
            </p>
            <p className="text-sm text-white/30 max-w-md mx-auto">Choose based on your current training level</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {programs.map((program) => (
              <div key={program.title}>
                <Link to={program.href}>
                  <Card className="h-full group bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300 relative overflow-hidden rounded-2xl">
                    {program.title === "Clinical" && (
                      <div className="absolute top-3.5 right-3.5 text-[10px] font-medium uppercase tracking-wider bg-white/[0.04] text-white/50 border border-white/[0.06] px-2.5 py-1 rounded-full">Most Popular</div>
                    )}
                    {program.title === "Residency Prep" && (
                      <div className="absolute top-3.5 right-3.5 text-[10px] font-medium uppercase tracking-wider bg-white/[0.04] text-white/50 border border-white/[0.06] px-2.5 py-1 rounded-full">Recommended</div>
                    )}
                    <CardContent className="p-6 md:p-8">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-wider mb-4 px-3 py-1.5 bg-white/[0.03] rounded-full border border-white/[0.06]">
                        <Activity className="h-3 w-3" />
                        {program.years}
                      </div>
                      <h3 className="font-medium text-lg md:text-xl mb-2 md:mb-3 text-white/90 group-hover:text-white transition-colors tracking-tight">
                        {program.title}
                      </h3>
                      <p className="text-white/35 text-sm mb-5 md:mb-6 leading-relaxed">
                        {program.description}
                      </p>
                      <div className="flex items-center text-white/40 text-sm font-medium group-hover:text-white/60 group-hover:gap-2 gap-1.5 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATLAS Section */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-livemed-deep below-fold-section">
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 text-white/40 text-xs md:text-sm font-medium mb-6 md:mb-8 border border-white/[0.06] px-4 py-2 rounded-full">
                <MessageSquare className="h-3.5 w-3.5" />
                Meet Your AI Professor
                <div className="w-1.5 h-1.5 bg-livemed-success rounded-full animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 md:mb-8 text-white leading-[1.1] tracking-tight">
                ATLAS™ — The Most Patient Professor{" "}
                <span className="text-gradient-livemed">You'll Ever Have</span>
              </h2>

              <p className="text-base md:text-lg text-white/40 mb-8 md:mb-12 leading-relaxed font-light max-w-md">
                Faculty-grade AI that teaches using Socratic methodology, 
                tracks your progress, and grades your clinical reasoning.
              </p>

              <ul className="space-y-5 md:space-y-6 mb-8 md:mb-12">
                {[
                  "Personalized study plans that adapt to your weak areas",
                  "Clinical case simulations with real-time feedback",
                  "24/7 availability in any timezone",
                ].map((item) => (
                  <li 
                    key={item} 
                    className="flex items-start gap-3.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-white/40" />
                    </div>
                    <span className="text-white/50 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <Button className="gradient-livemed px-8 py-6 rounded-full group font-semibold text-sm md:text-base w-full sm:w-auto" asChild>
                <Link to="/atlas">
                  Learn More About ATLAS™
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* ATLAS Chat Interface */}
            <div className="relative lg:scale-105 origin-center">
              <div 
                className="rounded-2xl md:rounded-3xl p-5 md:p-8 relative bg-white/[0.02] border border-white/[0.06]"
              >
                {/* Terminal header */}
                <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-8 pb-5 md:pb-6 border-b border-white/[0.04]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <Brain className="h-4 w-4 md:h-5 md:w-5 text-white/50" />
                    </div>
                    <div>
                      <div className="font-medium text-white/80 text-xs md:text-sm">ATLAS™</div>
                      <div className="text-[10px] md:text-xs text-white/30">
                        Cardiology Module
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-5">
                  {/* ATLAS Message */}
                  <div className="bg-white/[0.02] rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/[0.04]">
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                      "A 55-year-old male presents with crushing chest pain 
                      radiating to the left arm. What's your initial differential?"
                    </p>
                  </div>

                  {/* Student Response */}
                  <div className="bg-white/[0.02] rounded-xl md:rounded-2xl p-4 md:p-5 ml-6 md:ml-10 border border-white/[0.06]">
                    <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                      "I would consider acute MI, unstable angina, or aortic 
                      dissection. I'd start with an ECG and troponins..."
                    </p>
                  </div>

                  {/* ATLAS Follow-up */}
                  <div className="bg-white/[0.02] rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/[0.04]">
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                      "Good start! What physical exam finding would make you 
                      more suspicious of aortic dissection over MI?"
                    </p>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex items-center gap-2 text-white/25 text-xs pl-2">
                  <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_0.2s_infinite]" />
                      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_0.4s_infinite]" />
                    </div>
                    <span>ATLAS is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-livemed-deep relative overflow-hidden below-fold-section">
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 text-white">
              Trusted by <span className="text-gradient-livemed">Future Physicians</span>
            </h2>
            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-light px-4">
              See what our students have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden max-w-5xl mx-auto">
            {[
              {
                quote: "ATLAS helped me master pathophysiology I'd struggled with for months. Scored 248 on Step 1.",
                name: "Dr. Maria Santos",
                role: "IMG from Brazil, Matched Internal Medicine",
              },
              {
                quote: "Virtual rotations prepared me for U.S. clinicals. Received outstanding evaluations my first week.",
                name: "Ahmed Khalil",
                role: "Medical Student, Egypt",
              },
              {
                quote: "USMLE pass rates improved 18% after implementing Livemed. Analytics identify struggling students early.",
                name: "Dr. James Wilson",
                role: "Dean of Clinical Education",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-[hsl(230,50%,7%)] p-7 md:p-10"
              >
                <div className="text-2xl text-white/15 mb-3 font-serif">"</div>
                <p className="text-white/50 mb-5 md:mb-7 leading-relaxed text-sm md:text-base">
                  {testimonial.quote}
                </p>
                <div className="border-t border-white/[0.04] pt-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-medium text-white/40">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white/80 text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-white/30">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-livemed-deep below-fold-section">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />
        
        <div className="container mx-auto px-4 md:px-6 text-center relative">
          <div className="flex justify-center gap-3 md:gap-4 mb-8 md:mb-12">
            {[Globe, Users, GraduationCap].map((Icon, index) => (
              <div 
                key={index}
                className="w-8 h-8 md:w-14 md:h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center"
              >
                <Icon className="h-4 w-4 md:h-6 md:w-6 text-white/50" />
              </div>
            ))}
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-5 md:mb-8">
            Partner With Livemed Learning
          </h2>

          <p className="text-base md:text-xl text-white/40 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-light px-4">
            We work with medical schools and universities worldwide 
            to bring U.S.-standard medical education to students everywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Button
              size="lg"
              className="bg-white text-[hsl(230,50%,8%)] hover:bg-white/90 px-8 py-6 rounded-full font-semibold group text-sm md:text-base"
              asChild
            >
              <Link to="/institutions">
                Institutional Partnerships
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="px-6 py-5 rounded-full text-white/35 hover:text-white/50 hover:bg-white/[0.03] border border-white/[0.06] text-sm md:text-base font-normal"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default Landing;
