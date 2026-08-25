import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BookMarked,
  ExternalLink,
  Loader2,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";

interface SourceRow {
  id: string;
  name: string;
  publisher: string | null;
  domain: string;
  url: string | null;
  source_type: string;
  authority_tier: number;
  license: string | null;
  allowed_for_retrieval: boolean;
  citation_format: string | null;
  notes: string | null;
  status: string;
}

interface CoverageRow {
  blueprint_node_id: string;
  exam: string;
  axis: string;
  code: string;
  title: string;
  weight_low: number | null;
  weight_high: number | null;
  mapped_items: number;
  qbank_items: number;
  curriculum_items: number;
  cited_items: number;
}

interface Competency {
  id: string;
  code: string;
  title: string;
  description: string | null;
}

const SOURCE_TYPES = [
  "exam_blueprint",
  "guideline",
  "textbook",
  "peer_reviewed",
  "reference",
  "image_library",
  "internal",
  "other",
];

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 · Primary standard",
  2: "Tier 2 · Society / peer-reviewed",
  3: "Tier 3 · Curated reference",
  4: "Tier 4 · Open-license media",
};

const AXIS_LABEL: Record<string, string> = {
  system: "Organ system",
  physician_task: "Physician task",
  discipline: "Clinical discipline",
  competency: "Competency",
};

/** Expected item count for a category, from its published blueprint weight. */
function expectedShare(row: CoverageRow) {
  if (row.weight_low == null || row.weight_high == null) return null;
  return (Number(row.weight_low) + Number(row.weight_high)) / 2;
}

