import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { SessionItem, StepKey } from "./sessionSteps";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stepId: string;
  stepKey: StepKey;
  item: SessionItem | null;
  nextOrder: number;
  onSaved: () => void;
}

const FIELDS: Record<StepKey, Array<keyof SessionItem>> = {
  objectives: ["title"],
  reading: ["title", "source", "url"],
  videos: ["title", "subtitle", "url", "source", "duration_label"],
  images: ["title", "subtitle", "body", "image_url", "url"],
  discussion: ["title", "subtitle"],
  mcqs: ["title"],
};

const LABELS: Partial<Record<keyof SessionItem, string>> = {
  title: "Title",
  subtitle: "Subtitle",
  body: "Teaching point",
  url: "Link (URL)",
  source: "Source / courtesy",
  image_url: "Image URL",
  duration_label: "Duration (e.g. 10:51)",
};

export default function SessionItemEditor({ open, onOpenChange, stepId, stepKey, item, nextOrder, onSaved }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<SessionItem>>(item ?? {});

  const save = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = { step_id: stepId, sort_order: item?.sort_order ?? nextOrder };
    for (const f of FIELDS[stepKey]) payload[f] = (form as any)[f] || null;
    const { error } = item
      ? await supabase.from("learning_unit_step_items").update(payload).eq("id", item.id)
      : await supabase.from("learning_unit_step_items").insert(payload as any);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {FIELDS[stepKey].map(f => (
            <div key={f} className="space-y-1.5">
              <Label>{LABELS[f]}</Label>
              {f === "body" ? (
                <Textarea rows={3} value={(form as any)[f] || ""} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              ) : (
                <Input value={(form as any)[f] || ""} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              )}
            </div>
          ))}
          <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
