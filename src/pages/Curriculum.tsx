import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Brain,
  Heart,
  Stethoscope,
  Wind,
  Zap,
  Droplet,
  Users,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  content_type: string;
  sort_order: number;
  specialty_id: string;
}

interface ModuleProgress {
  module_id: string;
  progress_percent: number;
  completed_at: string | null;
}

const iconMap: { [key: string]: React.ElementType } = {
  stethoscope: Stethoscope,
  activity: Activity,
  "alert-circle": AlertCircle,
  heart: Heart,
  wind: Wind,
  brain: Brain,
  circle: BookOpen,
  droplet: Droplet,
  zap: Zap,
  users: Users,
};

const Curriculum = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    // Load specialties
    const { data: specialtiesData } = await supabase
      .from("specialties")
      .select("*")
      .order("sort_order");

    if (specialtiesData) {
      setSpecialties(specialtiesData);
      if (specialtiesData.length > 0 && !selectedSpecialty) {
        setSelectedSpecialty(specialtiesData[0].id);
      }
    }

    // Load all modules
    const { data: modulesData } = await supabase
      .from("modules")
      .select("*")
      .order("sort_order");

    if (modulesData) {
      setModules(modulesData);
    }

    // Load user progress
    const { data: progressData } = await supabase
      .from("user_module_progress")
      .select("*");

    if (progressData) {
      setProgress(progressData);
    }
  };

  const getModuleProgress = (moduleId: string): number => {
    const p = progress.find((p) => p.module_id === moduleId);
    return p?.progress_percent || 0;
  };

  const isModuleCompleted = (moduleId: string): boolean => {
    const p = progress.find((p) => p.module_id === moduleId);
    return p?.completed_at !== null && p?.completed_at !== undefined;
  };

  const getSpecialtyProgress = (specialtyId: string): number => {
    const specialtyModules = modules.filter((m) => m.specialty_id === specialtyId);
    if (specialtyModules.length === 0) return 0;

    const totalProgress = specialtyModules.reduce((acc, m) => {
      return acc + getModuleProgress(m.id);
    }, 0);

    return Math.round(totalProgress / specialtyModules.length);
  };

  const getCompletedModulesCount = (specialtyId: string): number => {
    const specialtyModules = modules.filter((m) => m.specialty_id === specialtyId);
    return specialtyModules.filter((m) => isModuleCompleted(m.id)).length;
  };

  const filteredModules = selectedSpecialty
    ? modules.filter((m) => m.specialty_id === selectedSpecialty)
    : modules;

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
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              <h1 className="font-semibold">Curriculum</h1>
            </div>
          </div>
          <Link to="/dashboard">
            <img src={livemedLogo} alt="LIVEMED" style={{ height: '80px', width: 'auto' }} className="object-contain" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Specialties */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Specialties</CardTitle>
                <CardDescription>Select a specialty to view modules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {specialties.map((specialty) => {
                  const Icon = iconMap[specialty.icon] || BookOpen;
                  const progressPercent = getSpecialtyProgress(specialty.id);
                  const completedCount = getCompletedModulesCount(specialty.id);
                  const totalModules = modules.filter((m) => m.specialty_id === specialty.id).length;

                  return (
                    <button
                      key={specialty.id}
                      onClick={() => setSelectedSpecialty(specialty.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedSpecialty === specialty.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {specialty.name}
                          </div>
                          <div className="text-xs opacity-70">
                            {completedCount}/{totalModules} modules
                          </div>
                        </div>
                      </div>
                      {totalModules > 0 && (
                        <Progress value={progressPercent} className="h-1 mt-2" />
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Modules */}
          <main className="lg:col-span-3">
            {selectedSpecialty && (
              <>
                {/* Specialty Header */}
                {(() => {
                  const specialty = specialties.find((s) => s.id === selectedSpecialty);
                  if (!specialty) return null;
                  const Icon = iconMap[specialty.icon] || BookOpen;
                  
                  return (
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl gradient-livemed flex items-center justify-center">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{specialty.name}</h2>
                          <p className="text-muted-foreground">{specialty.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-accent" />
                          <span>{filteredModules.length} modules</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-accent" />
                          <span>
                            {filteredModules.reduce((acc, m) => acc + m.duration_minutes, 0)} min total
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span>{getSpecialtyProgress(selectedSpecialty)}% complete</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Module List */}
                <Tabs defaultValue="all">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All Modules</TabsTrigger>
                    <TabsTrigger value="lessons">Lessons</TabsTrigger>
                    <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {filteredModules.map((module, idx) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        index={idx + 1}
                        progress={getModuleProgress(module.id)}
                        completed={isModuleCompleted(module.id)}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="lessons" className="space-y-4">
                    {filteredModules
                      .filter((m) => m.content_type === "lesson")
                      .map((module, idx) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          index={idx + 1}
                          progress={getModuleProgress(module.id)}
                          completed={isModuleCompleted(module.id)}
                        />
                      ))}
                  </TabsContent>

                  <TabsContent value="quizzes" className="space-y-4">
                    {filteredModules
                      .filter((m) => m.content_type === "quiz")
                      .map((module, idx) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          index={idx + 1}
                          progress={getModuleProgress(module.id)}
                          completed={isModuleCompleted(module.id)}
                        />
                      ))}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

interface ModuleCardProps {
  module: Module;
  index: number;
  progress: number;
  completed: boolean;
}

const ModuleCard = ({ module, index, progress, completed }: ModuleCardProps) => {
  const isQuiz = module.content_type === "quiz";

  return (
    <Link to={`/curriculum/${module.id}`}>
      <Card className="hover:shadow-livemed transition-all duration-300 hover:-translate-y-1 group">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Index */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              completed
                ? "bg-livemed-success text-white"
                : progress > 0
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {completed ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <span className="font-semibold">{index}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold group-hover:text-accent transition-colors truncate">
                {module.title}
              </h3>
              <Badge variant={isQuiz ? "default" : "secondary"} className="flex-shrink-0">
                {isQuiz ? "Quiz" : "Lesson"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {module.description}
            </p>
            {progress > 0 && !completed && (
              <Progress value={progress} className="h-1 mt-2 max-w-xs" />
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{module.duration_minutes} min</span>
            </div>
            <Button variant="ghost" size="icon" className="group-hover:bg-accent group-hover:text-accent-foreground">
              <PlayCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Curriculum;
