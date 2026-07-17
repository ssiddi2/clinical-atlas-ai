import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Calendar, User } from "lucide-react";

const AdminContactInquiries = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_inquiries")
      .select("*")
      .neq("inquiry_type", "application")
      .order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (rows.length === 0) return (
    <div className="text-center py-8 text-muted-foreground">
      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No contact inquiries</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="p-4 rounded-lg border bg-background">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{r.full_name}</p>
                <Badge variant="outline">{r.inquiry_type}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" /> <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a>
                <span className="mx-1">•</span>
                <Calendar className="h-3 w-3" />
                <span>{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</span>
              </div>
              {r.organization && <p className="text-xs text-muted-foreground mt-1">{r.organization} · {r.role || ""}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
              {expandedId === r.id ? "Hide" : "View"}
            </Button>
          </div>
          {expandedId === r.id && (
            <pre className="mt-3 text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{r.message}</pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminContactInquiries;