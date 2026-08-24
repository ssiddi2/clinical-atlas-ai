import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppShell from "@/components/layout/AppShell";
import MediaLibraryReview from "@/components/admin/MediaLibraryReview";
import { Loader2, Images } from "lucide-react";

const MediaLibrary = () => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      const ok = (roles ?? []).some((r) =>
        ["physician", "faculty", "platform_admin"].includes(r.role as string),
      );
      if (!active) return;
      if (!ok) {
        navigate("/dashboard");
        return;
      }
      setAllowed(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (allowed === null) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="container py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Images className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Teaching Media Library</h1>
            <p className="text-sm text-muted-foreground">
              Approve the images ATLAS is allowed to teach with.
            </p>
          </div>
        </div>
        <div className="lm-card p-6">
          <MediaLibraryReview />
        </div>
      </main>
    </AppShell>
  );
};

export default MediaLibrary;
