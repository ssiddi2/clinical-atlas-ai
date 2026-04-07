import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import AdminStats from "@/components/admin/AdminStats";
import PendingVerifications from "@/components/admin/PendingVerifications";
import PendingApprovals from "@/components/admin/PendingApprovals";
import PendingApplications from "@/components/admin/PendingApplications";
import UserManagement from "@/components/admin/UserManagement";
import CreateUserModal from "@/components/admin/CreateUserModal";
import AdminProfessors from "@/components/admin/AdminProfessors";
import AdminStudents from "@/components/admin/AdminStudents";
import AdminCourses from "@/components/admin/AdminCourses";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type StudentDocument = Database["public"]["Tables"]["student_documents"]["Row"];

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profiles, setProfiles] = useState<(Profile & { documents: StudentDocument[] })[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0, verified: 0, rejected: 0, total: 0,
    pendingApproval: 0, approved: 0, suspended: 0,
  });

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data: hasRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id, _role: "platform_admin",
      });
      if (!hasRole) { navigate("/dashboard"); return; }
      setIsAdmin(true);
      await loadData();
      setLoading(false);
    };
    checkAuthAndAdmin();
  }, [navigate]);

  const loadData = async () => {
    const [profilesRes, docsRes, rolesRes, coursesRes, enrollmentsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("student_documents").select("*").order("uploaded_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("course_enrollments").select("*"),
    ]);

    const profilesData = profilesRes.data || [];
    const documentsData = docsRes.data || [];
    setRoles(rolesRes.data || []);
    setCourses(coursesRes.data || []);
    setEnrollments(enrollmentsRes.data || []);

    const profilesWithDocs = profilesData.map((profile) => ({
      ...profile,
      documents: documentsData.filter((doc) => doc.user_id === profile.user_id),
    }));
    setProfiles(profilesWithDocs);

    const pending = profilesWithDocs.filter((p) => p.verification_status === "pending").length;
    const verified = profilesWithDocs.filter((p) => p.verification_status === "verified").length;
    const rejected = profilesWithDocs.filter((p) => p.verification_status === "rejected").length;
    const pendingApproval = profilesWithDocs.filter((p) => p.account_status === "pending_approval").length;
    const approved = profilesWithDocs.filter((p) => p.account_status === "approved").length;
    const suspended = profilesWithDocs.filter((p) => p.account_status === "suspended").length;

    setStats({ pending, verified, rejected, total: profilesWithDocs.length, pendingApproval, approved, suspended });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
        <Button onClick={() => navigate("/dashboard")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
      </div>
    );
  }

  const professorCount = roles.filter((r) => r.role === "physician" || r.role === "faculty").length;
  const studentCount = roles.filter((r) => r.role === "student").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <img src={livemedLogo} alt="Livemed" style={{ height: '80px', width: 'auto' }} className="object-contain" />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreateUserModal onUserCreated={loadData} />
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, courses, enrollments, and verifications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="professors">Professors ({professorCount})</TabsTrigger>
            <TabsTrigger value="students">Students ({studentCount})</TabsTrigger>
            <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <AdminStats {...stats} />
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Pending Account Approvals</h2>
                <PendingApprovals profiles={profiles.filter(p => p.account_status === "pending_approval")} onRefresh={loadData} />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <UserManagement profiles={profiles} onRefresh={loadData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="professors">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Professors & Faculty</h2>
              <AdminProfessors profiles={profiles} roles={roles} courses={courses} enrollments={enrollments} onTabChange={setActiveTab} />
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Student Management</h2>
              <AdminStudents profiles={profiles} roles={roles} courses={courses} enrollments={enrollments} onRefresh={loadData} />
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Course & Enrollment Management</h2>
              <AdminCourses profiles={profiles} courses={courses} enrollments={enrollments} onRefresh={loadData} />
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Applications</h2>
              <PendingApplications />
            </div>
          </TabsContent>

          <TabsContent value="verifications">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Document Verification Queue</h2>
              <PendingVerifications profiles={profiles} onRefresh={loadData} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
