import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Play,
  Globe,
  Stethoscope,
  GraduationCap,
  Award,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import { format, parseISO, isAfter, isBefore, addHours } from "date-fns";

interface RotationSession {
  id: string;
  title: string;
  description: string | null;
  specialty_id: string | null;
  physician_name: string;
  physician_credentials: string | null;
  physician_institution: string | null;
  physician_avatar_url: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  max_participants: number | null;
}

interface Enrollment {
  id: string;
  session_id: string;
  enrolled_at: string;
}

interface Specialty {
  id: string;
  name: string;
  color: string | null;
}

const VirtualRounds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<RotationSession[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    const [sessionsRes, enrollmentsRes, specialtiesRes] = await Promise.all([
      supabase
        .from("rotation_sessions")
        .select("*")
        .in("status", ["upcoming", "live"])
        .order("scheduled_start", { ascending: true }),
      supabase
        .from("rotation_enrollments")
        .select("*")
        .eq("user_id", user?.id),
      supabase
        .from("specialties")
        .select("*")
        .order("sort_order"),
    ]);

    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
    if (specialtiesRes.data) setSpecialties(specialtiesRes.data);

    setLoading(false);
  };

  const handleEnroll = async (sessionId: string) => {
    if (!user) return;
    
    setEnrollingId(sessionId);

    const { error } = await supabase
      .from("rotation_enrollments")
      .insert({
        session_id: sessionId,
        user_id: user.id,
      });

    if (error) {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Enrolled successfully!",
        description: "You'll receive a reminder before the session starts.",
      });
      loadData();
    }

    setEnrollingId(null);
  };

  const isEnrolled = (sessionId: string) => {
    return enrollments.some((e) => e.session_id === sessionId);
  };

  const isSessionLive = (session: RotationSession) => {
    const now = new Date();
    const start = parseISO(session.scheduled_start);
    const end = parseISO(session.scheduled_end);
    return isAfter(now, start) && isBefore(now, end);
  };

  const isSessionSoon = (session: RotationSession) => {
    const now = new Date();
    const start = parseISO(session.scheduled_start);
    return isAfter(start, now) && isBefore(start, addHours(now, 1));
  };

  const filteredSessions = selectedSpecialty
    ? sessions.filter((s) => s.specialty_id === selectedSpecialty)
    : sessions;

  const getSpecialtyName = (id: string | null) => {
    if (!id) return "General";
    return specialties.find((s) => s.id === id)?.name || "General";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold">Live Virtual Rounds</h1>
              <p className="text-xs text-muted-foreground">Join real-time telemedicine rounds with US physicians</p>
            </div>
          </div>
          <Link to="/dashboard">
            <img src={livemedLogo} alt="LIVEMED" style={{ height: '80px', width: 'auto' }} className="object-contain" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="mb-8 p-6 rounded-2xl gradient-livemed text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Video className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Live Telemedicine Rounds</h2>
              <p className="text-white/80 mb-4">
                Join US physicians as they round on real patients via telemedicine at major academic hospitals. 
                Experience authentic clinical decision-making, participate in case discussions, and receive 
                evaluations that count toward your clinical portfolio.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>US Academic Hospitals</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4" />
                  <span>Faculty-Led Sessions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4" />
                  <span>Earn Clinical Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specialty Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Filter by Specialty</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSpecialty === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(null)}
            >
              All Specialties
            </Button>
            {specialties.map((specialty) => (
              <Button
                key={specialty.id}
                variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty.id)}
              >
                {specialty.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
              <p className="text-muted-foreground mb-4">
                {selectedSpecialty 
                  ? "No sessions scheduled for this specialty. Try selecting a different specialty or check back later."
                  : "No live sessions are currently scheduled. Check back soon for new rounds with US physicians."}
              </p>
              <Button variant="outline" asChild>
                <Link to="/rotation-experience">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Practice with Simulated Cases
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const live = isSessionLive(session);
              const soon = isSessionSoon(session);
              const enrolled = isEnrolled(session.id);
              
              return (
                <Card 
                  key={session.id} 
                  className={`relative overflow-hidden ${live ? "border-accent shadow-livemed" : ""}`}
                >
                  {/* Live Badge */}
                  {live && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white mr-1.5 inline-block" />
                        LIVE NOW
                      </Badge>
                    </div>
                  )}
                  {soon && !live && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary">Starting Soon</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {session.physician_avatar_url ? (
                          <img 
                            src={session.physician_avatar_url} 
                            alt={session.physician_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-6 w-6 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{session.physician_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.physician_credentials}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.physician_institution}
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    {session.description && (
                      <CardDescription className="line-clamp-2">
                        {session.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(parseISO(session.scheduled_start), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(parseISO(session.scheduled_start), "h:mm a")} - {format(parseISO(session.scheduled_end), "h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>{getSpecialtyName(session.specialty_id)}</span>
                      </div>
                    </div>

                    {enrolled ? (
                      live ? (
                        <Button className="w-full bg-red-500 hover:bg-red-600">
                          <Play className="mr-2 h-4 w-4" />
                          Join Live Session
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                          Enrolled
                        </Button>
                      )
                    ) : (
                      <Button 
                        className="w-full gradient-livemed" 
                        onClick={() => handleEnroll(session.id)}
                        disabled={enrollingId === session.id}
                      >
                        {enrollingId === session.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Video className="mr-2 h-4 w-4" />
                        )}
                        Enroll in Session
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* My Enrolled Sessions */}
        {enrollments.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">My Enrolled Sessions</h2>
            <div className="space-y-3">
              {sessions
                .filter((s) => isEnrolled(s.id))
                .map((session) => {
                  const live = isSessionLive(session);
                  return (
                    <Card key={session.id} className={live ? "border-accent" : ""}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(session.scheduled_start), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        {live ? (
                          <Button size="sm" className="bg-red-500 hover:bg-red-600">
                            <Play className="mr-2 h-4 w-4" />
                            Join Now
                          </Button>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            Upcoming
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Practice Cases CTA */}
        <div className="mt-12">
          <Card className="bg-muted/50">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Want to practice between sessions?</h3>
                  <p className="text-sm text-muted-foreground">
                    Work through simulated clinical cases and get AI-powered feedback
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/rotation-experience">
                  Practice Cases
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualRounds;
