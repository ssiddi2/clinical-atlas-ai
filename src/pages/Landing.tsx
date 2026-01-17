import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
  Zap,
  Activity,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" as const }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" as const }
  }
};

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
  const orbY1 = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const orbY2 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const statsY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);
  const floatY = useTransform(scrollYProgress, [0, 1], [0, -300]);

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
    <div ref={containerRef} className="flex flex-col bg-livemed-navy">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80"
        >
          <source
            src="https://videos.pexels.com/video-files/6129507/6129507-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-livemed-navy/90 via-livemed-navy/80 to-livemed-navy/95" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Animated Glow Orbs with Parallax */}
        <motion.div 
          style={{ y: orbY1 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-livemed-blue/20 rounded-full blur-3xl animate-pulse-glow" 
        />
        <motion.div 
          style={{ y: orbY2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" 
        />
        
        {/* Hero Content with Parallax */}
        <motion.div 
          style={{ y: heroY }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-white/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-livemed-success"></span>
              </span>
              <span className="text-white/90">Now enrolling for 2026 cohorts</span>
              <Sparkles className="h-4 w-4 text-livemed-blue" />
            </motion.div>

            {/* Main Headline with Glow */}
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
              <span className="text-white text-glow">The Future of</span>
              <br />
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-gradient-livemed text-glow-strong inline-block"
              >
                Medical Education
              </motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg md:text-xl lg:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              LIVEMED University delivers U.S.-standard medical education through 
              AI faculty, virtual clinical rotations, and competency-based 
              assessments — preparing the next generation of physicians worldwide.
            </motion.p>

            {/* CTA Buttons with Glow */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="btn-glow gradient-livemed text-lg px-10 py-7 rounded-xl group" asChild>
                <Link to="/auth?mode=signup">
                  <span className="relative z-10 flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-card text-lg px-10 py-7 rounded-xl border-white/20 text-white hover:bg-white/10 hover:border-white/30 group" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
              >
                <div className="w-1.5 h-3 bg-white/50 rounded-full" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Futuristic Glass Cards */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-livemed-navy to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <motion.div 
          style={{ y: statsY }}
          className="container mx-auto px-4 relative"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.label} 
                variants={fadeInScale}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card rounded-2xl p-6 text-center border border-white/10 hover:border-livemed-blue/50 transition-all duration-500 hover:shadow-glow group"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient-livemed mb-3 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Holographic Cards */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-livemed-blue/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--livemed-blue)/0.05),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div 
              variants={fadeInScale}
              className="inline-flex items-center gap-2 bg-livemed-blue/10 text-livemed-blue px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Zap className="h-4 w-4" />
              Powered by Advanced AI
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-livemed">A Complete Medical Education</span>
              <br />
              <span className="text-foreground">Platform</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become a world-class physician, powered by 
              AI and designed for global accessibility.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="group relative h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-livemed-blue/50 transition-all duration-500 hover:shadow-glow overflow-hidden">
                  {/* Holographic shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <CardContent className="p-8 relative">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-2xl gradient-livemed flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300"
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-livemed-blue transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programs Section - Gradient Mesh Background */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Programs for <span className="text-gradient-livemed">Every Stage</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From foundational sciences to residency preparation, our curriculum 
              adapts to where you are in your medical journey.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {programs.map((program) => (
              <motion.div
                key={program.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
              >
                <Link to={program.href}>
                  <Card className="h-full group relative bg-card/80 backdrop-blur-sm border-border/50 hover:border-livemed-blue transition-all duration-500 overflow-hidden">
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-[-1px] bg-gradient-to-r from-livemed-blue via-accent to-livemed-blue rounded-lg animate-gradient-x" />
                      <div className="absolute inset-[1px] bg-card rounded-[calc(var(--radius)-1px)]" />
                    </div>
                    
                    <CardContent className="p-8 relative">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-livemed-blue uppercase tracking-wider mb-4 px-3 py-1.5 bg-livemed-blue/10 rounded-full">
                        <Activity className="h-3 w-3" />
                        {program.years}
                      </div>
                      <h3 className="font-bold text-2xl mb-3 group-hover:text-livemed-blue transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {program.description}
                      </p>
                      <div className="flex items-center text-livemed-blue font-medium group-hover:gap-3 gap-2 transition-all">
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

      {/* ELI Section - Neural Network Aesthetic */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-livemed-navy">
        <div className="absolute inset-0 bg-neural-pattern opacity-10" />
        <motion.div 
          style={{ y: floatY }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-livemed-blue/10 rounded-full blur-3xl" 
        />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div 
                variants={fadeInScale}
                className="inline-flex items-center gap-2 glass-card text-livemed-blue px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-livemed-blue/30"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Meet Your AI Professor</span>
                <div className="w-2 h-2 bg-livemed-success rounded-full animate-pulse" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-white">
                ELI™ — The Most Patient Professor{" "}
                <span className="text-gradient-livemed">You'll Ever Have</span>
              </h2>

              <p className="text-lg text-white/70 mb-10 leading-relaxed">
                ELI is not a chatbot. It's a faculty-grade AI system that teaches 
                using Socratic methodology, tracks your progress longitudinally, 
                and grades your clinical reasoning — not just your answers.
              </p>

              <motion.ul 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-5 mb-10"
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
                    className="flex items-start gap-4"
                  >
                    <div className="w-6 h-6 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="btn-glow gradient-livemed px-8 py-6 text-lg rounded-xl group" asChild>
                  <Link to="/eli">
                    <span className="flex items-center">
                      Learn More About ELI™
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* ELI Chat Interface - Terminal Style */}
            <motion.div 
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-livemed-blue/20 rounded-3xl blur-2xl" />
              
              <motion.div 
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="glass-card rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Terminal header */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-livemed flex items-center justify-center shadow-glow">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">ELI™</div>
                      <div className="text-xs text-white/50">
                        AI Professor · Cardiology Module
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {/* ELI Message */}
                  <motion.div 
                    variants={fadeInUp}
                    className="glass-card bg-white/5 rounded-2xl p-5 border border-white/5"
                  >
                    <p className="text-white/90 leading-relaxed">
                      "A 55-year-old male presents with crushing chest pain 
                      radiating to the left arm. What's your initial differential, 
                      and what would you order first?"
                    </p>
                  </motion.div>

                  {/* Student Response */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-livemed-blue/20 rounded-2xl p-5 ml-8 border border-livemed-blue/30"
                  >
                    <p className="text-livemed-blue leading-relaxed">
                      "I would consider acute MI, unstable angina, or aortic 
                      dissection. I'd start with an ECG and troponins..."
                    </p>
                  </motion.div>

                  {/* ELI Follow-up with typing indicator */}
                  <motion.div 
                    variants={fadeInUp}
                    className="glass-card bg-white/5 rounded-2xl p-5 border border-white/5"
                  >
                    <p className="text-white/90 leading-relaxed">
                      "Good start! You mentioned aortic dissection — what 
                      physical exam finding would make you more suspicious of 
                      that over MI?"
                    </p>
                  </motion.div>

                  {/* Typing indicator */}
                  <motion.div 
                    variants={fadeInUp}
                    className="flex items-center gap-2 text-white/40 text-sm pl-2"
                  >
                    <div className="flex gap-1">
                      <motion.span 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-white/40 rounded-full" 
                      />
                      <motion.span 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        className="w-2 h-2 bg-white/40 rounded-full" 
                      />
                      <motion.span 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="w-2 h-2 bg-white/40 rounded-full" 
                      />
                    </div>
                    <span>ELI is thinking...</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Institution CTA - Immersive Gradient */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-livemed" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Floating Elements with Parallax */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 opacity-20"
        >
          <Globe className="h-24 w-24 text-white" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 opacity-20"
        >
          <GraduationCap className="h-20 w-20 text-white" />
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-4 text-center relative"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center gap-6 mb-10"
          >
            {[Globe, Users, GraduationCap].map((Icon, index) => (
              <motion.div 
                key={index}
                variants={fadeInScale}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl glass-card border border-white/20 flex items-center justify-center"
              >
                <Icon className="h-8 w-8 text-white/90" />
              </motion.div>
            ))}
          </motion.div>

          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 text-glow"
          >
            Partner With LIVEMED University
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            We work with medical schools, universities, and ministries of health 
            to bring U.S.-standard medical education to students worldwide.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="bg-white text-livemed-navy hover:bg-white/90 text-lg px-10 py-7 rounded-xl font-semibold group shadow-xl"
                asChild
              >
                <Link to="/institutions">
                  Institutional Partnerships
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="glass-card text-lg px-10 py-7 rounded-xl border-white/30 text-white hover:bg-white/10 group"
                asChild
              >
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
