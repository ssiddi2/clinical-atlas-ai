import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, GraduationCap, Stethoscope } from "lucide-react";


import { useTranslation } from "@/i18n/LanguageContext";
import livemedLogoAsset from "@/assets/livemed-logo-light.png.asset.json";
const livemedLogoFull = livemedLogoAsset.url;
const livemedLogoIcon = livemedLogoAsset.url;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupRole, setSignupRole] = useState<"student" | "physician">("student");

  useEffect(() => {
    let redirecting = false;

    const handleAuthRedirect = async (session: any) => {
      if (!session || redirecting) return;
      redirecting = true;

      // Honor `next` param (used by MCP OAuth consent flow, invite links, etc.)
      const nextParam = searchParams.get("next");
      if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
        navigate(nextParam, { replace: true });
        return;
      }

      // Parallelize profile + roles fetch
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("onboarding_completed, account_status")
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id),
      ]);

      const isPhysician = roles?.some((r: any) => r.role === "physician" || r.role === "faculty");
      const isAdmin = roles?.some((r: any) => r.role === "platform_admin");

      if (!isPhysician && !isAdmin && profile?.account_status === "pending_approval") {
        navigate("/pending-approval", { replace: true });
        return;
      }
      if (profile?.account_status === "suspended") {
        toast({ title: t("auth.accountSuspended"), description: t("auth.accountSuspendedDesc"), variant: "destructive" });
        await supabase.auth.signOut();
        redirecting = false;
        return;
      }

      if (isAdmin) navigate("/admin", { replace: true });
      else if (isPhysician) navigate("/physician-dashboard", { replace: true });
      else if (profile?.onboarding_completed) navigate("/dashboard", { replace: true });
      else navigate("/onboarding", { replace: true });
    };

    // Register listener first — never await inside the callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setTimeout(() => { handleAuthRedirect(session); }, 0);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleAuthRedirect(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, t, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: t("auth.signInFailed"), description: error.message, variant: "destructive" });
      }
    } catch {
      toast({ title: t("common.error"), description: t("auth.unexpectedError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { first_name: firstName, last_name: lastName, signup_role: signupRole },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: t("auth.accountExists"), description: t("auth.accountExistsDesc"), variant: "destructive" });
          setMode("signin");
        } else {
          toast({ title: t("auth.signUpFailed"), description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: t("auth.welcomeToLivemed"), description: t("auth.checkEmail") });
      }
    } catch {
      toast({ title: t("common.error"), description: t("auth.unexpectedError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-livemed-navy p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-livemed-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12 text-sm">
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToHome")}
          </Link>
          <img src={livemedLogoFull} alt="Livemed Academy" style={{ height: '140px', width: 'auto' }} className="logo-glow object-contain" />
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold text-white mb-6 leading-tight">{t("auth.futureOfMedEd")}</h1>
          <p className="text-lg text-white/60 leading-relaxed">{t("auth.joinThousands")}</p>
        </div>
        <div className="relative z-10 text-sm text-white/40">© {new Date().getFullYear()} Livemed Academy</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <Link to="/"><img src={livemedLogoIcon} alt="Livemed Academy" style={{ height: '140px', width: 'auto' }} className="mx-auto logo-glow object-contain" /></Link>
          </div>

          <Card className="border-border/30 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-semibold">
                {mode === "signin" ? t("auth.welcomeBack") : t("auth.createAccount")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {mode === "signin" ? t("auth.signInContinue") : t("auth.startJourney")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
                  <TabsTrigger value="signin" className="text-sm">{t("auth.signIn")}</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm">{t("auth.signUp")}</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm">{t("auth.email")}</Label>
                      <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-background border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm">{t("auth.password")}</Label>
                      <div className="relative">
                        <Input id="signin-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-background border-border/50 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 gradient-livemed rounded-lg font-medium" disabled={loading}>
                      {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.signingIn")}</>) : t("auth.signIn")}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    {/* Role Selector */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{t("auth.iAmA")}</Label>
                      <RadioGroup value={signupRole} onValueChange={(v) => setSignupRole(v as "student" | "physician")} className="grid grid-cols-2 gap-3">
                        <Label
                          htmlFor="role-student"
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            signupRole === "student"
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <RadioGroupItem value="student" id="role-student" className="sr-only" />
                          <GraduationCap className={`h-6 w-6 ${signupRole === "student" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${signupRole === "student" ? "text-primary" : "text-muted-foreground"}`}>
                            {t("auth.medicalStudent")}
                          </span>
                        </Label>
                        <Label
                          htmlFor="role-physician"
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            signupRole === "physician"
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <RadioGroupItem value="physician" id="role-physician" className="sr-only" />
                          <Stethoscope className={`h-6 w-6 ${signupRole === "physician" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${signupRole === "physician" ? "text-primary" : "text-muted-foreground"}`}>
                            {t("auth.teachingAttending")}
                          </span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name" className="text-sm">{t("auth.firstName")}</Label>
                        <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11 bg-background border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name" className="text-sm">{t("auth.lastName")}</Label>
                        <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11 bg-background border-border/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm">{t("auth.email")}</Label>
                      <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-background border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm">{t("auth.password")}</Label>
                      <div className="relative">
                        <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="h-11 bg-background border-border/50 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("auth.atLeast6Chars")}</p>
                    </div>
                    <Button type="submit" className="w-full h-11 gradient-livemed rounded-lg font-medium" disabled={loading}>
                      {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.creatingAccount")}</>) : t("auth.createAccountBtn")}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {t("auth.agreeTerms")}{" "}
                      <Link to="/terms" className="text-foreground hover:underline">{t("auth.termsOfService")}</Link>{" "}
                      {t("auth.and")}{" "}
                      <Link to="/privacy" className="text-foreground hover:underline">{t("auth.privacyPolicy")}</Link>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="lg:hidden mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← {t("auth.backToHome")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
