import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

interface DocumentViewerProps {
  filePath: string;
  fileName: string;
}

const DocumentViewer = ({ filePath, fileName }: DocumentViewerProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: signError } = await supabase.storage
        .from("student-documents")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signError) {
        setError("Failed to load document");
        console.error("Error fetching signed URL:", signError);
      } else {
        setSignedUrl(data.signedUrl);
      }
      setLoading(false);
    };

    fetchSignedUrl();
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{error || "Document unavailable"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-muted">
        {isImage ? (
          <img
            src={signedUrl}
            alt={fileName}
            className="w-full h-auto max-h-96 object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={signedUrl}
            title={fileName}
            className="w-full h-96"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{fileName}</p>
          </div>
        )}
      </div>
      
      <Button variant="outline" asChild className="w-full">
        <a href={signedUrl} target="_blank" rel="noopener noreferrer" download={fileName}>
          <Download className="mr-2 h-4 w-4" />
          Download Document
        </a>
      </Button>
    </div>
  );
};

export default DocumentViewer;
