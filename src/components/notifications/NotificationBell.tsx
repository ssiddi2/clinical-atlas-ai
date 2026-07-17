import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = ({ userId }: { userId: string | null }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 20));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          loadNotifications();
        }
      });

    const onVisible = () => {
      if (document.visibilityState === "visible") loadNotifications();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!userId) return;
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    setOpen(false);
    const link = n.link && n.link.startsWith("/") && !n.link.startsWith("//") ? n.link : "/dashboard";
    navigate(link);
  };

  const parseCourseId = (link: string | null): string | null => {
    if (!link) return null;
    const m = link.match(/\/courses\/([0-9a-fA-F-]{36})/);
    return m ? m[1] : null;
  };

  const isInvitation = (n: Notification) =>
    !!n.link?.includes("invite=1") || /course invitation/i.test(n.title);

  const respondToInvite = async (n: Notification, accept: boolean) => {
    if (!userId) return;
    const courseId = parseCourseId(n.link);
    if (!courseId) {
      toast.error("Invitation link is invalid");
      return;
    }
    setBusyId(n.id);
    const { error } = await supabase
      .from("course_enrollments")
      .update({ status: accept ? "approved" : "declined" })
      .eq("student_id", userId)
      .eq("course_id", courseId)
      .eq("status", "invited");
    setBusyId(null);
    if (error) {
      toast.error(accept ? "Couldn't accept invitation" : "Couldn't decline invitation", {
        description: error.message,
      });
      return;
    }
    await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    toast.success(accept ? "Invitation accepted" : "Invitation declined");
    if (accept) {
      setOpen(false);
      navigate(`/courses/${courseId}`);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-border/50 transition-colors ${
                  !n.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className="flex items-start gap-2 cursor-pointer"
                  onClick={() => handleClick(n)}
                >
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  )}
                  <div className={!n.is_read ? "" : "ml-4"}>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
                {isInvitation(n) && (
                  <div className="flex gap-2 mt-2 ml-4">
                    <Button
                      size="sm"
                      className="h-7 px-3"
                      disabled={busyId === n.id}
                      onClick={(e) => { e.stopPropagation(); respondToInvite(n, true); }}
                    >
                      {busyId === n.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3"
                      disabled={busyId === n.id}
                      onClick={(e) => { e.stopPropagation(); respondToInvite(n, false); }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
