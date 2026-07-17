import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, User as UserIcon, Lock, CreditCard, LogOut } from "lucide-react";

import { useTranslation } from "@/i18n";
import AvatarUpload from "@/components/profile/AvatarUpload";
import AppShell from "@/components/layout/AppShell";

interface ProfileData {
  first_name: string; last_name: string; institution: string; country: string;
  year_of_study: number | null; program_level: string | null; avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "", last_name: "", institution: "", country: "", year_of_study: null, program_level: null, avatar_url: null,
  });

  useEffect(() => {
    let mounted = true;
    // Check session first so we don't bounce to /auth on a transient null from
    // the initial onAuthStateChange event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (_event === "SIGNED_OUT") navigate("/auth");
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  useEffect(() => { if (user) loadProfile(); }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("profiles").select("first_name, last_name, institution, country, year_of_study, program_level, avatar_url").eq("user_id", user.id).single();
    if (data) setProfile({ first_name: data.first_name || "", last_name: data.last_name || "", institution: data.institution || "", country: data.country || "", year_of_study: data.year_of_study, program_level: data.program_level, avatar_url: data.avatar_url });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: profile.first_name, last_name: profile.last_name, institution: profile.institution,
      country: profile.country, year_of_study: profile.year_of_study,
      program_level: profile.program_level as any,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: t("common.error"), description: t("profile.updateError"), variant: "destructive" }); }
    else {
      await supabase.auth.updateUser({ data: { first_name: profile.first_name, last_name: profile.last_name } });
      toast({ title: t("common.success"), description: t("profile.updateSuccess") });
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: t("common.error"), description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPwd(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else { setNewPassword(""); toast({ title: t("common.success"), description: "Password updated" }); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">{t("common.loading")}</div></div>;

  const countries = ["United States", "Canada", "United Kingdom", "India", "Nigeria", "Pakistan", "Philippines", "Egypt", "Mexico", "Brazil", "Other"];
  const programLevels = [
    { value: "pre_clinical", label: "Pre-Clinical (MS1-MS2)" },
    { value: "clinical", label: "Clinical (MS3-MS4)" },
    { value: "residency_prep", label: "Residency Prep / IMG" },
    { value: "cme", label: "CME / Practicing Physician" },
  ];

  return (
    <AppShell>
      <main className="container mx-auto py-8 max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          {user && (
            <AvatarUpload
              userId={user.id}
              currentUrl={profile.avatar_url}
              fallbackText={profile.first_name || user.email}
              size="lg"
              onUploaded={(url) => setProfile({ ...profile, avatar_url: url })}
            />
          )}
          <h2 className="text-xl font-semibold mt-4">{profile.first_name} {profile.last_name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <h1 className="sr-only">Settings</h1>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account"><UserIcon className="h-4 w-4 mr-2" />Account</TabsTrigger>
            <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="membership"><CreditCard className="h-4 w-4 mr-2" />Membership</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-accent" />Personal Information</CardTitle>
            <CardDescription>Update your name, institution, and training details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="first_name">First Name</Label><Input id="first_name" value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="institution">Institution</Label><Input id="institution" value={profile.institution} onChange={(e) => setProfile({ ...profile, institution: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={profile.country} onValueChange={(v) => setProfile({ ...profile, country: v })}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_of_study">Year of Study</Label>
                <Select value={profile.year_of_study?.toString() || ""} onValueChange={(v) => setProfile({ ...profile, year_of_study: parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5,6].map((y) => <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="program_level">Program Level</Label>
              <Select value={profile.program_level || ""} onValueChange={(v) => setProfile({ ...profile, program_level: v })}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>{programLevels.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gradient-livemed">
              <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-accent" />Change Password</CardTitle>
                <CardDescription>Update your account password. Use at least 8 characters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button onClick={handleChangePassword} disabled={changingPwd || !newPassword} className="w-full">
                  {changingPwd ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Sign Out</CardTitle><CardDescription>End your session on this device.</CardDescription></CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div><p className="font-medium">Email</p><p className="text-sm text-muted-foreground">{user?.email}</p></div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div><p className="font-medium">Member Since</p><p className="text-sm text-muted-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p></div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div><p className="font-medium">Subscription</p><p className="text-sm text-muted-foreground">Free Trial</p></div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/apply")}>Upgrade</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </AppShell>
  );
};

export default Profile;
