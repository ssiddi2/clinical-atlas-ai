import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ListChecks, BookOpen, Video, FileText, HelpCircle, BarChart3, Bot, Settings } from "lucide-react";
import LearningUnitSession from "@/components/learning-unit/LearningUnitSession";
import LearningUnitOverview from "@/components/learning-unit/LearningUnitOverview";
import LearningUnitLectures from "@/components/learning-unit/LearningUnitLectures";
import LearningUnitMaterials from "@/components/learning-unit/LearningUnitMaterials";
import LearningUnitQuestions from "@/components/learning-unit/LearningUnitQuestions";
import LearningUnitProgress from "@/components/learning-unit/LearningUnitProgress";
import LearningUnitSettings from "@/components/learning-unit/LearningUnitSettings";
import AppShell from "@/components/layout/AppShell";

export default function LearningUnitPage() {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !courseId || !topicId) return;

      const [topicRes, courseRes] = await Promise.all([
        supabase.from("course_topics").select("*").eq("id", topicId).single(),
        supabase.from("courses").select("*").eq("id", courseId).single(),
      ]);

      if (topicRes.data) setTopic(topicRes.data);
      if (courseRes.data) {
        setCourse(courseRes.data);
        setIsInstructor(courseRes.data.instructor_id === user.id);
      }
      setLoading(false);
    };
    load();
  }, [courseId, topicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Topic not found</p>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/courses/${courseId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{course.title}</p>
              <h1 className="text-xl font-bold text-foreground truncate">{topic.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="session">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="session" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Session
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="lectures" className="gap-1.5">
              <Video className="h-3.5 w-3.5" /> Lectures
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Materials
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> Questions
            </TabsTrigger>
            {isInstructor && (
              <>
                <TabsTrigger value="performance" className="gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" /> Student Performance
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings className="h-3.5 w-3.5" /> Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="session">
            <LearningUnitSession topicId={topicId!} isInstructor={isInstructor} />
          </TabsContent>
          <TabsContent value="overview">
            <LearningUnitOverview topicId={topicId!} courseId={courseId!} isInstructor={isInstructor} />
          </TabsContent>
          <TabsContent value="lectures">
            <LearningUnitLectures topicId={topicId!} courseId={courseId!} isInstructor={isInstructor} />
          </TabsContent>
          <TabsContent value="materials">
            <LearningUnitMaterials topicId={topicId!} courseId={courseId!} isInstructor={isInstructor} />
          </TabsContent>
          <TabsContent value="questions">
            <LearningUnitQuestions topicId={topicId!} courseId={courseId!} isInstructor={isInstructor} />
          </TabsContent>
          {isInstructor && (
            <>
              <TabsContent value="performance">
                <LearningUnitProgress topicId={topicId!} courseId={courseId!} />
              </TabsContent>
              <TabsContent value="settings">
                <LearningUnitSettings topicId={topicId!} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
}
