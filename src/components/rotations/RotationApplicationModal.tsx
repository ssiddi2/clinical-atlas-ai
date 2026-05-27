import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Loader2, FileText, Send } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotation: { id: string; title: string };
}

export default function RotationApplicationModal({ open, onOpenChange, rotation }: Props) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authed, setAuthed] = useState<string | null>(null);
  const { canAccessRotationExperience, loading: tierLoading } = useFeatureAccess(authed);

  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => setAuthed(data.user?.id ?? null));
    setReason("");
    setCv(null);
  }, [open]);

  useEffect(() => {
    if (!open || !authed || tierLoading) return;
    if (!canAccessRotationExperience) {
      toast({ title: "Clinical membership required", description: "Upgrade to Clinical to apply for rotations.", variant: "destructive" });
      onOpenChange(false);
    }
  }, [open, authed, tierLoading, canAccessRotationExperience, onOpenChange, toast]);

  const submit = async () => {
    if (!authed) {
      toast({ title: "Sign in required", description: "Please sign in to apply.", variant: "destructive" });
      return;
    }
    if (reason.trim().length < 50) {
      toast({ title: "Tell us more", description: "Please write at least 50 characters.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let cvUrl: string | null = null;
      if (cv) {
        const ext = cv.name.split(".").pop() || "pdf";
        const path = `${authed}/${rotation.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("rotation-applications")
          .upload(path, cv, { upsert: true });
        if (upErr) throw upErr;
        cvUrl = path;
      }

      const { error } = await supabase.from("rotation_enrollments").insert({
        session_id: rotation.id,
        user_id: authed,
        status: "pending",
        application_reason: reason,
        cv_url: cvUrl,
      });
      if (error) throw error;

      toast({ title: "Application submitted", description: "We'll notify you once reviewed." });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authed && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to apply</DialogTitle>
            <DialogDescription>You need an account to apply for virtual rotations.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild className="gradient-livemed">
              <Link to="/auth?mode=signup">Create account</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for {rotation.title}</DialogTitle>
          <DialogDescription>
            Tell the supervising attending why this rotation fits your goals. Applications are reviewed within 3 business days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">Why this rotation? <span className="text-destructive">*</span></Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Share your background, learning goals, and what you hope to take away from this rotation..."
              rows={6}
              maxLength={1500}
            />
            <p className="text-xs text-muted-foreground">{reason.length} / 1500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> CV / Transcript (optional, PDF)
            </Label>
            <Input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCv(e.target.files?.[0] ?? null)}
            />
            {cv && <p className="text-xs text-muted-foreground">Selected: {cv.name}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting} className="gradient-livemed">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
