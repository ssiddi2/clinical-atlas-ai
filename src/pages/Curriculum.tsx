import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen, Clock, CheckCircle, ArrowLeft, Loader2, ChevronRight, ChevronDown, Star, GraduationCap,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import { useTranslation } from "@/i18n/LanguageContext";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  instructor_name?: string;
}

interface CourseTopic {
  id: string;
  title: string;
  course_id: string;
  parent_topic_id: string | null;
  sort_order: number;
  is_high_yield: boolean;
}

interface TopicProgress {
  topic_id: string;
  completed: boolean;
  quiz_score: number | null;
}

const Curriculum = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [progress, setProgress] = useState<TopicProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: enrollData } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", user.id)
      .eq("status", "approved");

    const enrolledIds = enrollData?.map(e => e.course_id) || [];
    if (enrolledIds.length === 0) {
      setCourses([]); setTopics([]); setProgress([]);
      return;
    }

    const [coursesRes, topicsRes, progressRes] = await Promise.all([
      supabase.from("courses").select("id, title, description, instructor_id").in("id", enrolledIds),
      supabase.from("course_topics").select("*").in("course_id", enrolledIds).order("sort_order"),
      supabase.from("learning_unit_progress").select("topic_id, completed, quiz_score").eq("student_id", user.id),
    ]);

    const courseList: EnrolledCourse[] = coursesRes.data || [];

    // Fetch instructor names
    const instructorIds = [...new Set(courseList.map(c => c.instructor_id))];
    if (instructorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", instructorIds);
      if (profiles) {
        const nameMap: Record<string, string> = {};
        profiles.forEach(p => { nameMap[p.user_id] = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Professor"; });
        courseList.forEach(c => { c.instructor_name = nameMap[c.instructor_id] || "Professor"; });
      }
    }

    setCourses(courseList);
    if (courseList.length > 0 && !selectedCourse) setSelectedCourse(courseList[0].id);
    setTopics(topicsRes.data || []);
    setProgress(progressRes.data || []);
  };

  const isCompleted = (topicId: string) => progress.find(p => p.topic_id === topicId)?.completed || false;

  const getCourseTopics = (courseId: string) => topics.filter(t => t.course_id === courseId);

  const getCourseProgress = (courseId: string): number => {
    const courseTopics = getCourseTopics(courseId);
    const leafTopics = courseTopics.filter(t => !courseTopics.some(c => c.parent_topic_id === t.id));
    if (leafTopics.length === 0) return 0;
    const completed = leafTopics.filter(t => isCompleted(t.id)).length;
    return Math.round((completed / leafTopics.length) * 100);
  };

  const buildTree = (courseId: string) => {
    const courseTopics = getCourseTopics(courseId);
    const roots = courseTopics.filter(t => !t.parent_topic_id);
    const getChildren = (parentId: string): CourseTopic[] =>
      courseTopics.filter(t => t.parent_topic_id === parentId).sort((a, b) => a.sort_order - b.sort_order);
    return { roots: roots.sort((a, b) => a.sort_order - b.sort_order), getChildren };
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const tree = selectedCourse ? buildTree(selectedCourse) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              <h1 className="font-semibold">{t("curriculum.title")}</h1>
            </div>
          </div>
          <Link to="/dashboard">
            <img src={livemedLogo} alt="Livemed" className="h-10 md:h-16 object-contain" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 md:py-8">
        {courses.length === 0 ? (
          <Card className="bg-card/50 border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No courses enrolled yet. Contact your admin to get enrolled in a course.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Course Selector */}
            <div className="lg:hidden overflow-x-auto pb-4 mb-6 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {courses.map((course) => (
                  <Button key={course.id} variant={selectedCourse === course.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCourse(course.id)} className="whitespace-nowrap">
                    {course.title}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
              {/* Sidebar */}
              <aside className="hidden lg:block lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">My Courses</CardTitle>
                    <CardDescription>Select a course to view curriculum</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {courses.map((course) => {
                      const pct = getCourseProgress(course.id);
                      const courseTopicCount = getCourseTopics(course.id).filter(t => !getCourseTopics(course.id).some(c => c.parent_topic_id === t.id)).length;
                      const completedCount = getCourseTopics(course.id).filter(t => !getCourseTopics(course.id).some(c => c.parent_topic_id === t.id)).filter(t => isCompleted(t.id)).length;
                      return (
                        <button key={course.id} onClick={() => setSelectedCourse(course.id)} className={`w-full text-left p-3 rounded-lg transition-all ${selectedCourse === course.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                          <div className="font-medium text-sm truncate">{course.title}</div>
                          <div className="text-xs opacity-70 mt-1">{completedCount}/{courseTopicCount} topics • {course.instructor_name}</div>
                          {courseTopicCount > 0 && <Progress value={pct} className="h-1 mt-2" />}
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </aside>

              {/* Main Content */}
              <main className="lg:col-span-3">
                {selectedCourseData && tree && (
                  <>
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl gradient-livemed flex items-center justify-center">
                          <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedCourseData.title}</h2>
                          <p className="text-muted-foreground">{selectedCourseData.description || "Course curriculum"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /><span>{tree.roots.length} systems</span></div>
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /><span>{getCourseProgress(selectedCourseData.id)}% complete</span></div>
                        <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent" /><span>{selectedCourseData.instructor_name}</span></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {tree.roots.map((root) => (
                        <TopicNode key={root.id} topic={root} getChildren={tree.getChildren} allTopics={getCourseTopics(selectedCourseData.id)} progress={progress} courseId={selectedCourseData.id} depth={0} />
                      ))}
                      {tree.roots.length === 0 && (
                        <Card className="bg-card/50 border-border/30">
                          <CardContent className="py-12 text-center text-muted-foreground">
                            No curriculum topics have been added to this course yet.
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface TopicNodeProps {
  topic: CourseTopic;
  getChildren: (parentId: string) => CourseTopic[];
  allTopics: CourseTopic[];
  progress: TopicProgress[];
  courseId: string;
  depth: number;
}

const TopicNode = ({ topic, getChildren, allTopics, progress, courseId, depth }: TopicNodeProps) => {
  const [open, setOpen] = useState(depth < 1);
  const children = getChildren(topic.id);
  const isLeaf = children.length === 0;
  const completed = progress.find(p => p.topic_id === topic.id)?.completed || false;
  const score = progress.find(p => p.topic_id === topic.id)?.quiz_score;

  // Calculate progress for non-leaf nodes
  const getSubtreeLeaves = (topicId: string): CourseTopic[] => {
    const kids = allTopics.filter(t => t.parent_topic_id === topicId);
    if (kids.length === 0) return [allTopics.find(t => t.id === topicId)!].filter(Boolean);
    return kids.flatMap(k => getSubtreeLeaves(k.id));
  };

  const leaves = isLeaf ? [] : getSubtreeLeaves(topic.id);
  const completedLeaves = leaves.filter(l => progress.find(p => p.topic_id === l.id)?.completed);
  const nodePct = leaves.length > 0 ? Math.round((completedLeaves.length / leaves.length) * 100) : 0;

  if (isLeaf) {
    return (
      <Link to={`/courses/${courseId}/topic/${topic.id}`}>
        <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group" style={{ marginLeft: depth * 16 }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
              {completed ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm group-hover:text-accent transition-colors truncate">{topic.title}</span>
                {topic.is_high_yield && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">HY</Badge>}
              </div>
              {score !== null && score !== undefined && (
                <span className="text-xs text-muted-foreground">Score: {score}%</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card style={{ marginLeft: depth * 16 }} className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            {open ? <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{topic.title}</span>
                {topic.is_high_yield && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">HY</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{completedLeaves.length}/{leaves.length}</span>
              </div>
              {leaves.length > 0 && <Progress value={nodePct} className="h-1 mt-2 max-w-xs" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-2 px-2 space-y-2">
          {children.map(child => (
            <TopicNode key={child.id} topic={child} getChildren={getChildren} allTopics={allTopics} progress={progress} courseId={courseId} depth={depth + 1} />
          ))}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default Curriculum;
