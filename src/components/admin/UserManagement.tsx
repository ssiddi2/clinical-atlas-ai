import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface UserManagementProps {
  profiles: any[];
  onRefresh: () => void;
}

const UserManagement = ({ profiles, onRefresh }: UserManagementProps) => {
  const { toast } = useToast();
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (userId: string, currentStatus: string) => {
    setToggling(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const newStatus = currentStatus === "approved" ? "suspended" : "approved";

      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: {
          action: "toggle_account_status",
          userId,
          newStatus,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: `Account ${newStatus}` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const activeProfiles = profiles.filter(
    (p) => p.account_status === "approved" || p.account_status === "suspended"
  );

  if (activeProfiles.length === 0) {
    return <p className="text-sm text-muted-foreground">No users to manage.</p>;
  }

  return (
    <div className="space-y-2">
      {activeProfiles.map((p) => (
        <div key={p.user_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium text-sm">
              {p.first_name || ""} {p.last_name || "Unnamed User"}
            </p>
            <p className="text-xs text-muted-foreground">{p.user_id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={p.account_status === "approved" ? "default" : "destructive"}
              className="capitalize"
            >
              {p.account_status}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              disabled={toggling === p.user_id}
              onClick={() => handleToggle(p.user_id, p.account_status)}
            >
              {toggling === p.user_id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : p.account_status === "approved" ? (
                <>
                  <ToggleRight className="h-3.5 w-3.5 mr-1" /> Deactivate
                </>
              ) : (
                <>
                  <ToggleLeft className="h-3.5 w-3.5 mr-1" /> Activate
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
