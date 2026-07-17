import { useEffect, useState, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useTranslation } from "@/i18n";
import livemedLogoAsset from "@/assets/livemed-logo-light.png.asset.json";

const livemedLogo = livemedLogoAsset.url;

interface AppShellProps {
  children?: ReactNode;
  /** When true, renders only the header (no wrapping div). Useful for pages that manage their own layout. */
  headerOnly?: boolean;
}

/**
 * Shared authenticated top navigation used across every student-facing page.
 * Renders: logo → Curriculum link → ATLAS™ pill · Admin (if platform_admin) · Notifications · Settings · Avatar menu.
 */
const AppShell = ({ children, headerOnly = false }: AppShellProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (u: User | null) => {
      if (!mounted) return;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "platform_admin" });
      if (mounted) setIsAdmin(!!data);
    };

    supabase.auth.getSession().then(({ data }) => bootstrap(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      bootstrap(session?.user ?? null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const firstName = user?.user_metadata?.first_name || "Student";

  const header = (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6 flex h-14 items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center" aria-label="Livemed Academy — Dashboard">
            <img src={livemedLogo} alt="Livemed Academy" className="h-8 object-contain" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="text-primary rounded-full"
            >
              <ShieldCheck className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">{t("dashboard.admin")}</span>
            </Button>
          )}
          <div className="rounded-full bg-muted/60 hover:bg-muted transition-colors">
            <NotificationBell userId={user?.id || null} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Profile settings"
            onClick={() => navigate("/profile")}
            className="rounded-full bg-muted/60 hover:bg-muted text-foreground/80"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account menu"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs font-semibold">
                    {firstName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{firstName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );

  if (headerOnly) return header;

  return (
    <div className="min-h-screen bg-background">
      {header}
      {children}
    </div>
  );
};

export default AppShell;