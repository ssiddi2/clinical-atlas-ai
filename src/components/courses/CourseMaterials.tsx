import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Download, Loader2, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RadiologyImageViewer from "@/components/radiology/RadiologyImageViewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseMaterialsProps {
  courseId: string;
  isInstructor: boolean;
  topicId?: string;
}

interface Material {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  material_type: string;
  description: string | null;
  created_at: string;
}

const MATERIAL_TYPES = ["notes", "slides", "syllabus", "assignment", "image", "other"];

const CourseMaterials = ({ courseId, isInstructor, topicId }: CourseMaterialsProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [materialType, setMaterialType] = useState("notes");

  const loadMaterials = async () => {
    let query = supabase
      .from("course_materials")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (topicId) query = query.eq("topic_id", topicId);
    const { data } = await query;
    if (data) setMaterials(data);
    setLoading(false);
  };

  useEffect(() => { loadMaterials(); }, [courseId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 20MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${courseId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("course_materials").insert({
        course_id: courseId,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: filePath,
        file_type: file.type || "application/octet-stream",
        material_type: materialType,
        topic_id: topicId || null,
      });

      if (insertError) throw insertError;

      // Notify enrolled students
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("student_id")
        .eq("course_id", courseId)
        .eq("status", "approved");

      if (enrollments && enrollments.length > 0) {
        const notifications = enrollments.map((e) => ({
          user_id: e.student_id,
          type: "material_uploaded",
          title: "New course material uploaded",
          message: `"${file.name}" has been added to your course.`,
          link: `/courses/${courseId}`,
        }));
        await supabase.from("notifications").insert(notifications);
      }

      toast({ title: "File uploaded successfully" });
      loadMaterials();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (material: Material) => {
    await supabase.storage.from("course-materials").remove([material.file_url]);
    await supabase.from("course_materials").delete().eq("id", material.id);
    toast({ title: "Material deleted" });
    loadMaterials();
  };

  const handleDownload = async (material: Material) => {
    const { data } = await supabase.storage
      .from("course-materials")
      .createSignedUrl(material.file_url, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-400" />;
    return <File className="h-5 w-5 text-blue-400" />;
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {isInstructor && (
        <div className="flex items-center gap-3 p-4 border border-dashed border-border rounded-lg">
          <Select value={materialType} onValueChange={setMaterialType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
          <span className="text-xs text-muted-foreground">PDF, Word, PowerPoint, images — max 20MB</span>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No materials uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <Card key={m.id} className="bg-card/50">
              <CardContent className="flex items-center gap-3 p-3">
                {getIcon(m.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{m.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize text-xs">{m.material_type}</Badge>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(m)}>
                  <Download className="h-4 w-4" />
                </Button>
                {isInstructor && (
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(m)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
