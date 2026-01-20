import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, User, Mail, Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type StudentDocument = Database["public"]["Tables"]["student_documents"]["Row"];

interface PendingApprovalsProps {
  profiles: (Profile & { documents: StudentDocument[] })[];
  onRefresh: () => Promise<void>;
}

const PendingApprovals = ({ profiles, onRefresh }: PendingApprovalsProps) => {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (userId: string, firstName: string) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "approved" })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Account Approved",
        description: `${firstName}'s account has been approved. They can now access the platform.`,
      });

      await onRefresh();
    } catch (error) {
      console.error("Error approving account:", error);
      toast({
        title: "Error",
        description: "Failed to approve account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, firstName: string) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "suspended" })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Account Suspended",
        description: `${firstName}'s account has been suspended.`,
      });

      await onRefresh();
    } catch (error) {
      console.error("Error suspending account:", error);
      toast({
        title: "Error",
        description: "Failed to suspend account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No pending account approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-background"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {profile.first_name} {profile.last_name}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{profile.institution || "No institution"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Signed up: {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleReject(profile.user_id, profile.first_name || "User")}
              disabled={processingId === profile.user_id}
            >
              {processingId === profile.user_id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleApprove(profile.user_id, profile.first_name || "User")}
              disabled={processingId === profile.user_id}
            >
              {processingId === profile.user_id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingApprovals;
