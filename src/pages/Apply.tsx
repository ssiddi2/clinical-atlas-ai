import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  Stethoscope,
  BookOpen,
  Brain,
  Video,
  Award,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    country: "",
    yearOfStudy: "",
    targetSpecialty: "",
    programInterest: "",
    message: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        organization: formData.institution,
        role: formData.yearOfStudy ? `Year ${formData.yearOfStudy} Student` : "Prospective Student",
        inquiry_type: "application",
        message: `
Application for Livemed Academy

Country: ${formData.country || "Not specified"}
Institution: ${formData.institution || "Not specified"}
Year of Study: ${formData.yearOfStudy || "Not specified"}
Target Specialty: ${formData.targetSpecialty || "Not specified"}
Program Interest: ${formData.programInterest || "Not specified"}

Message:
${formData.message || "No additional message provided."}
        `.trim(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const learnerFeatures = [
    { icon: BookOpen, text: "Complete USMLE-aligned curriculum" },
    { icon: Brain, text: "ATLAS™ AI tutoring (limited)" },
    { icon: GraduationCap, text: "Practice assessments & QBank" },
    { icon: Award, text: "MATCH Ready™ performance tracking" },
  ];

  const clinicalFeatures = [
    { icon: Video, text: "Live Virtual Rounds with US physicians" },
    { icon: Stethoscope, text: "Virtual rotation experiences" },
    { icon: Award, text: "Letters of recommendation support" },
    { icon: GraduationCap, text: "Full residency readiness program" },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-livemed-deep flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Card className="glass-card border-white/10 text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-6 shadow-glow">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Application Received!</h1>
              <p className="text-white/60 mb-8">
                Thank you for your interest in Livemed Academy. Our admissions team will review 
                your application and contact you within 2-3 business days.
              </p>
              <div className="flex flex-col gap-3">
                <Button className="w-full gradient-livemed" asChild>
                  <Link to="/">Return to Homepage</Link>
                </Button>
                <Button variant="ghost" className="w-full text-white/60 hover:text-white" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-livemed-deep">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-livemed-deep/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link to="/">
            <img src={livemedLogo} alt="Livemed" className="h-10 object-contain" />
          </Link>
          <Button variant="ghost" className="text-white/60 hover:text-white" asChild>
            <Link to="/auth">Already have an account? Sign In</Link>
          </Button>
        </div>
      </header>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Apply to <span className="text-gradient-livemed">Livemed Academy</span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Join thousands of medical students training with AI-powered education and 
              U.S. clinical experiences.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Access Tiers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Learner Tier */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">Learner Access</CardTitle>
                      <CardDescription className="text-white/40">Self-study & assessments</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {learnerFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <feature.icon className="w-4 h-4 text-livemed-cyan" />
                      <span className="text-white/70 text-sm">{feature.text}</span>
                    </div>
                  ))}
                  <p className="text-xs text-white/40 pt-2 border-t border-white/10 mt-4">
                    Available after account approval
                  </p>
                </CardContent>
              </Card>

              {/* Clinical Tier */}
              <Card className="glass-card border-livemed-cyan/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-livemed-cyan text-black text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Full Access
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl gradient-livemed flex items-center justify-center shadow-glow">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">Clinical Access</CardTitle>
                      <CardDescription className="text-white/40">Vetted students only</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/60 text-sm mb-4">
                    Everything in Learner, plus:
                  </p>
                  {clinicalFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <feature.icon className="w-4 h-4 text-livemed-cyan" />
                      <span className="text-white/70 text-sm">{feature.text}</span>
                    </div>
                  ))}
                  <p className="text-xs text-white/40 pt-2 border-t border-white/10 mt-4">
                    Requires document verification
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Application Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Application Form</CardTitle>
                  <CardDescription className="text-white/50">
                    Tell us about yourself. All applicants start with Learner access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/70">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/70">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/70">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@medschool.edu"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-white/70">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="India"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="institution" className="text-white/70">Medical School</Label>
                        <Input
                          id="institution"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          placeholder="ABC Medical College"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearOfStudy" className="text-white/70">Year of Study</Label>
                        <Select
                          value={formData.yearOfStudy}
                          onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Year 1 (Pre-clinical)</SelectItem>
                            <SelectItem value="2">Year 2 (Pre-clinical)</SelectItem>
                            <SelectItem value="3">Year 3 (Clinical)</SelectItem>
                            <SelectItem value="4">Year 4 (Clinical)</SelectItem>
                            <SelectItem value="graduate">Graduate / IMG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="programInterest" className="text-white/70">Program Interest</Label>
                        <Select
                          value={formData.programInterest}
                          onValueChange={(value) => setFormData({ ...formData, programInterest: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pre-clinical">Pre-Clinical Track</SelectItem>
                            <SelectItem value="clinical">Clinical Track</SelectItem>
                            <SelectItem value="residency">Residency Prep</SelectItem>
                            <SelectItem value="cme">CME / Physicians</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetSpecialty" className="text-white/70">Target Specialty (optional)</Label>
                      <Input
                        id="targetSpecialty"
                        name="targetSpecialty"
                        value={formData.targetSpecialty}
                        onChange={handleInputChange}
                        placeholder="e.g., Internal Medicine, Pediatrics"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white/70">Why do you want to join Livemed?</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your goals and how Livemed can help..."
                        rows={4}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-livemed btn-glow py-6"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-white/40 text-center">
                      By applying, you agree to our{" "}
                      <Link to="/terms" className="text-livemed-cyan hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link to="/privacy" className="text-livemed-cyan hover:underline">Privacy Policy</Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;
