import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Building2,
  GraduationCap,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Student",
      description: "For individual IMG students beginning their U.S. medical journey",
      price: "$79",
      period: "/month",
      icon: GraduationCap,
      popular: false,
      features: [
        "ATLAS™ AI Professor access",
        "2 virtual rotations included",
        "Pre-clinical curriculum",
        "USMLE Step 1 question bank",
        "Progress tracking dashboard",
        "Email support",
      ],
      cta: "Start Free Trial",
      ctaLink: "/auth?mode=signup",
    },
    {
      name: "Professional",
      description: "For serious applicants preparing for U.S. residency matching",
      price: "$199",
      period: "/month",
      icon: Sparkles,
      popular: true,
      features: [
        "Everything in Student, plus:",
        "Unlimited virtual rotations",
        "Full clinical curriculum",
        "USMLE Step 2 CK prep",
        "Faculty evaluations & LORs",
        "Mock interview training",
        "Personal statement review",
        "Priority support",
      ],
      cta: "Start Free Trial",
      ctaLink: "/auth?mode=signup",
    },
    {
      name: "Institutional",
      description: "For medical schools and healthcare organizations",
      price: "Custom",
      period: "",
      icon: Building2,
      popular: false,
      features: [
        "Volume licensing discounts",
        "Admin dashboard & analytics",
        "Custom curriculum integration",
        "Faculty training programs",
        "LMS/SIS integration",
        "Dedicated success manager",
        "On-site training available",
        "Enterprise SLA",
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
    },
  ];

  const faqs = [
    {
      question: "Can I switch plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, both Student and Professional plans include a 14-day free trial with full access to all features.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for institutional accounts.",
    },
    {
      question: "Do you offer discounts for groups?",
      answer: "Yes! We offer special pricing for study groups and institutional partners. Contact us for details.",
    },
  ];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Invest in Your Medical Future
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose the plan that fits your goals. All plans include access to our 
              U.S.-standard curriculum and ATLAS™ AI Professor.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden ${
                  plan.popular 
                    ? 'border-accent shadow-glow-lg scale-105' 
                    : 'hover:shadow-livemed'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 gradient-livemed py-2 text-center">
                    <span className="text-white text-sm font-medium">Most Popular</span>
                  </div>
                )}
                <CardHeader className={plan.popular ? 'pt-14' : ''}>
                  <div className="w-12 h-12 rounded-xl gradient-livemed flex items-center justify-center mb-4">
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${plan.popular ? 'gradient-livemed' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={plan.ctaLink}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 p-8 glass-card rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-livemed flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Training 50+ Students?</h3>
                <p className="text-muted-foreground">
                  Get custom pricing and dedicated support for your institution.
                </p>
              </div>
            </div>
            <Button size="lg" className="gradient-livemed" asChild>
              <Link to="/contact">
                Talk to Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 gradient-livemed">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of international medical students preparing for 
            successful U.S. residency careers.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth?mode=signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Pricing;
