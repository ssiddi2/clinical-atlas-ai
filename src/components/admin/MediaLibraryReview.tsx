import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ExternalLink, ImageOff, Loader2 } from "lucide-react";

interface MediaRow {
  id: string;
  title: string;
  description: string | null;
  teaching_caption: string | null;
  image_url: string;
  source_page_url: string | null;
  credit: string | null;
  license: string | null;
  modality: string | null;
  body_region: string | null;
  keywords: string[] | null;
  suggested_query: string | null;
  status: string;
  usage_count: number;
  created_at: string;
}

const STATUSES = ["pending", "approved", "rejected"] as const;

export function MediaLibraryReview() {
  const { toast } = useToast();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("pending");
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { caption: string; modality: string; notes: string }>>({});

  const load = async (next: (typeof STATUSES)[number]) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medical_media")
      .select("*")
      .eq("status", next)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: "Could not load media", description: error.message, variant: "destructive" });
    }
    setRows((data as MediaRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load(status);
  }, [status]);

  const draftFor = (row: MediaRow) =>
    drafts[row.id] ?? {
      caption: row.teaching_caption ?? "",
      modality: row.modality ?? "",
      notes: "",
    };

  const decide = async (row: MediaRow, verdict: "approved" | "rejected") => {
    const draft = draftFor(row);
    setSaving(row.id);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("medical_media")
      .update({
        status: verdict,
        teaching_caption: draft.caption.trim() || null,
        modality: draft.modality.trim() || null,
        review_notes: draft.notes.trim() || null,
        reviewed_by: userData?.user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    setSaving(null);

    if (error) {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: verdict === "approved" ? "Image approved" : "Image rejected",
      description:
        verdict === "approved"
          ? "ATLAS will now surface this image deterministically for matching topics."
          : "ATLAS will no longer suggest this image.",
    });
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Media library</h3>
        <p className="text-sm text-muted-foreground">
          ATLAS suggests open-license candidates when it teaches a visual topic. Approved images become the
          deterministic, faculty-verified source it uses first.
        </p>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as (typeof STATUSES)[number])}>
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUSES.map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            {loading ? (
              <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading media…
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted-foreground">
                <ImageOff className="h-6 w-6" />
                No {s} images.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rows.map((row) => {
                  const draft = draftFor(row);
                  return (
                    <div key={row.id} className="lm-card overflow-hidden p-0">
                      <div className="aspect-video w-full bg-muted">
                        <img
                          src={row.image_url}
                          alt={row.title}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-snug">{row.title}</p>
                          <Badge variant="secondary" className="shrink-0 capitalize">
                            {row.status}
                          </Badge>
                        </div>
                        {row.suggested_query && (
                          <p className="text-xs text-muted-foreground">
                            Suggested for: “{row.suggested_query}”
                          </p>
                        )}
                        {row.description && (
                          <p className="line-clamp-3 text-sm text-muted-foreground">{row.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {row.credit} · {row.license}
                          {row.source_page_url && (
                            <a
                              href={row.source_page_url}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 inline-flex items-center gap-1 underline"
                            >
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </p>

                        {s !== "rejected" && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Teaching caption students will see"
                              value={draft.caption}
                              onChange={(e) =>
                                setDrafts((p) => ({ ...p, [row.id]: { ...draft, caption: e.target.value } }))
                              }
                            />
                            <Input
                              placeholder="Modality (chest x-ray, ECG, histology…)"
                              value={draft.modality}
                              onChange={(e) =>
                                setDrafts((p) => ({ ...p, [row.id]: { ...draft, modality: e.target.value } }))
                              }
                            />
                            <Textarea
                              rows={2}
                              placeholder="Review notes (optional)"
                              value={draft.notes}
                              onChange={(e) =>
                                setDrafts((p) => ({ ...p, [row.id]: { ...draft, notes: e.target.value } }))
                              }
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          {row.status !== "approved" && (
                            <Button
                              size="sm"
                              onClick={() => decide(row, "approved")}
                              disabled={saving === row.id}
                            >
                              <Check className="mr-1 h-4 w-4" /> Approve
                            </Button>
                          )}
                          {row.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decide(row, "rejected")}
                              disabled={saving === row.id}
                            >
                              <X className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default MediaLibraryReview;
