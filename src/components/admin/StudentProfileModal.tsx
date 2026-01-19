import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import DocumentViewer from "./DocumentViewer";
import VerificationActions from "./VerificationActions";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type StudentDocument = Database["public"]["Tables"]["student_documents"]["Row"];

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  documents: StudentDocument[];
  onActionComplete: () => void;
}

const StudentProfileModal = ({
  open,
  onClose,
  profile,
  documents,
  onActionComplete,
}: StudentProfileModalProps) => {
  if (!profile) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    verified: "bg-green-500/20 text-green-500",
    rejected: "bg-red-500/20 text-red-500",
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not provided";
    return format(new Date(date), "MMMM d, yyyy");
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
    <div className="flex justify-between py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "Not provided"}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {profile.first_name} {profile.last_name}
            </DialogTitle>
            <Badge className={statusColors[profile.verification_status || "pending"]}>
              {profile.verification_status || "pending"}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({documents.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="profile" className="space-y-6">
              {/* Academic Information */}
              <div>
                <h3 className="font-semibold mb-2">Academic Information</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <InfoRow label="Institution" value={profile.institution} />
                  <InfoRow label="Medical School Type" value={profile.medical_school_type} />
                  <InfoRow label="Year of Study" value={profile.year_of_study} />
                  <InfoRow label="Program Level" value={profile.program_level} />
                  <InfoRow label="Expected Graduation" value={formatDate(profile.expected_graduation)} />
                </div>
              </div>

              <Separator />

              {/* USMLE Status */}
              <div>
                <h3 className="font-semibold mb-2">USMLE Status</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <InfoRow label="Step 1 Status" value={profile.usmle_step1_status} />
                  <InfoRow label="Step 1 Score" value={profile.usmle_step1_score} />
                  <InfoRow label="Step 2 Status" value={profile.usmle_step2_status} />
                  <InfoRow label="Step 2 Score" value={profile.usmle_step2_score} />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <InfoRow label="Country" value={profile.country} />
                  <InfoRow label="State/Province" value={profile.state_province} />
                  <InfoRow label="City" value={profile.city} />
                  <InfoRow label="Phone Number" value={profile.phone_number} />
                  <InfoRow label="Date of Birth" value={formatDate(profile.date_of_birth)} />
                </div>
              </div>

              <Separator />

              {/* Career Goals */}
              <div>
                <h3 className="font-semibold mb-2">Career Goals</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <InfoRow label="Target Specialty" value={profile.target_specialty} />
                  <InfoRow label="Learning Style" value={profile.learning_style} />
                  <InfoRow label="Study Hours/Week" value={profile.study_hours_per_week} />
                  {profile.weak_areas && profile.weak_areas.length > 0 && (
                    <div className="py-2">
                      <span className="text-muted-foreground">Weak Areas</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.weak_areas.map((area, idx) => (
                          <Badge key={idx} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.career_goals && (
                    <div className="py-2">
                      <span className="text-muted-foreground">Goals</span>
                      <p className="mt-1 text-sm">{profile.career_goals}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Emergency Contact */}
              <div>
                <h3 className="font-semibold mb-2">Emergency Contact</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <InfoRow label="Name" value={profile.emergency_contact_name} />
                  <InfoRow label="Phone" value={profile.emergency_contact_phone} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No documents uploaded
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold capitalize">
                          {doc.document_type.replace(/_/g, " ")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                      <Badge
                        className={statusColors[doc.status]}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <DocumentViewer
                      filePath={doc.file_url}
                      fileName={doc.file_name}
                    />
                    {doc.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                        <p className="text-sm text-red-500">
                          <strong>Rejection Reason:</strong> {doc.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Actions */}
        {profile.verification_status === "pending" && documents.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <VerificationActions
              userId={profile.user_id}
              documentIds={documents.map((d) => d.id)}
              onActionComplete={() => {
                onActionComplete();
                onClose();
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileModal;
