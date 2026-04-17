import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  defaultCourseId?: string;
  defaultTopicId?: string;
}

export default function CreateLectureModal({ open, onOpenChange, onCreated, defaultCourseId, defaultTopicId }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    specialty_id: "",
    course_id: defaultCourseId || "",
    scheduled_start: "",
    scheduled_end: "",
    max_students: 50,
    meeting_url: "",
  });

  useEffect(() => {
    supabase.from("specialties").select("id, name").order("sort_order").then(({ data }) => {
      if (data) setSpecialties(data);
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("courses").select("id, title").eq("instructor_id", user.id).order("title").then(({ data }) => {
          if (data) setCourses(data);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (defaultCourseId) setForm(f => ({ ...f, course_id: defaultCourseId }));
  }, [defaultCourseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("virtual_classrooms").insert({
      instructor_id: user.id,
      title: form.title,
      description: form.description || null,
      specialty_id: form.specialty_id || null,
      course_id: form.course_id || null,
      topic_id: defaultTopicId || null,
      scheduled_start: form.scheduled_start,
      scheduled_end: form.scheduled_end,
      max_students: form.max_students,
      meeting_url: form.meeting_url || null,
    });

    setLoading(false);
    if (!error) {
      setForm({ title: "", description: "", specialty_id: "", course_id: defaultCourseId || "", scheduled_start: "", scheduled_end: "", max_students: 50, meeting_url: "" });
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("classroom.createLecture")}</DialogTitle>
          <DialogDescription>{t("classroom.createLectureDesc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>{t("classroom.lectureTitle")}</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder={t("classroom.lectureTitlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("classroom.description")}</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("classroom.descriptionPlaceholder")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Assign to Course</Label>
            <Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select course (recommended)" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("classroom.specialty")}</Label>
            <Select value={form.specialty_id} onValueChange={v => setForm({ ...form, specialty_id: v })}>
              <SelectTrigger><SelectValue placeholder={t("classroom.selectSpecialty")} /></SelectTrigger>
              <SelectContent>
                {specialties.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("classroom.startTime")}</Label>
              <Input type="datetime-local" value={form.scheduled_start} onChange={e => setForm({ ...form, scheduled_start: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t("classroom.endTime")}</Label>
              <Input type="datetime-local" value={form.scheduled_end} onChange={e => setForm({ ...form, scheduled_end: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("classroom.maxStudents")}</Label>
              <Input type="number" min={1} max={500} value={form.max_students} onChange={e => setForm({ ...form, max_students: parseInt(e.target.value) || 50 })} />
            </div>
            <div className="space-y-2">
              <Label>{t("classroom.meetingUrl")}</Label>
              <Input
                value={form.meeting_url}
                onChange={e => setForm({ ...form, meeting_url: e.target.value })}
                placeholder="https://meet.google.com/abc-defg-hij"
              />
              <p className="text-xs text-muted-foreground">
                Paste your Google Meet, Zoom, or Microsoft Teams link. Create a Meet at{" "}
                <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  meet.google.com/new
                </a>
              </p>
            </div>
          </div>
          <Button type="submit" className="w-full gradient-livemed" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("classroom.createLecture")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
