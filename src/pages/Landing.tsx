import { useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import InlineDemoPlayer from "@/components/InlineDemoPlayer";
import HeroBackground from "@/components/HeroBackground";
import jointCommissionBadge from "@/assets/joint-commission-badge.png";

// Defer decorative floating icons — not needed for LCP
const FloatingMedicalIcons = lazy(() => import("@/components/FloatingMedicalIcons"));
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


  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Subtle parallax for hero content
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

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
    <>
      <div ref={containerRef} className="flex flex-col bg-livemed-deep">
      {/* Hero Section - Apple Style Clean */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden lcp-priority">
        {/* New Apple-style animated background */}
        <HeroBackground />
        
        {/* Floating Medical Icons - deferred to not block LCP */}
        <Suspense fallback={null}>
          <FloatingMedicalIcons />
        </Suspense>
        
        {/* Hero Content */}
        <motion.div 
          style={{ y: heroY }}
          className="container mx-auto px-4 md:px-6 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge with Glow */}
            <motion.div 
              {...(noAnim ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 } })}
              className="inline-flex items-center gap-2 glass-card-hover px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm mb-6 md:mb-10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-livemed-success"></span>
              </span>
              <span className="text-white/70 font-medium">Now enrolling for 2026</span>
            </motion.div>

            {/* Brand Name */}
            <motion.div 
              {...(noAnim ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.25 } })}
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-gradient-livemed mb-4 tracking-wide"
            >
              Livemed Academy
            </motion.div>

            {/* Radial glow behind headline */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] md:w-[900px] md:h-[500px] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(217 91% 60% / 0.08) 0%, hsl(190 95% 55% / 0.03) 40%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            {/* Main Headline - Apple Style Bold Typography */}
            <motion.h1 
              {...(noAnim ? {} : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } })}
              className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[96px] font-semibold tracking-[-0.025em] mb-4 md:mb-6 leading-[1.1]"
            >
              <span className="text-white/90">Where AI</span>
              <br />
              <span className="text-gradient-livemed">Meets Medicine.</span>
            </motion.h1>

            <motion.p 
              {...(noAnim ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.5 } })}
              className="text-lg md:text-xl lg:text-2xl text-white/45 mb-8 md:mb-14 max-w-xl mx-auto leading-relaxed font-light tracking-tight"
            >
              Train smarter. Heal better.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              {...(noAnim ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.7 } })}
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
        </motion.div>

      </section>

      {/* Inline Demo Player */}
      <section className="relative py-12 md:py-20 bg-livemed-deep overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="relative">
          <InlineDemoPlayer ref={demoPlayerRef} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative pt-16 md:pt-28 pb-16 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-livemed-deep" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden"
          >
            {stats.map((stat, index) => {
              const isHighlighted = stat.label === "USMLE Pass Rate";
              return (
                <motion.div 
                  key={stat.label} 
                  variants={fadeInScale}
                  className={`p-6 md:p-10 lg:p-12 text-center ${isHighlighted ? "bg-white/[0.04]" : "bg-white/[0.015]"}`}
                >
                  <div className={`font-bold mb-2 md:mb-3 ${isHighlighted ? "text-4xl sm:text-5xl md:text-6xl text-gradient-livemed" : "text-2xl sm:text-3xl md:text-4xl text-white/60"}`}>
                    {stat.value}
                  </div>
                  <div className={`uppercase tracking-[0.15em] font-medium ${isHighlighted ? "text-xs md:text-sm text-white/50" : "text-[10px] md:text-xs text-white/30"}`}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Joint Commission Accreditation Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
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
              <p className="text-white/90 font-semibold text-lg md:text-xl tracking-tight mb-2">
                Accredited by The Joint Commission
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
          </motion.div>
        </div>
      </section>

      {/* Features Section - Dark Glass Cards */}
      <section className="py-16 md:py-32 bg-livemed-deep relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-grid-pattern" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-10 md:mb-20"
          >
            <motion.div 
              variants={fadeInScale}
              className="inline-flex items-center gap-2 text-livemed-cyan text-xs md:text-sm font-medium mb-4 md:mb-6 glass-card px-3 md:px-4 py-2 rounded-full"
            >
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              Powered by AI
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              <span className="text-gradient-livemed text-glow">Complete Medical Education</span>
            </h2>
            <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto font-light px-4">
              Everything you need to become a world-class physician.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
              >
                <Card className="group h-full glass-card border-white/5 hover:border-livemed-blue/30 transition-all duration-500 bg-transparent">
                  <CardContent className="p-5 md:p-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-livemed flex items-center justify-center mb-4 md:mb-6">
                      <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-white">{feature.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-livemed-deep">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-livemed-blue/5 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-10 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white">
              Programs for <span className="text-gradient-livemed">Every Stage</span>
            </h2>
            <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto font-light px-4 mb-2">
              From foundational sciences to residency preparation.
            </p>
            <p className="text-sm text-white/35 max-w-md mx-auto">Choose based on your current training level</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {programs.map((program) => (
              <motion.div
                key={program.title}
                variants={fadeInUp}
              >
                <Link to={program.href}>
                  <Card className="h-full group glass-card border-white/5 hover:border-livemed-cyan/40 transition-all duration-500 bg-transparent relative overflow-hidden">
                    {program.title === "Clinical" && (
                      <div className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-livemed-cyan/15 text-livemed-cyan border border-livemed-cyan/20 px-2 py-0.5 rounded-full">Most Popular</div>
                    )}
                    {program.title === "Residency Prep" && (
                      <div className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-livemed-blue/15 text-livemed-blue border border-livemed-blue/20 px-2 py-0.5 rounded-full">Recommended</div>
                    )}
                    <CardContent className="p-5 md:p-8">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-livemed-cyan uppercase tracking-wider mb-3 md:mb-4 px-3 py-1.5 bg-livemed-cyan/10 rounded-full border border-livemed-cyan/20">
                        <Activity className="h-3 w-3" />
                        {program.years}
                      </div>
                      <h3 className="font-semibold text-lg md:text-xl mb-2 md:mb-3 text-white group-hover:text-livemed-cyan transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-white/40 text-sm mb-4 md:mb-6">
                        {program.description}
                      </p>
                      <div className="flex items-center text-livemed-cyan text-sm font-semibold group-hover:gap-2 gap-1.5 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ATLAS Section - Enhanced Dark Design */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-livemed-deep">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-neural-pattern" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div 
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="inline-flex items-center gap-2 text-livemed-cyan text-xs md:text-sm font-medium mb-4 md:mb-8 glass-card px-3 md:px-4 py-2 rounded-full">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                Meet Your AI Professor
                <div className="w-2 h-2 bg-livemed-success rounded-full animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-8 text-white leading-tight">
                ATLAS™ — The Most Patient Professor{" "}
                <span className="text-gradient-livemed">You'll Ever Have</span>
              </h2>

              <p className="text-base md:text-lg text-white/50 mb-6 md:mb-10 leading-relaxed font-light">
                Faculty-grade AI that teaches using Socratic methodology, 
                tracks your progress, and grades your clinical reasoning.
              </p>

              <motion.ul 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3 md:space-y-4 mb-6 md:mb-10"
              >
                {[
                  "Personalized study plans that adapt to your weak areas",
                  "Clinical case simulations with real-time faculty-grade feedback",
                  "24/7 availability in any timezone",
                ].map((item) => (
                  <motion.li 
                    key={item} 
                    variants={fadeInUp}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-white/60 text-sm">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <Button className="btn-glow gradient-livemed px-6 md:px-8 py-5 md:py-6 rounded-full group font-semibold text-sm md:text-base w-full sm:w-auto" asChild>
                <Link to="/atlas">
                  Learn More About ATLAS™
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* ATLAS Chat Interface - Enhanced Glass */}
            <motion.div 
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-livemed-blue/15 rounded-2xl md:rounded-3xl blur-[40px]" />
              
              <div 
                className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-8 relative border border-white/[0.08]"
              >
                {/* Terminal header */}
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8 pb-4 md:pb-6 border-b border-white/5">
                  <div className="flex gap-1 md:gap-1.5">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500/60" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl gradient-livemed flex items-center justify-center">
                      <Brain className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs md:text-sm">ATLAS™</div>
                      <div className="text-[10px] md:text-xs text-white/40">
                        Cardiology Module
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3 md:space-y-5"
                >
                  {/* ATLAS Message */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white/[0.03] rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/5"
                  >
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                      "A 55-year-old male presents with crushing chest pain 
                      radiating to the left arm. What's your initial differential?"
                    </p>
                  </motion.div>

                  {/* Student Response */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-livemed-cyan/10 rounded-xl md:rounded-2xl p-3 md:p-5 ml-4 md:ml-8 border border-livemed-cyan/20"
                  >
                    <p className="text-livemed-cyan/90 text-xs md:text-sm leading-relaxed">
                      "I would consider acute MI, unstable angina, or aortic 
                      dissection. I'd start with an ECG and troponins..."
                    </p>
                  </motion.div>

                  {/* ATLAS Follow-up */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white/[0.03] rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/5"
                  >
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                      "Good start! What physical exam finding would make you 
                      more suspicious of aortic dissection over MI?"
                    </p>
                  </motion.div>

                  {/* Typing indicator */}
                  <motion.div 
                    variants={fadeInUp}
                    className="flex items-center gap-2 text-white/30 text-xs pl-2"
                  >
                    <div className="flex gap-1">
                      <motion.span 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="w-1.5 h-1.5 bg-livemed-cyan/60 rounded-full" 
                      />
                      <motion.span 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-livemed-cyan/60 rounded-full" 
                      />
                      <motion.span 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-livemed-cyan/60 rounded-full" 
                      />
                    </div>
                    <span>ATLAS is thinking...</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Dark Theme */}
      <section className="py-16 md:py-32 bg-livemed-deep relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white">
              Trusted by <span className="text-gradient-livemed">Future Physicians</span>
            </h2>
            <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto font-light px-4">
              See what our students have to say about their experience.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto"
          >
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
              <motion.div
                key={index}
                variants={fadeInUp}
              >
                <Card className="h-full glass-card border-white/5 bg-transparent">
                  <CardContent className="p-5 md:p-8">
                    <div className="text-2xl text-white/20 mb-3 font-serif">"</div>
                    <p className="text-white/60 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                      {testimonial.quote}
                    </p>
                    <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-livemed-blue/20 border border-livemed-blue/30 flex items-center justify-center text-xs font-semibold text-livemed-cyan">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm md:text-base">{testimonial.name}</p>
                        <p className="text-xs md:text-sm text-white/40">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Institution CTA */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-livemed-deep border-t border-white/5">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-4 md:px-6 text-center relative"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center gap-3 md:gap-4 mb-6 md:mb-10"
          >
            {[Globe, Users, GraduationCap].map((Icon, index) => (
              <motion.div 
                key={index}
                variants={fadeInScale}
                className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl glass-card flex items-center justify-center"
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-white/80" />
              </motion.div>
            ))}
          </motion.div>

          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-8"
          >
            Partner With Livemed Learning
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed font-light px-4"
          >
            We work with medical schools and universities worldwide 
            to bring U.S.-standard medical education to students everywhere.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
          >
            <Button
              size="lg"
              className="bg-white text-livemed-navy hover:bg-white/90 px-6 md:px-8 py-5 md:py-6 rounded-full font-semibold group text-sm md:text-base"
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
              className="px-6 md:px-8 py-5 md:py-6 rounded-full text-white/70 hover:text-white border border-white/10 hover:bg-white/5 text-sm md:text-base"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
      </div>
    </>
  );
};

export default Landing;
