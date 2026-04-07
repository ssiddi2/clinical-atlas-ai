import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, BookOpen, Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface AdminProfessorsProps {
  profiles: any[];
  roles: any[];
  courses: any[];
  enrollments: any[];
  onTabChange?: (tab: string) => void;
}

const AdminProfessors = ({ profiles, roles, courses, enrollments, onTabChange }: AdminProfessorsProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const professorUserIds = roles
    .filter((r: any) => r.role === "physician" || r.role === "faculty")
    .map((r: any) => r.user_id);

  const professors = profiles.filter((p: any) => professorUserIds.includes(p.user_id));

  const getCourses = (userId: string) => courses.filter((c: any) => c.instructor_id === userId);
  const getEnrolledCount = (courseId: string) => enrollments.filter((e: any) => e.course_id === courseId).length;
  const getTotalStudents = (userId: string) => {
    const profCourses = getCourses(userId);
    const studentIds = new Set(
      enrollments
        .filter((e: any) => profCourses.some((c: any) => c.id === e.course_id))
        .map((e: any) => e.student_id)
    );
    return studentIds.size;
  };

  if (professors.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No professors found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Courses</TableHead>
          <TableHead>Total Students</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {professors.map((prof) => {
          const profCourses = getCourses(prof.user_id);
          const isExpanded = expanded[prof.user_id];
          return (
            <>
              <TableRow
                key={prof.user_id}
                className="cursor-pointer"
                onClick={() => setExpanded((p) => ({ ...p, [prof.user_id]: !p[prof.user_id] }))}
              >
                <TableCell>
                  {profCourses.length > 0 && (
                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {prof.first_name || ""} {prof.last_name || "Unnamed"}
                </TableCell>
                <TableCell>
                  <Badge variant={prof.account_status === "approved" ? "default" : "secondary"} className="capitalize">
                    {prof.account_status || "unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    {profCourses.length}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {getTotalStudents(prof.user_id)}
                  </div>
                </TableCell>
              </TableRow>
              {isExpanded && profCourses.map((course: any) => (
                <TableRow key={course.id} className="bg-muted/30">
                  <TableCell />
                  <TableCell colSpan={2} className="pl-10">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabChange?.("courses");
                      }}
                    >
                      {course.title}
                    </Button>
                    <Badge variant="outline" className="ml-2 capitalize text-xs">{course.status}</Badge>
                  </TableCell>
                  <TableCell colSpan={2}>
                    {getEnrolledCount(course.id)} students enrolled
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

export default AdminProfessors;
