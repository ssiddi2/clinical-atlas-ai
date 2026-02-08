import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Globe,
  GraduationCap,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";

const Institutions = () => {
  const benefits = [
    {
      icon: Globe,
      title: "U.S.-Standard Curriculum",
      description: "Fully aligned with USMLE, ACGME, and LCME standards, ensuring your graduates meet international benchmarks.",
    },
    {
      icon: TrendingUp,
      title: "Scalable AI Faculty",
      description: "ATLAS™ delivers consistent, high-quality instruction to every student without faculty burnout or quality variance.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track student performance, identify at-risk learners, and measure learning outcomes with comprehensive dashboards.",
    },
    {
      icon: Shield,
      title: "Government-Grade Security",
      description: "Enterprise security, data sovereignty options, and compliance with international education standards.",
    },
    {
      icon: Users,
      title: "Faculty Training",
      description: "Train your faculty to leverage AI tools and modern pedagogy with our professional development programs.",
    },
    {
      icon: Award,
      title: "Accreditation Support",
      description: "Our curriculum documentation helps support your accreditation applications and reviews.",
    },
  ];

  const useCases = [
    {
      title: "Medical Schools",
      description: "Supplement your existing curriculum with AI-powered tutoring, virtual rotations, and assessment tools.",
      features: ["Pre-clinical support", "Clinical skills training", "USMLE preparation"],
    },
    {
      title: "Ministries of Health",
      description: "Deploy national-scale medical education infrastructure to train physicians across your country.",
      features: ["Workforce analytics", "CME compliance", "Quality assurance"],
    },
    {
      title: "Teaching Hospitals",
      description: "Enhance residency training with standardized case-based learning and competency tracking.",
      features: ["Resident education", "Grand rounds", "Faculty development"],
    },
  ];

  const stats = [
    { value: "50+", label: "Partner Institutions" },
    { value: "15", label: "Countries" },
    { value: "10,000+", label: "Students Trained" },
    { value: "95%", label: "Satisfaction Rate" },
  ];

  return (
    <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 gradient-livemed" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="h-4 w-4" />
                For Institutions & Governments
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Transform Medical Education at Scale
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Partner with Livemed Academy to bring AI-powered, U.S.-standard 
                medical education to your students, residents, and physicians — 
                without the infrastructure overhead.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/contact">
                    Request a Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to="/case-studies">View Case Studies</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
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

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Institutions Choose Livemed Academy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide the technology, curriculum, and support to modernize 
                your medical education programs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="hover:shadow-livemed transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Solutions for Every Organization
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="h-full">
                  <CardHeader>
                    <CardTitle>{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {useCase.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Rapid Implementation, Long-Term Partnership
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our team works closely with your institution to ensure successful 
                  deployment and ongoing optimization of the Livemed Academy platform.
                </p>

                <div className="space-y-6">
                  {[
                    { step: "1", title: "Discovery", description: "We assess your needs and customize our solution" },
                    { step: "2", title: "Integration", description: "Seamless setup with your existing systems" },
                    { step: "3", title: "Training", description: "Faculty and staff training for maximum adoption" },
                    { step: "4", title: "Launch", description: "Phased rollout with dedicated support" },
                    { step: "5", title: "Optimization", description: "Ongoing analytics and improvement cycles" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="gradient-livemed text-white">
                <CardContent className="p-8">
                  <GraduationCap className="h-12 w-12 mb-6 opacity-80" />
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Transform Your Institution?
                  </h3>
                  <p className="text-white/80 mb-6">
                    Schedule a consultation with our partnerships team to discuss 
                    how Livemed Academy can support your medical education goals.
                  </p>
                  <Button size="lg" variant="secondary" className="w-full" asChild>
                    <Link to="/contact">
                      Schedule Consultation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            </div>
          </section>
    </main>
  );
};

export default Institutions;
