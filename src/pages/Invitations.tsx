import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, XCircle, Mail, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EnrollmentAuditLog from "@/components/courses/EnrollmentAuditLog";

interface Invite {
  id: string;
  course_id: string;
  enrolled_at: string;
  status: string;
  course: { id: string; title: string; description: string | null; instructor_id: string } | null;
  instructor?: { first_name: string | null; last_name: string | null } | null;
}

const Invitations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async (uid: string) => {
    const { data } = await supabase
      .from("course_enrollments")
      .select("id, course_id, enrolled_at, status, course:courses(id, title, description, instructor_id)")
      .eq("student_id", uid)
      .eq("status", "invited")
      .order("enrolled_at", { ascending: false });
    const rows = (data as any[]) || [];
    const instructorIds = Array.from(new Set(rows.map(r => r.course?.instructor_id).filter(Boolean)));
    let profMap = new Map<string, any>();
    if (instructorIds.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, first_name, last_name").in("user_id", instructorIds);
      profMap = new Map((profs || []).map((p: any) => [p.user_id, p]));
    }
    setInvites(rows.map(r => ({ ...r, instructor: r.course?.instructor_id ? profMap.get(r.course.instructor_id) : null })));
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth?next=/invitations"); return; }
      if (!mounted) return;
      setUserId(session.user.id);
      await load(session.user.id);

      const channel = supabase
        .channel(`invites-${session.user.id}`)
        .on("postgres_changes", {
          event: "*", schema: "public", table: "course_enrollments",
          filter: `student_id=eq.${session.user.id}`,
        }, () => load(session.user.id))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const respond = async (invite: Invite, accept: boolean) => {
    setBusy(invite.id);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update(accept
          ? { status: "approved", approved_at: new Date().toISOString() }
          : { status: "declined" })
        .eq("id", invite.id);
      if (error) throw error;
      toast({
        title: accept ? "Invitation accepted" : "Invitation declined",
        description: accept ? `You're now enrolled in ${invite.course?.title}.` : "The instructor has been notified.",
      });
      if (accept && invite.course_id) navigate(`/courses/${invite.course_id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Course invitations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Instructors who invite you to their courses appear here. Accept to unlock lectures, materials, and quizzes.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : invites.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Mail className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground">No pending invitations</p>
              <p className="text-sm text-muted-foreground mt-1">You'll see new course invitations here as they arrive.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/courses")}>Browse courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invites.map(inv => {
              const instructorName = [inv.instructor?.first_name, inv.instructor?.last_name].filter(Boolean).join(" ");
              return (
                <Card key={inv.id} className="border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{inv.course?.title}</CardTitle>
                        {instructorName && (
                          <p className="text-sm text-muted-foreground mt-0.5">Invited by {instructorName}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(inv.enrolled_at), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {inv.course?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{inv.course.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" disabled={busy === inv.id} onClick={() => respond(inv, true)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === inv.id} onClick={() => respond(inv, false)}>
                        <XCircle className="h-4 w-4 mr-1" /> Decline
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/courses/${inv.course_id}?invite=1`)}>
                        Preview course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {userId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent invitation activity</CardTitle>
            </CardHeader>
            <CardContent>
              <EnrollmentAuditLog studentId={userId} limit={30} />
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
};

export default Invitations;