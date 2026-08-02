import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, FileText, GraduationCap, ShieldCheck } from "lucide-react";

interface AppRow {
  id: string;
  user_id: string;
  session_id: string;
  status: string;
  application_reason: string | null;
  cv_url: string | null;
  transcript_url: string | null;
  credential_verified: boolean;
  credential_verified_at: string | null;
  enrolled_at: string;
  reviewer_notes: string | null;
  profile?: { first_name: string | null; last_name: string | null; avatar_url: string | null; institution: string | null; country: string | null };
  session?: { title: string; physician_name: string };
}

export default function RotationApplications() {
  const { toast } = useToast();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: enrollments } = await supabase
      .from("rotation_enrollments")
      .select("*")
      .order("enrolled_at", { ascending: false });

    if (!enrollments) {
      setApps([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    const sessionIds = [...new Set(enrollments.map(e => e.session_id))];

    const [profilesRes, sessionsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, first_name, last_name, avatar_url, institution, country").in("user_id", userIds),
      supabase.from("rotation_sessions").select("id, title, physician_name").in("id", sessionIds),
    ]);

    const enriched: AppRow[] = enrollments.map(e => ({
      ...e,
      profile: profilesRes.data?.find(p => p.user_id === e.user_id),
      session: sessionsRes.data?.find(s => s.id === e.session_id),
    }));
    setApps(enriched);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const decide = async (app: AppRow, status: "approved" | "rejected") => {
    setActing(app.id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("rotation_enrollments")
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes[app.id] || null,
      })
      .eq("id", app.id);

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("notifications").insert({
        user_id: app.user_id,
        title: status === "approved" ? "Rotation application approved" : "Rotation application update",
        message: status === "approved"
          ? `You're in! Your application for ${app.session?.title} was approved.`
          : `Your application for ${app.session?.title} was not accepted this round.`,
        type: status === "approved" ? "success" : "info",
        link: "/rotations",
      });
      toast({ title: `Application ${status}` });
      await load();
    }
    setActing(null);
  };

  const verifyCredential = async (app: AppRow) => {
    setActing(app.id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("rotation_enrollments")
      .update({
        credential_verified: true,
        credential_verified_by: user?.id,
        credential_verified_at: new Date().toISOString(),
      })
      .eq("id", app.id);

    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Credential verified" });
      await load();
    }
    setActing(null);
  };

  const openDocument = async (path: string) => {
    const { data, error } = await supabase.storage.from("rotation-applications").createSignedUrl(path, 60);
    if (error || !data) {
      toast({ title: "Could not generate download link", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (apps.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No rotation applications yet.</p>;
  }

  const pending = apps.filter(a => a.status === "pending");
  const reviewed = apps.filter(a => a.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Pending ({pending.length})</h3>
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending applications.</p>}
          {pending.map(app => (
            <Card key={app.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {app.profile?.avatar_url && <AvatarImage src={app.profile.avatar_url} />}
                    <AvatarFallback>{app.profile?.first_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{app.profile?.first_name} {app.profile?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{app.profile?.institution} · {app.profile?.country}</p>
                    <p className="text-sm mt-1">Applied to: <span className="font-medium">{app.session?.title}</span> with {app.session?.physician_name}</p>
                  </div>
                  <Badge variant={app.credential_verified ? "default" : "outline"} className="whitespace-nowrap">
                    {app.credential_verified ? "Credential verified" : "Awaiting verification"}
                  </Badge>
                </div>

                {app.application_reason && (
                  <div className="text-sm bg-muted/50 rounded-lg p-3">{app.application_reason}</div>
                )}

                <div className="flex flex-wrap gap-2">
                  {app.transcript_url ? (
                    <Button size="sm" variant="outline" onClick={() => openDocument(app.transcript_url!)}>
                      <GraduationCap className="h-3.5 w-3.5 mr-1.5" /> View transcript
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground self-center">No transcript on file</span>
                  )}
                  {app.cv_url && (
                    <Button size="sm" variant="outline" onClick={() => openDocument(app.cv_url!)}>
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> View CV
                    </Button>
                  )}
                  {!app.credential_verified && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => verifyCredential(app)}
                      disabled={acting === app.id || !app.transcript_url}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Verify transcript / credential
                    </Button>
                  )}
                </div>

                <Textarea
                  placeholder="Reviewer notes (optional)"
                  value={notes[app.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                  rows={2}
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => decide(app, "approved")}
                    disabled={acting === app.id || !app.credential_verified}
                    title={app.credential_verified ? undefined : "Verify the applicant's credential before approving"}
                    className="gradient-livemed"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => decide(app, "rejected")} disabled={acting === app.id}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </div>
                {!app.credential_verified && (
                  <p className="text-xs text-muted-foreground">
                    Approval unlocks once the medical school transcript is verified.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {reviewed.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Reviewed ({reviewed.length})</h3>
          <div className="space-y-2">
            {reviewed.map(app => (
              <Card key={app.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {app.profile?.avatar_url && <AvatarImage src={app.profile.avatar_url} />}
                    <AvatarFallback>{app.profile?.first_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{app.profile?.first_name} {app.profile?.last_name} → {app.session?.title}</p>
                  </div>
                  <Badge variant={app.status === "approved" ? "default" : "destructive"}>{app.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
