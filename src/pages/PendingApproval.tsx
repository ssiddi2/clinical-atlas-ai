import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, Mail } from "lucide-react";

import { useTranslation } from "@/i18n";
import livemedLogoAsset from "@/assets/livemed-logo-light.png.asset.json";
const livemedLogoFull = livemedLogoAsset.url;

const PendingApproval = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: profile } = await supabase.from("profiles").select("account_status, first_name").eq("user_id", session.user.id).single();
      if (profile?.account_status === "approved") { navigate("/dashboard"); return; }
      if (profile?.first_name) setFirstName(profile.first_name);
      setLoading(false);
    };
    checkStatus();

    const channel = supabase.channel("profile-status").on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => {
      if (payload.new.account_status === "approved") navigate("/onboarding");
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [navigate]);

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse"><Clock className="h-8 w-8 text-muted-foreground" /></div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/"><img src={livemedLogoFull} alt="Livemed Academy" style={{ height: '60px', width: 'auto' }} className="object-contain" /></Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" />{t("common.signOut", "Sign Out")}</Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-border/30 shadow-lg">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Clock className="h-8 w-8 text-primary" /></div>
            <CardTitle className="text-2xl">{firstName ? t("pending.welcome").replace("{name}", firstName) : t("pending.title")}</CardTitle>
            <CardDescription className="text-base">{t("pending.underReview")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{t("pending.thankYou")}</p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">{t("pending.usuallyTakes")} <span className="font-medium text-foreground">{t("pending.businessDays")}</span>. {t("pending.emailNotification")}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">{t("pending.questions")}</p>
              <a href="mailto:info@livemedhealth.com" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"><Mail className="h-4 w-4" />info@livemedhealth.com</a>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Livemed Academy.</div>
      </footer>
    </div>
  );
};

export default PendingApproval;
