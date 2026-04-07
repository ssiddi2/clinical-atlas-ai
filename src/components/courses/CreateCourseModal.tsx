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
}

export default function CreateCourseModal({ open, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    specialty_id: "",
    start_date: "",
    end_date: "",
    max_students: 30,
  });

  useEffect(() => {
    supabase.from("specialties").select("id, name").order("sort_order").then(({ data }) => {
      if (data) setSpecialties(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("courses").insert({
      instructor_id: user.id,
      title: form.title,
      description: form.description || null,
      specialty_id: form.specialty_id || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      max_students: form.max_students,
      status: "active",
    });

    setLoading(false);
    if (!error) {
      setForm({ title: "", description: "", specialty_id: "", start_date: "", end_date: "", max_students: 30 });
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("courses.createCourse")}</DialogTitle>
          <DialogDescription>{t("courses.createCourseDesc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>{t("courses.courseTitle")}</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder={t("courses.courseTitlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("courses.description")}</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("courses.descriptionPlaceholder")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>{t("courses.specialty")}</Label>
            <Select value={form.specialty_id} onValueChange={v => setForm({ ...form, specialty_id: v })}>
              <SelectTrigger><SelectValue placeholder={t("classroom.selectSpecialty")} /></SelectTrigger>
              <SelectContent>
                {specialties.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("courses.startDate")}</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("courses.endDate")}</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("courses.maxStudents")}</Label>
            <Input type="number" min={1} max={200} value={form.max_students} onChange={e => setForm({ ...form, max_students: parseInt(e.target.value) || 30 })} />
          </div>
          <Button type="submit" className="w-full gradient-livemed" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("courses.createCourse")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
