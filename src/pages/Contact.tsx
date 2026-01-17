import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MapPin,
  Phone,
  CheckCircle,
  Building2,
  GraduationCap,
  Headphones,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    inquiryType: "",
    message: "",
  });

  // Pre-fill inquiry type from URL param
  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setFormData(prev => ({ ...prev, inquiryType: type }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        full_name: formData.name,
        email: formData.email,
        organization: formData.organization || null,
        role: formData.role || null,
        inquiry_type: formData.inquiryType,
        message: formData.message,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Your message has been sent! We'll be in touch within 24 hours.");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@livemed.edu",
      description: "For general inquiries",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (888) 555-0123",
      description: "Mon-Fri, 9AM-6PM EST",
    },
    {
      icon: MapPin,
      title: "Headquarters",
      value: "Miami, Florida",
      description: "United States",
    },
  ];

  const inquiryTypes = [
    { value: "demo", label: "Request a Demo", icon: Building2 },
    { value: "student", label: "Student Inquiry", icon: GraduationCap },
    { value: "partnership", label: "Partnership Opportunity", icon: Building2 },
    { value: "support", label: "Technical Support", icon: Headphones },
  ];

  if (isSubmitted) {
    return (
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="p-12">
                <div className="w-20 h-20 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Message Received!</h2>
                <p className="text-muted-foreground mb-8">
                  Thank you for reaching out. Our team will review your inquiry and 
                  respond within 24 business hours.
                </p>
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      organization: "",
                      role: "",
                      inquiryType: "",
                      message: "",
                    });
                  }}
                  variant="outline"
                >
                  Send Another Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Let's Start a Conversation
            </h1>
            <p className="text-lg text-muted-foreground">
              Whether you're an individual student or representing an institution, 
              we're here to help you transform medical education.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Have questions about our programs? Want to schedule a demo? 
                  We'd love to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <Card key={info.title}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium">{info.title}</h3>
                        <p className="text-sm font-medium text-foreground">{info.value}</p>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Links */}
              <Card className="gradient-livemed text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Looking for something specific?</h3>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• <a href="/pricing" className="hover:text-white underline">View pricing plans</a></li>
                    <li>• <a href="/programs" className="hover:text-white underline">Explore our programs</a></li>
                    <li>• <a href="/institutions" className="hover:text-white underline">Institutional partnerships</a></li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Dr. Jane Smith"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jane@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          placeholder="University / Hospital / Self"
                          value={formData.organization}
                          onChange={(e) => handleInputChange("organization", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Your Role</Label>
                        <Input
                          id="role"
                          placeholder="Student / Faculty / Administrator"
                          value={formData.role}
                          onChange={(e) => handleInputChange("role", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">What can we help you with? *</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) => handleInputChange("inquiryType", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your needs, questions, or how we can help..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-livemed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
