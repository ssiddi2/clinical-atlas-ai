import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Stethoscope, BookOpen, Brain, Video, Award, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import { useTranslation } from "@/i18n";

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", institution: "", country: "",
    yearOfStudy: "", targetSpecialty: "", programInterest: "", message: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({ title: t("apply.missingInfo"), description: t("apply.fillRequired"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email, organization: formData.institution,
        role: formData.yearOfStudy ? `Year ${formData.yearOfStudy} Student` : "Prospective Student",
        inquiry_type: "application",
        message: `Application\nCountry: ${formData.country || "N/A"}\nInstitution: ${formData.institution || "N/A"}\nYear: ${formData.yearOfStudy || "N/A"}\nSpecialty: ${formData.targetSpecialty || "N/A"}\nProgram: ${formData.programInterest || "N/A"}\n\n${formData.message || ""}`.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: t("apply.submitted"), description: t("apply.submittedDesc") });
    } catch (error) {
      toast({ title: t("apply.submissionFailed"), description: t("apply.submissionFailedDesc"), variant: "destructive" });
    } finally { setLoading(false); }
  };

  const learnerFeatures = [
    { icon: BookOpen, text: t("apply.learnerFeature1") },
    { icon: Brain, text: t("apply.learnerFeature2") },
    { icon: GraduationCap, text: t("apply.learnerFeature3") },
    { icon: Award, text: t("apply.learnerFeature4") },
  ];
  const clinicalFeatures = [
    { icon: Video, text: t("apply.clinicalFeature1") },
    { icon: Stethoscope, text: t("apply.clinicalFeature2") },
    { icon: Award, text: t("apply.clinicalFeature3") },
    { icon: GraduationCap, text: t("apply.clinicalFeature4") },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-livemed-deep flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
          <Card className="glass-card border-white/10 text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-6 shadow-glow">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">{t("apply.applicationReceived")}</h1>
              <p className="text-white/60 mb-8">{t("apply.thankYou")}</p>
              <div className="flex flex-col gap-3">
                <Button className="w-full gradient-livemed" asChild><Link to="/">{t("apply.returnHome")}</Link></Button>
                <Button variant="ghost" className="w-full text-white/60 hover:text-white" asChild><Link to="/contact">{t("apply.contactSupport")}</Link></Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-livemed-deep">
      <header className="fixed top-0 left-0 right-0 z-50 bg-livemed-deep/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/"><img src={livemedLogo} alt="Livemed Academy logo" className="h-10 object-contain" /></Link>
          <Button variant="ghost" className="text-white/60 hover:text-white" asChild>
            <Link to="/auth">{t("auth.alreadyHaveAccount")}</Link>
          </Button>
        </div>
      </header>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t("apply.title")} <span className="text-gradient-livemed">{t("apply.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">{t("apply.subtitle")}</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
                    <div>
                      <CardTitle className="text-white text-lg">{t("apply.learnerAccess")}</CardTitle>
                      <CardDescription className="text-white/40">{t("apply.selfStudy")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {learnerFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-3"><f.icon className="w-4 h-4 text-livemed-cyan" /><span className="text-white/70 text-sm">{f.text}</span></div>
                  ))}
                  <p className="text-xs text-white/40 pt-2 border-t border-white/10 mt-4">{t("apply.availableAfterApproval")}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-livemed-cyan/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-livemed-cyan text-black text-xs font-semibold px-3 py-1 rounded-bl-lg">{t("apply.fullAccess")}</div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl gradient-livemed flex items-center justify-center shadow-glow"><Stethoscope className="w-5 h-5 text-white" /></div>
                    <div>
                      <CardTitle className="text-white text-lg">{t("apply.clinicalAccess")}</CardTitle>
                      <CardDescription className="text-white/40">{t("apply.vettedStudents")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/60 text-sm mb-4">{t("apply.everythingInLearner")}</p>
                  {clinicalFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-3"><f.icon className="w-4 h-4 text-livemed-cyan" /><span className="text-white/70 text-sm">{f.text}</span></div>
                  ))}
                  <p className="text-xs text-white/40 pt-2 border-t border-white/10 mt-4">{t("apply.requiresVerification")}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">{t("apply.applicationForm")}</CardTitle>
                  <CardDescription className="text-white/50">{t("apply.applicationFormDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/70">{t("apply.firstName")} *</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/70">{t("apply.lastName")} *</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/70">{t("apply.emailAddress")} *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-white/70">{t("apply.country")}</Label>
                        <Input id="country" name="country" value={formData.country} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="institution" className="text-white/70">{t("apply.medicalSchool")}</Label>
                        <Input id="institution" name="institution" value={formData.institution} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearOfStudy" className="text-white/70">{t("apply.yearOfStudy")}</Label>
                        <Select value={formData.yearOfStudy} onValueChange={(v) => setFormData({ ...formData, yearOfStudy: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder={t("apply.selectYear")} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">{t("apply.year1")}</SelectItem>
                            <SelectItem value="2">{t("apply.year2")}</SelectItem>
                            <SelectItem value="3">{t("apply.year3")}</SelectItem>
                            <SelectItem value="4">{t("apply.year4")}</SelectItem>
                            <SelectItem value="graduate">{t("apply.graduate")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="programInterest" className="text-white/70">{t("apply.programInterest")}</Label>
                        <Select value={formData.programInterest} onValueChange={(v) => setFormData({ ...formData, programInterest: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder={t("apply.selectProgram")} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pre-clinical">{t("apply.preClinicalTrack")}</SelectItem>
                            <SelectItem value="clinical">{t("apply.clinicalTrack")}</SelectItem>
                            <SelectItem value="residency">{t("apply.residencyPrep")}</SelectItem>
                            <SelectItem value="cme">{t("apply.cmePhysicians")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetSpecialty" className="text-white/70">{t("apply.targetSpecialty")}</Label>
                      <Input id="targetSpecialty" name="targetSpecialty" value={formData.targetSpecialty} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white/70">{t("apply.whyJoin")}</Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder={t("apply.whyJoinPlaceholder")} rows={4} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none" />
                    </div>
                    <Button type="submit" className="w-full gradient-livemed btn-glow py-6" disabled={loading}>
                      {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("apply.submitting")}</>) : (<>{t("apply.submitApplication")}<ArrowRight className="w-4 h-4 ml-2" /></>)}
                    </Button>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 mt-2">
                      <p className="text-xs text-white/50 leading-relaxed">
                        <span className="font-semibold text-white/70">{t("apply.clinicalTransparency")}</span>{" "}
                        {t("apply.clinicalTransparencyDesc")}
                      </p>
                    </div>
                    <p className="text-xs text-white/40 text-center">
                      {t("apply.agreeTerms")}{" "}
                      <Link to="/terms" className="text-livemed-cyan hover:underline">{t("auth.termsOfService")}</Link>
                      {" "}{t("auth.and")}{" "}
                      <Link to="/privacy" className="text-livemed-cyan hover:underline">{t("auth.privacyPolicy")}</Link>
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