export default function CurriculumStandards() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [coverage, setCoverage] = useState<CoverageRow[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [axisFilter, setAxisFilter] = useState("system");

  const [form, setForm] = useState({
    name: "",
    publisher: "",
    domain: "",
    url: "",
    source_type: "guideline",
    authority_tier: "2",
    license: "",
    citation_format: "",
    notes: "",
    allowed_for_retrieval: true,
  });

  const load = async () => {
    const [sourcesRes, coverageRes, compsRes] = await Promise.all([
      supabase.from("content_sources").select("*").order("authority_tier").order("name"),
      supabase.from("blueprint_coverage").select("*"),
      supabase.from("acgme_competencies").select("id, code, title, description").order("sort_order"),
    ]);
    setSources((sourcesRes.data as SourceRow[]) || []);
    setCoverage((coverageRes.data as CoverageRow[]) || []);
    setCompetencies((compsRes.data as Competency[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredCoverage = useMemo(
    () =>
      coverage
        .filter((c) => c.axis === axisFilter)
        .sort((a, b) => (Number(b.weight_high ?? 0) - Number(a.weight_high ?? 0)) || a.title.localeCompare(b.title)),
    [coverage, axisFilter],
  );

  const totalMapped = useMemo(
    () => coverage.filter((c) => c.axis === axisFilter).reduce((sum, c) => sum + Number(c.mapped_items), 0),
    [coverage, axisFilter],
  );

  const handleToggleRetrieval = async (row: SourceRow) => {
    const next = !row.allowed_for_retrieval;
    setSources((prev) => prev.map((s) => (s.id === row.id ? { ...s, allowed_for_retrieval: next } : s)));
    const { error } = await supabase
      .from("content_sources")
      .update({ allowed_for_retrieval: next })
      .eq("id", row.id);
    if (error) {
      setSources((prev) => prev.map((s) => (s.id === row.id ? { ...s, allowed_for_retrieval: !next } : s)));
      toast({ title: "Could not update source", description: error.message, variant: "destructive" });
    }
  };

  const handleStatus = async (row: SourceRow, status: string) => {
    const { error } = await supabase.from("content_sources").update({ status }).eq("id", row.id);
    if (error) {
      toast({ title: "Could not update source", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const handleDelete = async (row: SourceRow) => {
    const { error } = await supabase.from("content_sources").delete().eq("id", row.id);
    if (error) {
      toast({ title: "Could not remove source", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Source removed", description: row.name });
    load();
  };

  const handleAdd = async () => {
    const domain = form.domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    if (!form.name.trim() || !domain) {
      toast({ title: "Name and domain are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("content_sources").insert({
      name: form.name.trim(),
      publisher: form.publisher.trim() || null,
      domain,
      url: form.url.trim() || null,
      source_type: form.source_type,
      authority_tier: Number(form.authority_tier),
      license: form.license.trim() || null,
      citation_format: form.citation_format.trim() || null,
      notes: form.notes.trim() || null,
      allowed_for_retrieval: form.allowed_for_retrieval,
      status: "approved",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not add source", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Source added", description: `${form.name.trim()} is now on the approved registry.` });
    setShowForm(false);
    setForm({
      name: "",
      publisher: "",
      domain: "",
      url: "",
      source_type: "guideline",
      authority_tier: "2",
      license: "",
      citation_format: "",
      notes: "",
      allowed_for_retrieval: true,
    });
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const retrievalCount = sources.filter((s) => s.allowed_for_retrieval && s.status === "approved").length;
  const gaps = filteredCoverage.filter((c) => Number(c.mapped_items) === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Curriculum Standards</h2>
        <p className="text-sm text-muted-foreground">
          The approved source registry defines what counts as authoritative on this platform, and the coverage report
          shows how our content maps to the USMLE Step 2 CK outline and the ACGME competencies.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
            <BookMarked className="h-3.5 w-3.5" /> Approved sources
          </div>
          <p className="text-2xl font-semibold">{sources.filter((s) => s.status === "approved").length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
            <ShieldCheck className="h-3.5 w-3.5" /> ATLAS may read
          </div>
          <p className="text-2xl font-semibold">{retrievalCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">domains on the retrieval allow-list</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
            <Target className="h-3.5 w-3.5" /> Uncovered categories
          </div>
          <p className="text-2xl font-semibold">{gaps}</p>
          <p className="text-xs text-muted-foreground mt-0.5">in the {AXIS_LABEL[axisFilter]?.toLowerCase()} axis</p>
        </div>
      </div>

      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry">Source Registry</TabsTrigger>
          <TabsTrigger value="coverage">Blueprint Coverage</TabsTrigger>
          <TabsTrigger value="lanes">Lane Queue</TabsTrigger>
          <TabsTrigger value="competencies">ACGME Competencies</TabsTrigger>
        </TabsList>


        {/* ------------------------------ Registry ------------------------------ */}
        <TabsContent value="registry" className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Turning off <span className="font-medium text-foreground">ATLAS may read</span> blocks the AI professor
              from opening pages on that domain. If no domain is enabled, nothing is blocked.
            </p>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add source
            </Button>
          </div>

          {showForm && (
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Source name (e.g. AAFP Clinical Recommendations)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Publisher / society"
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                />
                <Input
                  placeholder="Domain (e.g. aafp.org)"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                />
                <Input
                  placeholder="Landing URL (optional)"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
                <Select value={form.source_type} onValueChange={(v) => setForm({ ...form, source_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.authority_tier} onValueChange={(v) => setForm({ ...form, authority_tier: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Authority tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {TIER_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Licence / reuse terms"
                  value={form.license}
                  onChange={(e) => setForm({ ...form, license: e.target.value })}
                />
                <Input
                  placeholder="Citation format"
                  value={form.citation_format}
                  onChange={(e) => setForm({ ...form, citation_format: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Notes for faculty — what this source is authoritative for, and what it must not be used for."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.allowed_for_retrieval}
                    onCheckedChange={(v) => setForm({ ...form, allowed_for_retrieval: v })}
                  />
                  ATLAS may read pages on this domain
                </label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAdd} disabled={saving}>
                    {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                    Add to registry
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{s.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {TIER_LABEL[s.authority_tier] ?? `Tier ${s.authority_tier}`}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {s.source_type.replace(/_/g, " ")}
                      </Badge>
                      {s.status !== "approved" && (
                        <Badge variant="destructive" className="text-[10px]">
                          {s.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.publisher ? `${s.publisher} · ` : ""}
                      {s.domain}
                      {s.license ? ` · ${s.license}` : ""}
                    </p>
                    {s.citation_format && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">Cite as:</span> {s.citation_format}
                      </p>
                    )}
                    {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={s.allowed_for_retrieval} onCheckedChange={() => handleToggleRetrieval(s)} />
                      ATLAS may read
                    </label>
                    {s.url && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                        <a href={s.url} target="_blank" rel="noreferrer noopener" aria-label={`Open ${s.name}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    {s.status === "approved" ? (
                      <Button size="sm" variant="outline" onClick={() => handleStatus(s, "retired")}>
                        Retire
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleStatus(s, "approved")}>
                        Approve
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(s)}
                      aria-label={`Remove ${s.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ------------------------------ Coverage ------------------------------ */}
        <TabsContent value="coverage" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {totalMapped} mapped items across the {AXIS_LABEL[axisFilter]?.toLowerCase()} axis. Categories are ordered
              by published exam weight, so the gaps at the top matter most.
            </p>
            <Select value={axisFilter} onValueChange={setAxisFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Organ system</SelectItem>
                <SelectItem value="physician_task">Physician task</SelectItem>
                <SelectItem value="discipline">Clinical discipline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredCoverage.map((c) => {
              const expected = expectedShare(c);
              const actualShare = totalMapped > 0 ? (Number(c.mapped_items) / totalMapped) * 100 : 0;
              const under = expected != null && actualShare < expected * 0.6;
              const empty = Number(c.mapped_items) === 0;
              return (
                <div key={c.blueprint_node_id} className="rounded-2xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{c.title}</p>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {c.code}
                        </Badge>
                        {empty ? (
                          <Badge variant="destructive" className="text-[10px]">
                            No content
                          </Badge>
                        ) : under ? (
                          <Badge variant="secondary" className="text-[10px]">
                            Under-weighted
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {expected != null
                          ? `Exam weight ${c.weight_low}–${c.weight_high}% · our mix ${actualShare.toFixed(1)}%`
                          : "No published weight"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div className="text-center">
                        <p className="font-semibold text-base">{c.qbank_items}</p>
                        <p className="text-muted-foreground">QBank</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-base">{c.curriculum_items}</p>
                        <p className="text-muted-foreground">Curriculum</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-base">{c.cited_items}</p>
                        <p className="text-muted-foreground">Cited</p>
                      </div>
                    </div>
                  </div>
                  {expected != null && (
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${empty ? "bg-destructive" : under ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, (actualShare / Math.max(expected, 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ------------------------------- Lanes -------------------------------- */}
        <TabsContent value="lanes" className="pt-4">
          <LaneAuthoringQueue />
        </TabsContent>

        {/* ---------------------------- Competencies ---------------------------- */}
        <TabsContent value="competencies" className="space-y-3 pt-4">

          <p className="text-sm text-muted-foreground">
            The six ACGME core competencies, cited to the Common Program Requirements. Rotation evaluations and letters
            of recommendation are written against these.
          </p>
          {competencies.map((c) => (
            <div key={c.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <p className="font-medium">{c.title}</p>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {c.code}
                </Badge>
              </div>
              {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
