import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, RefreshCw, XCircle, CheckCircle2, Ban, LogOut, ShieldCheck, Clock } from "lucide-react";

interface Props {
  courseId?: string;
  studentId?: string;
  limit?: number;
}

interface Row {
  id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
  course_id: string;
  student_id: string;
  actor_id: string | null;
  student?: { first_name: string | null; last_name: string | null } | null;
  actor?: { first_name: string | null; last_name: string | null } | null;
  course?: { title: string | null } | null;
}

const ACTION_META: Record<string, { icon: any; label: string; tone: string }> = {
  invited: { icon: UserPlus, label: "Invited", tone: "text-blue-600 bg-blue-50" },
  resent: { icon: RefreshCw, label: "Invitation resent", tone: "text-blue-600 bg-blue-50" },
  revoked: { icon: Ban, label: "Invitation revoked", tone: "text-amber-700 bg-amber-50" },
  accepted: { icon: CheckCircle2, label: "Accepted", tone: "text-green-700 bg-green-50" },
  declined: { icon: XCircle, label: "Declined", tone: "text-muted-foreground bg-muted" },
  approved: { icon: CheckCircle2, label: "Approved", tone: "text-green-700 bg-green-50" },
  rejected: { icon: XCircle, label: "Rejected", tone: "text-destructive bg-destructive/10" },
  enrolled_by_admin: { icon: ShieldCheck, label: "Enrolled by admin", tone: "text-primary bg-primary/10" },
  removed: { icon: LogOut, label: "Removed", tone: "text-muted-foreground bg-muted" },
};

const EnrollmentAuditLog = ({ courseId, studentId, limit = 100 }: Props) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    let q = supabase
      .from("enrollment_audit_log")
      .select("id, action, previous_status, new_status, created_at, course_id, student_id, actor_id")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (courseId) q = q.eq("course_id", courseId);
    if (studentId) q = q.eq("student_id", studentId);
    const { data } = await q;
    const base = (data as any[]) || [];
    if (base.length === 0) { setRows([]); setLoading(false); return; }

    const userIds = Array.from(new Set(base.flatMap((r: any) => [r.student_id, r.actor_id].filter(Boolean))));
    const courseIds = Array.from(new Set(base.map((r: any) => r.course_id)));
    const [profRes, courseRes] = await Promise.all([
      supabase.from("profiles").select("user_id, first_name, last_name").in("user_id", userIds),
      courseId ? Promise.resolve({ data: [] as any[] }) : supabase.from("courses").select("id, title").in("id", courseIds),
    ]);
    const profMap = new Map((profRes.data || []).map((p: any) => [p.user_id, p]));
    const courseMap = new Map(((courseRes as any).data || []).map((c: any) => [c.id, c]));
    setRows(base.map((r: any) => ({
      ...r,
      student: profMap.get(r.student_id) || null,
      actor: r.actor_id ? profMap.get(r.actor_id) || null : null,
      course: courseMap.get(r.course_id) || null,
    })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`audit-${courseId ?? "all"}-${studentId ?? "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "enrollment_audit_log" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, studentId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading activity…</p>;
  }
  if (rows.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {rows.map(r => {
        const meta = ACTION_META[r.action] || { icon: Clock, label: r.action, tone: "text-muted-foreground bg-muted" };
        const Icon = meta.icon;
        const studentName = [r.student?.first_name, r.student?.last_name].filter(Boolean).join(" ") || "Student";
        const actorName = [r.actor?.first_name, r.actor?.last_name].filter(Boolean).join(" ") || (r.actor_id ? "Instructor" : "System");
        return (
          <li key={r.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${meta.tone} shrink-0`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{meta.label}</span>
                <span className="text-muted-foreground"> · {studentName}</span>
                {!studentId && r.course?.title && (
                  <span className="text-muted-foreground"> in {r.course.title}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {actorName} · <time title={new Date(r.created_at).toLocaleString()}>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default EnrollmentAuditLog;