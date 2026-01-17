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
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Every decision we make is guided by our mission to democratize medical education globally.",
    },
    {
      icon: Heart,
      title: "Student-Centered",
      description: "We put learners first, designing experiences that maximize engagement and retention.",
    },
    {
      icon: Globe,
      title: "Globally Inclusive",
      description: "We believe geography shouldn't determine access to quality medical training.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We hold ourselves to the highest standards of academic rigor and clinical accuracy.",
    },
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former residency program director with 15 years in medical education.",
    },
    {
      name: "Dr. Michael Rivera",
      role: "Chief Medical Officer",
      bio: "Board-certified internist and USMLE curriculum expert.",
    },
    {
      name: "Dr. Aisha Patel",
      role: "VP of Clinical Education",
      bio: "Led curriculum development at two Caribbean medical schools.",
    },
  ];

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transforming Medical Education for the Global Physician
            </h1>
            <p className="text-lg text-muted-foreground">
              We're on a mission to make world-class medical training accessible to every 
              aspiring physician, regardless of where they study.
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
                  Livemed Learning was founded by a team of physician educators who witnessed 
                  firsthand the challenges international medical graduates face when pursuing 
                  U.S. residency training.
                </p>
                <p className="text-muted-foreground mb-4">
                  We combine cutting-edge AI technology with proven pedagogical methods to 
                  deliver clinical education that meets the highest standards of U.S. medical training.
                </p>
                <p className="text-muted-foreground">
                  Our platform has helped thousands of students from over 100 countries prepare 
                  for successful careers in medicine.
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
                    <div className="text-sm text-muted-foreground">Active Students</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Pass Rate</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
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

      {/* Leadership */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Physician educators with decades of combined experience in medical training
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

      {/* CTA */}
      <section className="py-20 gradient-livemed">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Start your journey toward becoming a U.S.-trained physician today.
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