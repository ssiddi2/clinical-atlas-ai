import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentUploadProps {
  userId: string;
  onUploadComplete: () => void;
}

interface UploadedFile {
  name: string;
  type: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUpload = ({ userId, onUploadComplete }: DocumentUploadProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPG, PNG, or WebP files only.",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-documents')
        .getPublicUrl(filePath);

      // Create record in student_documents table
      const { error: dbError } = await supabase
        .from('student_documents')
        .insert({
          user_id: userId,
          document_type: file.type.includes('pdf') ? 'enrollment_letter' : 'student_id',
          file_url: filePath,
          file_name: file.name,
          status: 'pending'
        });

      if (dbError) throw dbError;

      return {
        name: file.name,
        type: file.type,
        url: publicUrl,
        status: 'success'
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        name: file.name,
        type: file.type,
        url: '',
        status: 'error'
      };
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, [userId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      await processFiles(selectedFiles);
    }
  };

  const processFiles = async (filesToProcess: File[]) => {
    for (const file of filesToProcess) {
      // Add placeholder
      setFiles(prev => [...prev, { name: file.name, type: file.type, url: '', status: 'uploading' }]);

      const result = await uploadFile(file);
      
      if (result) {
        setFiles(prev => 
          prev.map(f => f.name === file.name ? result : f)
        );
      } else {
        setFiles(prev => prev.filter(f => f.name !== file.name));
      }
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleSubmit = async () => {
    const successfulUploads = files.filter(f => f.status === 'success');
    
    if (successfulUploads.length === 0) {
      toast({
        title: "No documents uploaded",
        description: "Please upload at least one verification document.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // The documents are already uploaded, just notify completion
      toast({
        title: "Documents submitted!",
        description: "Your verification documents have been received. We'll review them within 24-48 hours.",
      });
      onUploadComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSuccessfulUploads = files.some(f => f.status === 'success');

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg mb-1">Verify Your Student Status</h3>
        <p className="text-sm text-muted-foreground">
          Upload your medical school ID, enrollment letter, or transcript to verify your student status.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
      >
        <input
          type="file"
          id="document-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileSelect}
        />
        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, JPG, PNG, or WebP • Max 10MB per file
        </p>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                {file.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {file.status === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {file.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(file.name)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      {hasSuccessfulUploads && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full gradient-livemed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit for Verification
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Verification Info */}
      <Card className="p-4 bg-muted/30 border-border/40">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Our team will review your documents within 24-48 hours</li>
              <li>• You can access limited features while pending verification</li>
              <li>• You'll receive an email once your account is verified</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentUpload;
