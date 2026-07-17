import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Phone, CheckCircle, Building2, GraduationCap, Headphones } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/LanguageContext";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", organization: "", role: "", inquiryType: "", message: "" });

  useEffect(() => {
    const type = searchParams.get("type");
    if (type) setFormData(prev => ({ ...prev, inquiryType: type }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        full_name: formData.name, email: formData.email, organization: formData.organization || null,
        role: formData.role || null, inquiry_type: formData.inquiryType, message: formData.message,
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast.success(t("contact.messageSent"));
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(t("contact.somethingWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const contactInfo = [
    { icon: Mail, title: t("contact.email"), value: "hello@livemed.edu", description: t("contact.forGeneral") },
    { icon: Phone, title: t("contact.phone"), value: "+1 (888) 555-0123", description: t("contact.monFri") },
    { icon: MapPin, title: t("contact.headquarters"), value: "Miami, Florida", description: t("contact.unitedStates") },
  ];

  const inquiryTypes = [
    { value: "demo", label: t("contact.requestDemo"), icon: Building2 },
    { value: "student", label: t("contact.studentInquiry"), icon: GraduationCap },
    { value: "partnership", label: t("contact.partnership"), icon: Building2 },
    { value: "support", label: t("contact.support"), icon: Headphones },
  ];

  if (isSubmitted) {
    return (
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto">
            <div className="lm-card-lg max-w-lg mx-auto text-center p-12">
              <div className="w-20 h-20 rounded-full tile-accent flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">{t("contact.messageReceived")}</h2>
              <p className="text-soft mb-8">{t("contact.thankYou")}</p>
              <Button onClick={() => { setIsSubmitted(false); setFormData({ name: "", email: "", organization: "", role: "", inquiryType: "", message: "" }); }} variant="outline">
                {t("contact.sendAnother")}
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="relative py-20 md:py-28 overflow-hidden bg-section-glow">
        <div className="absolute inset-0 gradient-livemed-light" />
        <div className="container mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="chip chip-brand mb-6">{t("nav.contact", "Contact")}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 mt-4">{t("contact.title")}</h1>
            <p className="text-lg text-soft">{t("contact.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">{t("contact.getInTouch")}</h2>
                <p className="text-soft">{t("contact.getInTouchDesc")}</p>
              </div>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.title} className="lm-card p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">{info.title}</h3>
                      <p className="text-sm font-medium text-foreground">{info.value}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cta-surface rounded-[24px] p-6 text-white">
                <h3 className="font-semibold mb-3 !text-white">{t("contact.lookingSpecific")}</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• <a href="/apply" className="hover:text-white underline">{t("contact.viewPricing")}</a></li>
                  <li>• <a href="/programs" className="hover:text-white underline">{t("contact.explorePrograms")}</a></li>
                  <li>• <a href="/institutions" className="hover:text-white underline">{t("contact.institutionalPartnerships")}</a></li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="lm-card-lg p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="font-display text-xl font-semibold mb-1">{t("contact.sendMessage")}</h3>
                  <p className="text-sm text-soft">{t("contact.sendMessageDesc")}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("contact.fullName")} *</Label>
                        <Input id="name" placeholder="Dr. Jane Smith" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("contact.emailAddress")} *</Label>
                        <Input id="email" type="email" placeholder="jane@example.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization">{t("contact.organization")}</Label>
                        <Input id="organization" placeholder={t("contact.orgPlaceholder")} value={formData.organization} onChange={(e) => handleInputChange("organization", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">{t("contact.yourRole")}</Label>
                        <Input id="role" placeholder={t("contact.rolePlaceholder")} value={formData.role} onChange={(e) => handleInputChange("role", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">{t("contact.helpWith")} *</Label>
                      <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange("inquiryType", value)} required>
                        <SelectTrigger><SelectValue placeholder={t("contact.selectInquiry")} /></SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("contact.message")} *</Label>
                      <Textarea id="message" placeholder={t("contact.messagePlaceholder")} rows={5} value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} required />
                    </div>
                    <Button type="submit" size="lg" className="w-full btn-brand" disabled={isSubmitting}>
                      {isSubmitting ? t("contact.sending") : t("contact.sendBtn")}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {t("contact.agreePrivacy")}{" "}
                      <a href="/privacy" className="underline hover:text-foreground">{t("auth.privacyPolicy")}</a>.
                    </p>
                  </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
