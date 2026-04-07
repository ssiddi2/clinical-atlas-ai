import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lecture: any;
  onUpdated: () => void;
}

export default function EditLectureModal({ open, onOpenChange, lecture, onUpdated }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: "",
    scheduled_start: "",
    scheduled_end: "",
    max_students: 50,
    meeting_url: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("courses").select("id, title").eq("instructor_id", user.id).order("title").then(({ data }) => {
          if (data) setCourses(data);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (lecture) {
      setForm({
        title: lecture.title || "",
        description: lecture.description || "",
        course_id: lecture.course_id || "",
        scheduled_start: lecture.scheduled_start ? new Date(lecture.scheduled_start).toISOString().slice(0, 16) : "",
        scheduled_end: lecture.scheduled_end ? new Date(lecture.scheduled_end).toISOString().slice(0, 16) : "",
        max_students: lecture.max_students || 50,
        meeting_url: lecture.meeting_url || "",
      });
    }
  }, [lecture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("virtual_classrooms").update({
      title: form.title,
      description: form.description || null,
      course_id: form.course_id || null,
      scheduled_start: form.scheduled_start,
      scheduled_end: form.scheduled_end,
      max_students: form.max_students,
      meeting_url: form.meeting_url || null,
    }).eq("id", lecture.id);

    setLoading(false);
    if (!error) {
      toast({ title: "Lecture updated" });
      onUpdated();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lecture</DialogTitle>
          <DialogDescription>Update lecture details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Assign to Course</Label>
            <Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select course (optional)" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="datetime-local" value={form.scheduled_start} onChange={e => setForm({ ...form, scheduled_start: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="datetime-local" value={form.scheduled_end} onChange={e => setForm({ ...form, scheduled_end: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Students</Label>
              <Input type="number" min={1} max={500} value={form.max_students} onChange={e => setForm({ ...form, max_students: parseInt(e.target.value) || 50 })} />
            </div>
            <div className="space-y-2">
              <Label>Meeting URL</Label>
              <Input value={form.meeting_url} onChange={e => setForm({ ...form, meeting_url: e.target.value })} placeholder="https://zoom.us/..." />
            </div>
          </div>
          <Button type="submit" className="w-full gradient-livemed" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
