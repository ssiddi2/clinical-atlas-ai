import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Globe,
  Target,
  Heart,
  Users,
  Award,
  ArrowRight,
  BookOpen,
  Shield,
  Stethoscope,
  Brain,
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Every decision we make is guided by our mission to advance medical education globally through innovation and excellence.",
    },
    {
      icon: Heart,
      title: "Student-Centered",
      description: "We put learners first, designing experiences that maximize engagement, retention, and clinical competency.",
    },
    {
      icon: Globe,
      title: "Globally Inclusive",
      description: "We believe geography shouldn't determine access to quality professional medical training.",
    },
    {
      icon: Award,
      title: "Academic Excellence",
      description: "We hold ourselves to the highest standards of academic rigor and clinical accuracy in all our programs.",
    },
  ];

  const offerings = [
    {
      icon: BookOpen,
      title: "U.S.-Standard Curriculum",
      description: "Comprehensive courses aligned with USMLE, ACGME, and LCME standards for clinical and pre-clinical education.",
    },
    {
      icon: Stethoscope,
      title: "Virtual Clinical Rotations",
      description: "Immersive observership experiences with U.S.-based attending physicians and authentic case discussions.",
    },
    {
      icon: Brain,
      title: "ATLAS™ AI Professor",
      description: "24/7 AI-powered tutoring using Socratic methodology for personalized learning and exam preparation.",
    },
    {
      icon: Award,
      title: "Professional Certificates",
      description: "Competency-based credentials and continuing medical education (CME) credits recognized by partner institutions.",
    },
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former residency program director with 15 years in academic medical education.",
    },
    {
      name: "Dr. Michael Rivera",
      role: "Chief Medical Officer",
      bio: "Board-certified internist and USMLE curriculum development specialist.",
    },
    {
      name: "Dr. Aisha Patel",
      role: "VP of Clinical Education",
      bio: "Led clinical curriculum development at international medical institutions.",
    },
  ];

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              About Our Institution
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Livemed Academy
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Division of Clinical & Continuing Medical Education
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              A professional medical education institute delivering U.S.-standard training, 
              clinical observerships, and AI-powered learning to physicians and medical students worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  Livemed Academy was established by a team of physician educators who recognized 
                  the need for accessible, high-quality clinical training for international medical 
                  graduates and healthcare professionals worldwide.
                </p>
                <p className="text-muted-foreground mb-4">
                  We combine cutting-edge AI technology with proven pedagogical methods to 
                  deliver professional medical education that meets the highest standards of 
                  U.S. clinical training.
                </p>
                <p className="text-muted-foreground">
                  Our programs have served thousands of learners from over 100 countries, 
                  preparing them for successful careers in medicine through certificates, 
                  clinical training credentials, and continuing medical education.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">50+</div>
                    <div className="text-sm text-muted-foreground">Partner Institutions</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">100+</div>
                    <div className="text-sm text-muted-foreground">Countries Served</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">10K+</div>
                    <div className="text-sm text-muted-foreground">Active Learners</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What We Offer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional certificates, clinical training credentials, and continuing medical education — designed to advance your medical career.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {offerings.map((offering) => (
              <Card key={offering.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mx-auto mb-4">
                    <offering.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{offering.title}</h3>
                  <p className="text-sm text-muted-foreground">{offering.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation & Standards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Educational Standards</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Our curriculum is developed in alignment with recognized medical education standards 
                to ensure quality and relevance for your professional development.
              </p>
              <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto">
                Livemed's AI-powered virtual specialty care services are accredited by The Joint Commission. 
                Livemed Academy is the clinical education division of Livemed.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">USMLE-Aligned</h3>
                  <p className="text-sm text-muted-foreground">
                    Content mapped to USMLE Step 1, Step 2 CK, and Step 3 exam blueprints.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">ACGME Competencies</h3>
                  <p className="text-sm text-muted-foreground">
                    Training aligned with core competency frameworks for residency readiness.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">CME Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    Continuing medical education opportunities for practicing physicians.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Physician educators with decades of combined experience in academic medicine and clinical training
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-accent mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Educational Disclaimer:</strong> Livemed Academy is a professional medical education platform 
              offering clinical training, continuing medical education, and competency-based credentials. 
              Livemed Academy is not a degree-granting institution and does not award MD or equivalent medical degrees.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Joint Commission accreditation applies to Livemed's AI-powered virtual specialty care services, 
              not to the Livemed Academy educational platform.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-livemed">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Advance Your Medical Career?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of medical professionals worldwide who trust Livemed Academy 
            for their clinical education and professional development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?mode=signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;