import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

interface Result {
  email: string;
  success: boolean;
  tempPassword?: string;
  error?: string;
  alreadyExists?: boolean;
}

export default function InviteStudentsModal({ open, onOpenChange, courseId, courseTitle }: Props) {
  const { toast } = useToast();
  const [emailsText, setEmailsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const parseStudents = () => {
    const lines = emailsText.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      // Support "email" or "email,first,last"
      const parts = line.split(/[,\t]/).map(p => p.trim());
      return {
        email: parts[0],
        firstName: parts[1] || undefined,
        lastName: parts[2] || undefined,
      };
    });
  };

  const handleInvite = async () => {
    const students = parseStudents();
    if (students.length === 0) {
      toast({ title: "Add at least one email", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResults(null);

    const { data, error } = await supabase.functions.invoke("physician-invite-students", {
      body: { courseId, students },
    });

    setLoading(false);

    if (error) {
      toast({ title: "Invite failed", description: error.message, variant: "destructive" });
      return;
    }

    setResults(data?.results || []);
    const s = data?.summary;
    toast({
      title: "Invites processed",
      description: `${s?.created || 0} created, ${s?.enrolled || 0} re-enrolled, ${s?.failed || 0} failed`,
    });
  };

  const copyAll = () => {
    if (!results) return;
    const text = results
      .filter(r => r.success && r.tempPassword)
      .map(r => `${r.email} | ${r.tempPassword}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied credentials to clipboard" });
  };

  const handleClose = () => {
    setEmailsText("");
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Invite Students
          </DialogTitle>
          <DialogDescription>
            Bulk-add students to <span className="font-medium text-foreground">{courseTitle}</span>. They'll be auto-approved and enrolled.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Student emails</Label>
              <Textarea
                rows={8}
                value={emailsText}
                onChange={e => setEmailsText(e.target.value)}
                placeholder={"student1@example.com\nstudent2@example.com, Jane, Doe\nstudent3@example.com"}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                One per line. Optional format: <code>email, first name, last name</code>. Max 100.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleInvite} disabled={loading} className="gradient-livemed">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Invite & Enroll
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Share the temporary passwords with each student. They can change it after first login.
              </p>
              {results.some(r => r.tempPassword) && (
                <Button size="sm" variant="outline" onClick={copyAll}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy all
                </Button>
              )}
            </div>
            <div className="border border-border/50 rounded-md divide-y divide-border/50 max-h-[400px] overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="p-3 flex items-start gap-3 text-sm">
                  {r.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{r.email}</div>
                    {r.tempPassword && (
                      <div className="font-mono text-xs text-muted-foreground mt-0.5">
                        Temp password: <span className="text-foreground">{r.tempPassword}</span>
                      </div>
                    )}
                    {r.alreadyExists && (
                      <div className="text-xs text-muted-foreground mt-0.5">Existing account — enrolled in course</div>
                    )}
                    {r.error && <div className="text-xs text-destructive mt-0.5">{r.error}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResults(null)}>Invite more</Button>
              <Button onClick={handleClose} className="gradient-livemed">Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
