import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Award, TrendingUp, Users, Clock, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const caseStudies = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    origin: "Philippines",
    currentRole: "Internal Medicine Resident",
    institution: "Johns Hopkins Hospital",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    step1Score: 248,
    step2Score: 259,
    matchYear: 2024,
    quote: "LIVEMED's virtual rotations gave me the U.S. clinical exposure I needed. The ATLAS AI helped me understand complex cases in ways textbooks never could.",
    highlights: [
      "Completed 6 virtual rotations across specialties",
      "200+ hours with U.S. attending physicians",
      "Matched into top 10 Internal Medicine program"
    ],
    programUsed: ["Virtual Rotations", "ATLAS AI", "USMLE Prep"]
  },
  {
    id: 2,
    name: "Dr. Ahmed Hassan",
    origin: "Egypt",
    currentRole: "Surgery Resident",
    institution: "Mayo Clinic",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    step1Score: 252,
    step2Score: 264,
    matchYear: 2024,
    quote: "The structured curriculum and personalized learning path helped me improve my Step 1 score by 30 points. The case-based learning was exceptional.",
    highlights: [
      "Improved Step 1 score from 218 to 252",
      "Strong letters from virtual rotation preceptors",
      "Published research with LIVEMED faculty"
    ],
    programUsed: ["Clinical Program", "Research Track", "USMLE Prep"]
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    origin: "India",
    currentRole: "Pediatrics Resident",
    institution: "Boston Children's Hospital",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    step1Score: 245,
    step2Score: 256,
    matchYear: 2023,
    quote: "As an IMG, I was worried about getting meaningful U.S. clinical experience. LIVEMED connected me with incredible mentors who guided my entire journey.",
    highlights: [
      "4 strong Letters of Recommendation",
      "Matched in competitive pediatrics program",
      "Now mentoring other LIVEMED students"
    ],
    programUsed: ["Virtual Rotations", "Mentorship Program", "Residency Prep"]
  },
  {
    id: 4,
    name: "Dr. Carlos Rodriguez",
    origin: "Colombia",
    currentRole: "Emergency Medicine Resident",
    institution: "UCLA Medical Center",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
    step1Score: 241,
    step2Score: 251,
    matchYear: 2024,
    quote: "The realistic case simulations and AI-powered feedback prepared me for anything. I walked into my residency feeling confident and ready.",
    highlights: [
      "Completed intensive EM rotation program",
      "High-fidelity simulation training",
      "Seamless transition to residency"
    ],
    programUsed: ["Virtual Rotations", "Simulation Lab", "ATLAS AI"]
  }
];

const stats = [
  { value: "92%", label: "Match Rate", icon: Target },
  { value: "500+", label: "Matched IMGs", icon: GraduationCap },
  { value: "45+", label: "Countries", icon: Users },
  { value: "35pt", label: "Avg Score Improvement", icon: TrendingUp }
];

const CaseStudies = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Student Success Stories</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              From IMG to{" "}
              <span className="text-primary">Matched Resident</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Real stories from international medical graduates who transformed their careers 
              with LIVEMED University's comprehensive training programs.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-0">
                    <div className={`grid md:grid-cols-2 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                      {/* Image & Basic Info */}
                      <div className={`relative bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <div className="flex items-center gap-6 mb-6">
                          <img
                            src={study.image}
                            alt={study.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          <div>
                            <h3 className="text-2xl font-bold text-foreground">{study.name}</h3>
                            <p className="text-primary font-medium">{study.currentRole}</p>
                            <p className="text-muted-foreground">{study.institution}</p>
                            <p className="text-sm text-muted-foreground">From {study.origin}</p>
                          </div>
                        </div>
                        
                        {/* Scores */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-background/80 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{study.step1Score}</div>
                            <div className="text-xs text-muted-foreground">Step 1</div>
                          </div>
                          <div className="bg-background/80 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{study.step2Score}</div>
                            <div className="text-xs text-muted-foreground">Step 2 CK</div>
                          </div>
                          <div className="bg-background/80 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{study.matchYear}</div>
                            <div className="text-xs text-muted-foreground">Matched</div>
                          </div>
                        </div>

                        {/* Programs Used */}
                        <div className="flex flex-wrap gap-2">
                          {study.programUsed.map((program, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quote & Highlights */}
                      <div className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        <blockquote className="text-lg italic text-muted-foreground mb-6 border-l-4 border-primary pl-4">
                          "{study.quote}"
                        </blockquote>
                        
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Key Achievements
                        </h4>
                        <ul className="space-y-3">
                          {study.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join hundreds of IMGs who have transformed their medical careers with LIVEMED University.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary" asChild>
                <Link to="/programs">
                  Explore Programs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/contact">Request Information</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
