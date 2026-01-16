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
  Sparkles,
  Zap,
  Activity,
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
    <div className="flex flex-col bg-livemed-navy">
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
        
        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-livemed-blue/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-full text-sm font-medium mb-8 animate-fade-in border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-livemed-success"></span>
              </span>
              <span className="text-white/90">Now enrolling for 2026 cohorts</span>
              <Sparkles className="h-4 w-4 text-livemed-blue" />
            </div>

            {/* Main Headline with Glow */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-in animation-delay-200">
              <span className="text-white text-glow">The Future of</span>
              <br />
              <span className="text-gradient-livemed text-glow-strong">Medical Education</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-400">
              LIVEMED University delivers U.S.-standard medical education through 
              AI faculty, virtual clinical rotations, and competency-based 
              assessments — preparing the next generation of physicians worldwide.
            </p>

            {/* CTA Buttons with Glow */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-600">
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
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
                <div className="w-1.5 h-3 bg-white/50 rounded-full animate-scroll-indicator" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Futuristic Glass Cards */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-livemed-navy to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="glass-card rounded-2xl p-6 text-center border border-white/10 hover:border-livemed-blue/50 transition-all duration-500 hover:shadow-glow group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient-livemed mb-3 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Holographic Cards */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-livemed-blue/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--livemed-blue)/0.05),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-livemed-blue/10 text-livemed-blue px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Powered by Advanced AI
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-livemed">A Complete Medical Education</span>
              <br />
              <span className="text-foreground">Platform</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become a world-class physician, powered by 
              AI and designed for global accessibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-livemed-blue/50 transition-all duration-500 hover:shadow-glow hover:-translate-y-2 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Holographic shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <CardContent className="p-8 relative">
                  <div className="w-14 h-14 rounded-2xl gradient-livemed flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-livemed-blue transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section - Gradient Mesh Background */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Programs for <span className="text-gradient-livemed">Every Stage</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From foundational sciences to residency preparation, our curriculum 
              adapts to where you are in your medical journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <Link key={program.title} to={program.href}>
                <Card className="h-full group relative bg-card/80 backdrop-blur-sm border-border/50 hover:border-livemed-blue transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
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
            ))}
          </div>
        </div>
      </section>

      {/* ELI Section - Neural Network Aesthetic */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-livemed-navy">
        <div className="absolute inset-0 bg-neural-pattern opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-livemed-blue/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 glass-card text-livemed-blue px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-livemed-blue/30">
                <MessageSquare className="h-4 w-4" />
                <span>Meet Your AI Professor</span>
                <div className="w-2 h-2 bg-livemed-success rounded-full animate-pulse" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-white">
                ELI™ — The Most Patient Professor{" "}
                <span className="text-gradient-livemed">You'll Ever Have</span>
              </h2>

              <p className="text-lg text-white/70 mb-10 leading-relaxed">
                ELI is not a chatbot. It's a faculty-grade AI system that teaches 
                using Socratic methodology, tracks your progress longitudinally, 
                and grades your clinical reasoning — not just your answers.
              </p>

              <ul className="space-y-5 mb-10">
                {[
                  "Personalized study plans based on your weak areas",
                  "Clinical case simulations with real-time feedback",
                  "USMLE-style question explanations",
                  "Available 24/7 in any timezone",
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-6 h-6 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>

              <Button className="btn-glow gradient-livemed px-8 py-6 text-lg rounded-xl group" asChild>
                <Link to="/eli">
                  <span className="flex items-center">
                    Learn More About ELI™
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
            </div>

            {/* ELI Chat Interface - Terminal Style */}
            <div className="relative animate-fade-in animation-delay-400">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-livemed-blue/20 rounded-3xl blur-2xl" />
              
              <div className="glass-card rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
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

                <div className="space-y-6">
                  {/* ELI Message */}
                  <div className="glass-card bg-white/5 rounded-2xl p-5 border border-white/5">
                    <p className="text-white/90 leading-relaxed">
                      "A 55-year-old male presents with crushing chest pain 
                      radiating to the left arm. What's your initial differential, 
                      and what would you order first?"
                    </p>
                  </div>

                  {/* Student Response */}
                  <div className="bg-livemed-blue/20 rounded-2xl p-5 ml-8 border border-livemed-blue/30">
                    <p className="text-livemed-blue leading-relaxed">
                      "I would consider acute MI, unstable angina, or aortic 
                      dissection. I'd start with an ECG and troponins..."
                    </p>
                  </div>

                  {/* ELI Follow-up with typing indicator */}
                  <div className="glass-card bg-white/5 rounded-2xl p-5 border border-white/5">
                    <p className="text-white/90 leading-relaxed">
                      "Good start! You mentioned aortic dissection — what 
                      physical exam finding would make you more suspicious of 
                      that over MI?"
                    </p>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex items-center gap-2 text-white/40 text-sm pl-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>ELI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institution CTA - Immersive Gradient */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-livemed" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 opacity-20">
          <Globe className="h-24 w-24 text-white animate-float" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-20">
          <GraduationCap className="h-20 w-20 text-white animate-float animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="flex justify-center gap-6 mb-10">
            {[Globe, Users, GraduationCap].map((Icon, index) => (
              <div 
                key={index}
                className="w-16 h-16 rounded-2xl glass-card border border-white/20 flex items-center justify-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="h-8 w-8 text-white/90" />
              </div>
            ))}
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 text-glow animate-fade-in animation-delay-300">
            Partner With LIVEMED University
          </h2>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-400">
            We work with medical schools, universities, and ministries of health 
            to bring U.S.-standard medical education to students worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in animation-delay-600">
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
            <Button
              size="lg"
              variant="outline"
              className="glass-card text-lg px-10 py-7 rounded-xl border-white/30 text-white hover:bg-white/10 group"
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