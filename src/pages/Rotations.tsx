import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  Heart,
  Brain,
  Zap,
  Activity,
  Users,
  CheckCircle,
  Clock,
  Award,
  FileText,
  ArrowRight,
} from "lucide-react";

const Rotations = () => {
  const rotations = [
    {
      id: "internal-medicine",
      title: "Internal Medicine",
      icon: Stethoscope,
      duration: "8 weeks",
      cases: 40,
      description: "Master comprehensive adult medicine with complex multi-system cases, diagnostic reasoning, and evidence-based management.",
      topics: ["Hospital Medicine", "Ambulatory Care", "Critical Care", "Consultative Medicine"],
    },
    {
      id: "surgery",
      title: "Surgery",
      icon: Activity,
      duration: "6 weeks",
      cases: 32,
      description: "Develop surgical decision-making through pre-operative evaluation, operative principles, and post-operative care.",
      topics: ["General Surgery", "Trauma", "Surgical Emergencies", "Perioperative Care"],
    },
    {
      id: "emergency-medicine",
      title: "Emergency Medicine",
      icon: Zap,
      duration: "4 weeks",
      cases: 50,
      description: "Handle high-acuity presentations with rapid assessment, stabilization, and disposition decision-making.",
      topics: ["Trauma", "Cardiac Emergencies", "Toxicology", "Pediatric Emergencies"],
    },
    {
      id: "cardiology",
      title: "Cardiology",
      icon: Heart,
      duration: "4 weeks",
      cases: 28,
      description: "Deep dive into cardiovascular pathology, EKG interpretation, heart failure, and acute coronary syndromes.",
      topics: ["Heart Failure", "Arrhythmias", "ACS", "Valvular Disease"],
    },
    {
      id: "neurology",
      title: "Neurology",
      icon: Brain,
      duration: "4 weeks",
      cases: 24,
      description: "Localize lesions, interpret imaging, and manage neurological emergencies and chronic conditions.",
      topics: ["Stroke", "Seizures", "Movement Disorders", "Neuro-oncology"],
    },
    {
      id: "family-medicine",
      title: "Family Medicine",
      icon: Users,
      duration: "6 weeks",
      cases: 36,
      description: "Provide comprehensive primary care across the lifespan with emphasis on prevention and chronic disease management.",
      topics: ["Preventive Care", "Chronic Disease", "Pediatrics", "Women's Health"],
    },
  ];

  const features = [
    {
      icon: FileText,
      title: "De-identified U.S. Cases",
      description: "Real patient presentations from U.S. academic medical centers",
    },
    {
      icon: Users,
      title: "Faculty Evaluations",
      description: "Written assessments by U.S. physician faculty members",
    },
    {
      icon: Award,
      title: "Performance-Based LORs",
      description: "Earn letters of recommendation through demonstrated excellence",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Complete rotations on your own schedule, 24/7 access",
    },
  ];

  return (
    <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 gradient-livemed-light" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Stethoscope className="h-4 w-4" />
                Virtual Clinical Training
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Virtual U.S. Clinical Rotations
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Experience authentic U.S. clinical training without leaving your country. 
                Work through real case discussions, participate in attending rounds, 
                and receive faculty evaluations that matter for residency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gradient-livemed" asChild>
                  <Link to="/auth?mode=signup">
                    Start Your Rotation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Request Info</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rotations Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Available Rotations</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each rotation includes structured case presentations, clinical reasoning exercises, 
                and comprehensive faculty feedback aligned with ACGME competencies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rotations.map((rotation) => (
                <Card key={rotation.id} className="hover:shadow-livemed transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center group-hover:scale-110 transition-transform">
                        <rotation.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{rotation.duration}</div>
                        <div className="text-muted-foreground">{rotation.cases} cases</div>
                      </div>
                    </div>
                    <CardTitle>{rotation.title}</CardTitle>
                    <CardDescription>{rotation.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {rotation.topics.map((topic) => (
                        <div key={topic} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-muted-foreground">{topic}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/rotations/${rotation.id}`}>
                        View Rotation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
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
              Ready to Start Your Clinical Training?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of international medical students gaining U.S. clinical 
              experience through our virtual rotation program.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?mode=signup">
                Enroll Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
    </main>
  );
};

export default Rotations;
