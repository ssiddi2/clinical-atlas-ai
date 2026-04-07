import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AdminCoursesProps {
  profiles: any[];
  courses: any[];
  enrollments: any[];
  onRefresh: () => void;
}

const AdminCourses = ({ profiles, courses, enrollments, onRefresh }: AdminCoursesProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  const getName = (userId: string) => {
    const p = profiles.find((pr: any) => pr.user_id === userId);
    return p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unnamed" : "Unknown";
  };

  const getCourseEnrollments = (courseId: string) => enrollments.filter((e: any) => e.course_id === courseId);

  const getAvailableStudents = (courseId: string) => {
    const enrolled = getCourseEnrollments(courseId).map((e: any) => e.student_id);
    return profiles.filter(
      (p: any) => p.account_status === "approved" && !enrolled.includes(p.user_id)
    );
  };

  const handleApprove = async (enrollmentId: string) => {
    setLoading(enrollmentId);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", enrollmentId);
      if (error) throw error;
      toast({ title: "Enrollment approved" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    setLoading(enrollmentId);
    try {
      const { error } = await supabase.from("course_enrollments").delete().eq("id", enrollmentId);
      if (error) throw error;
      toast({ title: "Enrollment removed" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleAddStudent = async (courseId: string) => {
    if (!selectedStudent) return;
    setLoading(`add-${courseId}`);
    try {
      const { error } = await supabase.from("course_enrollments").insert({
        course_id: courseId,
        student_id: selectedStudent,
        status: "approved",
        approved_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "Student added to course" });
      setAddingTo(null);
      setSelectedStudent("");
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  if (courses.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No courses found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Professor</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course: any) => {
          const courseEnrollments = getCourseEnrollments(course.id);
          const isExpanded = expanded[course.id];
          const available = getAvailableStudents(course.id);
          return (
            <>
              <TableRow
                key={course.id}
                className="cursor-pointer"
                onClick={() => setExpanded((p) => ({ ...p, [course.id]: !p[course.id] }))}
              >
                <TableCell>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </TableCell>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{getName(course.instructor_id)}</TableCell>
                <TableCell>{courseEnrollments.length}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{course.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddingTo(addingTo === course.id ? null : course.id);
                      setSelectedStudent("");
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Student
                  </Button>
                </TableCell>
              </TableRow>

              {addingTo === course.id && (
                <TableRow className="bg-primary/5">
                  <TableCell />
                  <TableCell colSpan={5}>
                    <div className="flex items-center gap-2 py-1">
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {available.length === 0 ? (
                            <SelectItem value="none" disabled>No available students</SelectItem>
                          ) : (
                            available.map((s: any) => (
                              <SelectItem key={s.user_id} value={s.user_id}>
                                {s.first_name || ""} {s.last_name || "Unnamed"}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={!selectedStudent || loading === `add-${course.id}`}
                        onClick={() => handleAddStudent(course.id)}
                      >
                        {loading === `add-${course.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)}>Cancel</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {isExpanded && courseEnrollments.length === 0 && (
                <TableRow className="bg-muted/30">
                  <TableCell />
                  <TableCell colSpan={5} className="text-sm text-muted-foreground pl-10">
                    No students enrolled
                  </TableCell>
                </TableRow>
              )}

              {isExpanded && courseEnrollments.map((enr: any) => (
                <TableRow key={enr.id} className="bg-muted/30">
                  <TableCell />
                  <TableCell className="pl-10">{getName(enr.student_id)}</TableCell>
                  <TableCell />
                  <TableCell>
                    <Badge variant={enr.status === "approved" ? "default" : "outline"} className="capitalize text-xs">
                      {enr.status}
                    </Badge>
                  </TableCell>
                  <TableCell />
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {enr.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600"
                            disabled={loading === enr.id}
                            onClick={(e) => { e.stopPropagation(); handleApprove(enr.id); }}
                          >
                            {loading === enr.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600"
                            disabled={loading === enr.id}
                            onClick={(e) => { e.stopPropagation(); handleReject(enr.id); }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        disabled={loading === enr.id}
                        onClick={(e) => { e.stopPropagation(); handleReject(enr.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AdminCourses;
