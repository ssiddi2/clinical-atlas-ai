import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Eye, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";
import StudentProfileModal from "./StudentProfileModal";
import VerificationActions from "./VerificationActions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type StudentDocument = Database["public"]["Tables"]["student_documents"]["Row"];

interface PendingVerificationsProps {
  profiles: (Profile & { documents: StudentDocument[] })[];
  onRefresh: () => void;
}

const PendingVerifications = ({ profiles, onRefresh }: PendingVerificationsProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<StudentDocument[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    verified: "bg-green-500/20 text-green-500",
    rejected: "bg-red-500/20 text-red-500",
  };

  const filteredProfiles = profiles.filter((profile) => {
    // Status filter
    if (statusFilter !== "all" && profile.verification_status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.toLowerCase();
      const institution = (profile.institution || "").toLowerCase();
      
      if (!fullName.includes(searchLower) && !institution.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const handleViewProfile = (profile: Profile & { documents: StudentDocument[] }) => {
    setSelectedProfile(profile);
    setSelectedDocuments(profile.documents);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No students found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year {profile.year_of_study || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {profile.institution || "Not provided"}
                    </div>
                  </TableCell>
                  <TableCell>{profile.country || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.documents.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {profile.documents[0]?.uploaded_at
                      ? format(new Date(profile.documents[0].uploaded_at), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[profile.verification_status || "pending"]}>
                      {profile.verification_status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(profile)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {profile.verification_status === "pending" && profile.documents.length > 0 && (
                        <VerificationActions
                          userId={profile.user_id}
                          documentIds={profile.documents.map((d) => d.id)}
                          onActionComplete={onRefresh}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Profile Modal */}
      <StudentProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={selectedProfile}
        documents={selectedDocuments}
        onActionComplete={onRefresh}
      />
    </div>
  );
};

export default PendingVerifications;
