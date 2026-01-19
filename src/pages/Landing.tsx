import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import DemoVideoModal from "@/components/DemoVideoModal";
import ParticleBackground from "@/components/ParticleBackground";
import FloatingMedicalIcons from "@/components/FloatingMedicalIcons";
import heroVideo from "@/assets/hero-background.mp4";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Video plays at normal speed
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Subtle parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const orbY1 = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const orbY2 = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  const features = [
    {
      icon: Brain,
      title: "ATLAS™ AI Professor",
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
    <>
      <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <div ref={containerRef} className="flex flex-col bg-livemed-deep">
      {/* Hero Section - Apple Style Clean */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
        
        {/* Subtle Gradient Orbs - Layered over video */}
        <motion.div 
          style={{ y: orbY1, background: 'radial-gradient(circle, hsl(200 100% 50% / 0.15) 0%, transparent 70%)' }}
          className="absolute -top-[300px] -left-[200px] w-[900px] h-[900px] rounded-full blur-[180px] pointer-events-none"
        />
        <motion.div 
          style={{ y: orbY2, background: 'radial-gradient(circle, hsl(190 95% 55% / 0.1) 0%, transparent 70%)' }}
          className="absolute -bottom-[200px] -right-[100px] w-[700px] h-[700px] rounded-full blur-[150px] pointer-events-none"
        />
        
        {/* Floating Medical Icons */}
        <FloatingMedicalIcons />
        
        {/* Top fade for seamless header blend */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
        
        {/* Hero Content */}
        <motion.div 
          style={{ y: heroY }}
          className="container mx-auto px-6 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge with Glow */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-card-hover px-5 py-2.5 rounded-full text-sm mb-10 shadow-glow"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-livemed-success"></span>
              </span>
              <span className="text-white/70 font-medium">Now enrolling for 2026</span>
            </motion.div>

            {/* Brand Name */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-2xl md:text-3xl font-semibold text-gradient-livemed text-glow mb-4 tracking-wide"
            >
              Livemed Learning
            </motion.div>

            {/* Main Headline - Apple Style Bold Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-6xl md:text-7xl lg:text-[96px] font-semibold tracking-[-0.03em] mb-6 leading-[1.05]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
            >
              <span className="text-white">Where AI</span>
              <br />
              <span className="text-gradient-livemed">Meets Medicine.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl md:text-2xl text-white/40 mb-14 max-w-xl mx-auto leading-relaxed font-light tracking-tight"
            >
              Train smarter. Heal better.
            </motion.p>

            {/* CTA Buttons - Enhanced Glow */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="btn-glow gradient-livemed text-base px-8 py-6 rounded-full group font-semibold" 
                asChild
              >
                <Link to="/auth?mode=signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                className="text-base px-8 py-6 rounded-full text-white/70 hover:text-white glass-card hover:bg-white/5 group"
                onClick={() => setIsDemoOpen(true)}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2 glass-card"
          >
            <div className="w-1 h-2.5 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Enhanced Glass Cards */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-livemed-deep" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-6 relative">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.label} 
                variants={fadeInScale}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="glass-card-hover rounded-2xl p-6 md:p-8 text-center shadow-glow"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-livemed mb-2 text-glow">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/40 uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Dark Glass Cards */}
      <section className="py-32 bg-livemed-deep relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-grid-pattern" />
        
        <div className="container mx-auto px-6 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div 
              variants={fadeInScale}
              className="inline-flex items-center gap-2 text-livemed-cyan text-sm font-medium mb-6 glass-card px-4 py-2 rounded-full"
            >
              <Sparkles className="h-4 w-4" />
              Powered by AI
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient-livemed text-glow">Complete Medical Education</span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
              Everything you need to become a world-class physician.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="group h-full glass-card border-white/5 hover:border-livemed-blue/30 transition-all duration-500 card-glow-hover bg-transparent">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-glow">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3 text-white group-hover:text-livemed-cyan transition-colors">{feature.title}</h3>
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
      <section className="py-32 relative overflow-hidden bg-livemed-deep">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-livemed-blue/5 to-transparent" />
        
        <div className="container mx-auto px-6 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Programs for <span className="text-gradient-livemed">Every Stage</span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
              From foundational sciences to residency preparation.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {programs.map((program) => (
              <motion.div
                key={program.title}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link to={program.href}>
                  <Card className="h-full group glass-card border-white/5 hover:border-livemed-cyan/40 transition-all duration-500 card-glow-hover bg-transparent">
                    <CardContent className="p-8">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-livemed-cyan uppercase tracking-wider mb-4 px-3 py-1.5 bg-livemed-cyan/10 rounded-full border border-livemed-cyan/20">
                        <Activity className="h-3 w-3" />
                        {program.years}
                      </div>
                      <h3 className="font-semibold text-xl mb-3 text-white group-hover:text-livemed-cyan transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-white/40 text-sm mb-6">
                        {program.description}
                      </p>
                      <div className="flex items-center text-livemed-cyan text-sm font-medium group-hover:gap-2 gap-1.5 transition-all">
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
      <section className="py-32 relative overflow-hidden bg-livemed-deep">
        <div className="absolute inset-0 bg-mesh-gradient opacity-40" />
        <div className="absolute inset-0 bg-neural-pattern" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-livemed-blue/10 rounded-full blur-[80px] animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-[250px] h-[250px] bg-livemed-cyan/8 rounded-full blur-[80px] animate-pulse-glow animation-delay-2000" />
        
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="inline-flex items-center gap-2 text-livemed-cyan text-sm font-medium mb-8 glass-card px-4 py-2 rounded-full">
                <MessageSquare className="h-4 w-4" />
                Meet Your AI Professor
                <div className="w-2 h-2 bg-livemed-success rounded-full animate-pulse" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight text-glow">
                ATLAS™ — The Most Patient Professor{" "}
                <span className="text-gradient-livemed">You'll Ever Have</span>
              </h2>

              <p className="text-lg text-white/50 mb-10 leading-relaxed font-light">
                Faculty-grade AI that teaches using Socratic methodology, 
                tracks your progress, and grades your clinical reasoning.
              </p>

              <motion.ul 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4 mb-10"
              >
                {[
                  "Personalized study plans based on your weak areas",
                  "Clinical case simulations with real-time feedback",
                  "USMLE-style question explanations",
                  "Available 24/7 in any timezone",
                ].map((item) => (
                  <motion.li 
                    key={item} 
                    variants={fadeInUp}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-white/60 text-sm">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <Button className="btn-glow gradient-livemed px-8 py-6 rounded-full group font-semibold" asChild>
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
              <div className="absolute inset-0 bg-livemed-blue/15 rounded-3xl blur-[40px]" />
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="glass-card rounded-3xl p-8 relative shadow-glow-lg"
              >
                {/* Terminal header */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-livemed flex items-center justify-center shadow-glow">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">ATLAS™</div>
                      <div className="text-xs text-white/40">
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
                  className="space-y-5"
                >
                  {/* ATLAS Message */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white/[0.03] rounded-2xl p-5 border border-white/5"
                  >
                    <p className="text-white/80 text-sm leading-relaxed">
                      "A 55-year-old male presents with crushing chest pain 
                      radiating to the left arm. What's your initial differential?"
                    </p>
                  </motion.div>

                  {/* Student Response */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-livemed-cyan/10 rounded-2xl p-5 ml-8 border border-livemed-cyan/20"
                  >
                    <p className="text-livemed-cyan/90 text-sm leading-relaxed">
                      "I would consider acute MI, unstable angina, or aortic 
                      dissection. I'd start with an ECG and troponins..."
                    </p>
                  </motion.div>

                  {/* ATLAS Follow-up */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white/[0.03] rounded-2xl p-5 border border-white/5"
                  >
                    <p className="text-white/80 text-sm leading-relaxed">
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Dark Theme */}
      <section className="py-32 bg-livemed-deep relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        
        <div className="container mx-auto px-6 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Trusted by <span className="text-gradient-livemed">Future Physicians</span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
              See what our students have to say about their experience.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                quote: "ATLAS helped me understand complex pathophysiology concepts I'd struggled with for months. The Socratic method really works.",
                name: "Dr. Maria Santos",
                role: "IMG from Brazil, Matched Internal Medicine",
              },
              {
                quote: "The virtual rotations gave me confidence walking into my first U.S. clinical experience. The cases felt incredibly authentic.",
                name: "Ahmed Khalil",
                role: "Medical Student, Egypt",
              },
              {
                quote: "Our students' USMLE pass rates improved 18% after implementing Livemed Learning. The analytics help us identify struggling students early.",
                name: "Dr. James Wilson",
                role: "Dean of Clinical Education",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="h-full glass-card border-white/5 card-glow-hover bg-transparent">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Sparkles key={i} className="h-4 w-4 text-livemed-cyan" />
                      ))}
                    </div>
                    <p className="text-white/60 mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-white/40">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Institution CTA - Enhanced Gradient */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-livemed" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        
        {/* Floating Elements with Glow */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 opacity-20"
        >
          <Globe className="h-24 w-24 text-white" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 opacity-20"
        >
          <GraduationCap className="h-20 w-20 text-white" />
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-6 text-center relative"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center gap-4 mb-10"
          >
            {[Globe, Users, GraduationCap].map((Icon, index) => (
              <motion.div 
                key={index}
                variants={fadeInScale}
                className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center shadow-glow"
              >
                <Icon className="h-6 w-6 text-white/80" />
              </motion.div>
            ))}
          </motion.div>

          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-8 text-glow"
          >
            Partner With Livemed Learning
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            We work with medical schools and universities worldwide 
            to bring U.S.-standard medical education to students everywhere.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-white text-livemed-navy hover:bg-white/90 px-8 py-6 rounded-full font-semibold group shadow-glow-lg"
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
              className="px-8 py-6 rounded-full text-white/70 hover:text-white glass-card hover:bg-white/10"
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
