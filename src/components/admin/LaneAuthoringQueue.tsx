import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CircleDot, Layers, Loader2, ExternalLink } from "lucide-react";

const CORE_COURSE_ID = "11111111-1111-4111-8111-000000000001";

interface LaneRow {
  blueprint_node_id: string;
  axis: string;
  code: string;
  title: string;
  weight_low: number | null;
  weight_high: number | null;
  mapped_items: number;
  qbank_items: number;
  curriculum_items: number;
  source_count: number;
  task_id: string | null;
  topic_id: string | null;
  status: string;
  target_items: number;
  notes: string | null;
}

interface LaneSource {
  blueprint_node_id: string;
  role: string;
  content_sources: { name: string; authority_tier: number; status: string } | null;
}

const AXIS_LABEL: Record<string, string> = {
  system: "Organ system",
  physician_task: "Physician task",
  discipline: "Clinical discipline",
};

const STATUSES = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In faculty review" },
  { value: "complete", label: "Complete" },
];

const STATUS_TONE: Record<string, string> = {
  not_started: "bg-destructive/10 text-destructive border-destructive/20",
  in_progress: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  in_review: "bg-primary/10 text-primary border-primary/20",
  complete: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

const ROLE_LABEL: Record<string, string> = {
  blueprint: "Blueprint",
  primary: "Primary",
  guideline: "Guideline",
  imaging: "Imaging",
};

export default function LaneAuthoringQueue() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lanes, setLanes] = useState<LaneRow[]>([]);
  const [laneSources, setLaneSources] = useState<LaneSource[]>([]);
  const [axisFilter, setAxisFilter] = useState("system");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const load = async () => {
    const [lanesRes, sourcesRes] = await Promise.all([
      supabase.from("lane_readiness").select("*"),
      supabase
        .from("blueprint_node_sources")
        .select("blueprint_node_id, role, content_sources(name, authority_tier, status)"),
    ]);
    setLanes((lanesRes.data as unknown as LaneRow[]) || []);
    setLaneSources((sourcesRes.data as unknown as LaneSource[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sourcesByLane = useMemo(() => {
    const map = new Map<string, LaneSource[]>();
    laneSources
      .filter((s) => s.content_sources?.status === "approved")
      .forEach((s) => {
        const list = map.get(s.blueprint_node_id) || [];
        list.push(s);
        map.set(s.blueprint_node_id, list);
      });
    return map;
  }, [laneSources]);

  const visible = useMemo(
    () =>
      lanes
        .filter((l) => l.axis === axisFilter)
        .filter((l) => !onlyOpen || l.status !== "complete")
        .sort(
          (a, b) =>
            Number(b.weight_high ?? 0) - Number(a.weight_high ?? 0) ||
            Number(a.mapped_items) - Number(b.mapped_items) ||
            a.title.localeCompare(b.title),
        ),
    [lanes, axisFilter, onlyOpen],
  );

  const patchTask = async (lane: LaneRow, patch: Partial<Pick<LaneRow, "status" | "target_items">>) => {
    setLanes((prev) =>
      prev.map((l) => (l.blueprint_node_id === lane.blueprint_node_id ? { ...l, ...patch } : l)),
    );
    const payload = {
      blueprint_node_id: lane.blueprint_node_id,
      topic_id: lane.topic_id,
      status: patch.status ?? lane.status,
      target_items: patch.target_items ?? lane.target_items,
    };
    const { error } = await supabase
      .from("curriculum_authoring_tasks")
      .upsert(payload, { onConflict: "blueprint_node_id" });
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const openCount = lanes.filter((l) => l.axis === axisFilter && l.status !== "complete").length;
  const shellCount = lanes.filter((l) => l.axis === axisFilter && l.topic_id).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
            <Layers className="h-3.5 w-3.5" /> Lanes in this axis
          </div>
          <p className="text-2xl font-semibold">{lanes.filter((l) => l.axis === axisFilter).length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
            <BookOpen className="h-3.5 w-3.5" /> Curriculum shells
          </div>
          <p className="text-2xl font-semibold">{shellCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">learning units scaffolded and ready to author</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
            <CircleDot className="h-3.5 w-3.5" /> Open work items
          </div>
          <p className="text-2xl font-semibold">{openCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          One work item per lane, ordered by published exam weight then by how thin our coverage is. Target counts are
          derived from the blueprint weight.
        </p>
        <div className="flex items-center gap-2">
          <Button variant={onlyOpen ? "default" : "outline"} size="sm" onClick={() => setOnlyOpen((v) => !v)}>
            Open only
          </Button>
          <Select value={axisFilter} onValueChange={setAxisFilter}>
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Organ system</SelectItem>
              <SelectItem value="physician_task">Physician task</SelectItem>
              <SelectItem value="discipline">Clinical discipline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((lane) => {
          const pct = Math.min(100, (Number(lane.mapped_items) / Math.max(lane.target_items, 1)) * 100);
          const paired = sourcesByLane.get(lane.blueprint_node_id) || [];
          return (
            <div key={lane.blueprint_node_id} className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{lane.title}</p>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {lane.code}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[lane.status] ?? ""}`}>
                      {STATUSES.find((s) => s.value === lane.status)?.label ?? lane.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lane.weight_high != null
                      ? `Exam weight ${lane.weight_low}–${lane.weight_high}% · `
                      : ""}
                    {lane.mapped_items} of {lane.target_items} items mapped · {lane.qbank_items} QBank ·{" "}
                    {lane.curriculum_items} curriculum
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Select value={lane.status} onValueChange={(v) => patchTask(lane, { status: v })}>
                    <SelectTrigger className="h-9 w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 w-20"
                    aria-label={`Target items for ${lane.title}`}
                    value={lane.target_items}
                    onChange={(e) =>
                      setLanes((prev) =>
                        prev.map((l) =>
                          l.blueprint_node_id === lane.blueprint_node_id
                            ? { ...l, target_items: Number(e.target.value) }
                            : l,
                        ),
                      )
                    }
                    onBlur={(e) => patchTask(lane, { target_items: Math.max(1, Number(e.target.value) || 1) })}
                  />
                  {lane.topic_id && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/courses/${CORE_COURSE_ID}/topic/${lane.topic_id}`}>
                        Open shell <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    lane.mapped_items === 0 ? "bg-destructive" : pct < 60 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {paired.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No approved source paired with this lane yet.</span>
                ) : (
                  paired.map((s, i) => (
                    <Badge key={`${s.role}-${i}`} variant="secondary" className="text-[10px]">
                      {ROLE_LABEL[s.role] ?? s.role}: {s.content_sources?.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
