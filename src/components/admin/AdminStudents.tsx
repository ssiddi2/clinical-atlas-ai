import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, BookOpen, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface AdminStudentsProps {
  profiles: any[];
  roles: any[];
  courses: any[];
  enrollments: any[];
  onRefresh: () => void;
}

const AdminStudents = ({ profiles, roles, courses, enrollments, onRefresh }: AdminStudentsProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<string | null>(null);

  const studentUserIds = roles.filter((r: any) => r.role === "student").map((r: any) => r.user_id);
  const students = profiles.filter((p: any) => studentUserIds.includes(p.user_id));

  const getEnrollments = (userId: string) => enrollments.filter((e: any) => e.student_id === userId);
  const getCourseName = (courseId: string) => courses.find((c: any) => c.id === courseId)?.title || "Unknown";
  const getProfessorName = (courseId: string) => {
    const course = courses.find((c: any) => c.id === courseId);
    if (!course) return "Unknown";
    const prof = profiles.find((p: any) => p.user_id === course.instructor_id);
    return prof ? `${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "Unnamed" : "Unknown";
  };

  const handleToggle = async (userId: string, currentStatus: string) => {
    setToggling(userId);
    try {
      const newStatus = currentStatus === "approved" ? "suspended" : "approved";
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "toggle_account_status", userId, newStatus },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: `Account ${newStatus}` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No students found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Enrolled Courses</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => {
          const stuEnrollments = getEnrollments(student.user_id);
          const isExpanded = expanded[student.user_id];
          const canToggle = student.account_status === "approved" || student.account_status === "suspended";
          return (
            <>
              <TableRow
                key={student.user_id}
                className="cursor-pointer"
                onClick={() => setExpanded((p) => ({ ...p, [student.user_id]: !p[student.user_id] }))}
              >
                <TableCell>
                  {stuEnrollments.length > 0 && (
                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {student.first_name || ""} {student.last_name || "Unnamed"}
                </TableCell>
                <TableCell>
                  <Badge variant={student.account_status === "approved" ? "default" : "secondary"} className="capitalize">
                    {student.account_status || "unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    {stuEnrollments.length}
                  </div>
                </TableCell>
                <TableCell>
                  {canToggle && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={toggling === student.user_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(student.user_id, student.account_status);
                      }}
                    >
                      {toggling === student.user_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : student.account_status === "approved" ? (
                        <><ToggleRight className="h-3.5 w-3.5 mr-1" /> Deactivate</>
                      ) : (
                        <><ToggleLeft className="h-3.5 w-3.5 mr-1" /> Activate</>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              {isExpanded && stuEnrollments.map((enr: any) => (
                <TableRow key={enr.id} className="bg-muted/30">
                  <TableCell />
                  <TableCell className="pl-10">{getCourseName(enr.course_id)}</TableCell>
                  <TableCell>
                    <Badge variant={enr.status === "approved" ? "default" : "outline"} className="capitalize text-xs">
                      {enr.status}
                    </Badge>
                  </TableCell>
                  <TableCell colSpan={2}>Prof: {getProfessorName(enr.course_id)}</TableCell>
                </TableRow>
              ))}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AdminStudents;
