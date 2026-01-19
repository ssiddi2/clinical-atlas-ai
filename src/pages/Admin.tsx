import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import AdminStats from "@/components/admin/AdminStats";
import PendingVerifications from "@/components/admin/PendingVerifications";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type StudentDocument = Database["public"]["Tables"]["student_documents"]["Row"];

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<(Profile & { documents: StudentDocument[] })[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Check if user has platform_admin role
      const { data: hasRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "platform_admin",
      });

      if (!hasRole) {
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadData();
      setLoading(false);
    };

    checkAuthAndAdmin();
  }, [navigate]);

  const loadData = async () => {
    // Fetch all profiles (admin can see all)
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    // Fetch all documents (admin can see all)
    const { data: documentsData, error: documentsError } = await supabase
      .from("student_documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      return;
    }

    // Combine profiles with their documents
    const profilesWithDocs = (profilesData || []).map((profile) => ({
      ...profile,
      documents: (documentsData || []).filter((doc) => doc.user_id === profile.user_id),
    }));

    setProfiles(profilesWithDocs);

    // Calculate stats
    const pending = profilesWithDocs.filter((p) => p.verification_status === "pending").length;
    const verified = profilesWithDocs.filter((p) => p.verification_status === "verified").length;
    const rejected = profilesWithDocs.filter((p) => p.verification_status === "rejected").length;

    setStats({
      pending,
      verified,
      rejected,
      total: profilesWithDocs.length,
    });
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
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this page.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <img src={livemedLogo} alt="LIVEMED" style={{ height: '80px', width: 'auto' }} className="object-contain" />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </div>
          </div>

          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Verification</h1>
          <p className="text-muted-foreground">
            Review and manage student verification requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <AdminStats {...stats} />
        </div>

        {/* Verification Queue */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Verification Queue</h2>
          <PendingVerifications profiles={profiles} onRefresh={loadData} />
        </div>
      </main>
    </div>
  );
};

export default Admin;
