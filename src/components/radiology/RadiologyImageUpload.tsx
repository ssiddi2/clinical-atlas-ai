import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RadiologyImageViewer from "./RadiologyImageViewer";

interface Props {
  courseId: string;
  topicId: string;
  value?: string | null;
  onChange: (path: string | null) => void;
}

export default function RadiologyImageUpload({ courseId, topicId, value, onChange }: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Maximum size is 20MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const path = `${courseId}/${topicId}/${Date.now()}_${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("radiology-images").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    onChange(path);
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="space-y-2">
          <RadiologyImageViewer path={value} />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Replace image
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => onChange(null)}>
              <X className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
          {uploading ? "Uploading..." : "Attach radiology image"}
        </Button>
      )}
    </div>
  );
}
