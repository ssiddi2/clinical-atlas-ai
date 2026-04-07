import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Loader2, FileText, Calendar, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContactInquiry {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  role: string | null;
  inquiry_type: string;
  message: string;
  created_at: string | null;
}

interface PendingApplicationsProps {
  onCreateAccount?: (name: string, email: string) => void;
}

const PendingApplications = ({ onCreateAccount }: PendingApplicationsProps) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("*")
      .eq("inquiry_type", "application")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No pending applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="p-4 rounded-lg border bg-background"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">{app.full_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{app.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {app.organization && (
                    <Badge variant="outline" className="text-xs">{app.organization}</Badge>
                  )}
                  {app.role && (
                    <Badge variant="secondary" className="text-xs">{app.role}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
            >
              {expandedId === app.id ? "Hide Details" : "View Details"}
            </Button>
          </div>

          {expandedId === app.id && (
            <div className="mt-4 pt-4 border-t">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                {app.message}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PendingApplications;
