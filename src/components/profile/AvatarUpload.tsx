import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  currentUrl?: string | null;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
  onUploaded?: (url: string) => void;
}

export default function AvatarUpload({ userId, currentUrl, fallbackText, size = "lg", onUploaded }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-28 w-28",
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onUploaded?.(publicUrl);
      toast({ title: "Photo updated", description: "Your profile photo is live." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          {previewUrl && <AvatarImage src={previewUrl} alt="Profile photo" />}
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-semibold">
            {fallbackText?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
          aria-label="Upload photo"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {!previewUrl && (
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload photo
        </Button>
      )}
    </div>
  );
}
