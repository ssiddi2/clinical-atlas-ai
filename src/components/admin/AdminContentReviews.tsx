import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert } from "lucide-react";

const AdminContentReviews = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("content_reviews").select("*").order("created_at", { ascending: false }).limit(100);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("content_reviews").update({ status }).eq("id", id);
    load();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (rows.length === 0) return (
    <div className="text-center py-8 text-muted-foreground">
      <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No content reviews yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="p-4 rounded-lg border bg-background">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline">{r.content_type}</Badge>
                <Badge variant={r.verdict === "accurate" ? "secondary" : "destructive"}>{r.verdict}</Badge>
                {r.severity && <Badge variant="outline">Severity: {r.severity}</Badge>}
                <Badge>{r.status || "open"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Content ID: {r.content_id}</p>
              {r.notes && <p className="text-sm mt-2 whitespace-pre-wrap">{r.notes}</p>}
              <p className="text-xs text-muted-foreground mt-2">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {r.status !== "resolved" && <Button size="sm" onClick={() => setStatus(r.id, "resolved")}>Resolve</Button>}
              {r.status !== "dismissed" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "dismissed")}>Dismiss</Button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminContentReviews;