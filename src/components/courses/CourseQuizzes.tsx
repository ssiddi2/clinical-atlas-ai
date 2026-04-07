import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ClipboardCheck, Eye, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface CourseQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  status: string;
  created_at: string;
}

interface CourseQuizzesProps {
  courseId: string;
  isInstructor: boolean;
}

const CourseQuizzes = ({ courseId, isInstructor }: CourseQuizzesProps) => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const loadQuizzes = async () => {
    const { data } = await supabase
      .from("course_quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (data) {
      setQuizzes(data.map((q: any) => ({
        ...q,
        questions: (q.questions as any) || [],
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadQuizzes(); }, [courseId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-course-quiz", {
        body: { course_id: courseId },
      });
      if (error) throw error;
      toast({ title: "Quiz generated!", description: `${data.question_count} questions created.` });
      loadQuizzes();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (quizId: string) => {
    await supabase.from("course_quizzes").update({ status: "published" }).eq("id", quizId);

    // Notify enrolled students
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("student_id")
      .eq("course_id", courseId)
      .eq("status", "approved");

    if (enrollments && enrollments.length > 0) {
      const quiz = quizzes.find(q => q.id === quizId);
      const notifications = enrollments.map((e) => ({
        user_id: e.student_id,
        type: "quiz_published",
        title: "New quiz available",
        message: `"${quiz?.title || 'Quiz'}" is now available in your course.`,
        link: `/courses/${courseId}`,
      }));
      await supabase.from("notifications").insert(notifications);
    }

    toast({ title: "Quiz published" });
    loadQuizzes();
  };

  const startQuiz = (quizId: string) => {
    setActiveQuiz(quizId);
    setAnswers({});
    setSubmitted(false);
  };

  const submitQuiz = () => setSubmitted(true);

  const quiz = quizzes.find(q => q.id === activeQuiz);

  if (activeQuiz && quiz) {
    const score = submitted
      ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_answer_index ? 1 : 0), 0)
      : 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{quiz.title}</h3>
          <Button variant="outline" size="sm" onClick={() => setActiveQuiz(null)}>Back to Quizzes</Button>
        </div>

        {submitted && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{score}/{quiz.questions.length}</p>
              <p className="text-sm text-muted-foreground">
                {Math.round((score / quiz.questions.length) * 100)}% correct
              </p>
            </CardContent>
          </Card>
        )}

        {quiz.questions.map((q, qi) => (
          <Card key={qi} className="bg-card/50">
            <CardContent className="p-4 space-y-3">
              <p className="font-medium text-sm">
                <span className="text-muted-foreground mr-2">Q{qi + 1}.</span>
                {q.stem}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let cls = "p-2.5 rounded-lg border cursor-pointer text-sm transition-colors ";
                  if (submitted) {
                    if (oi === q.correct_answer_index) cls += "border-green-500 bg-green-500/10 ";
                    else if (answers[qi] === oi) cls += "border-destructive bg-destructive/10 ";
                    else cls += "border-border opacity-50 ";
                  } else {
                    cls += answers[qi] === oi ? "border-primary bg-primary/10 " : "border-border hover:border-primary/50 ";
                  }
                  return (
                    <div
                      key={oi}
                      className={cls}
                      onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                    >
                      <span className="font-medium mr-2 text-muted-foreground">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </div>
                  );
                })}
              </div>
              {submitted && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {!submitted && (
          <Button onClick={submitQuiz} className="w-full" disabled={Object.keys(answers).length < quiz.questions.length}>
            <Send className="h-4 w-4 mr-2" /> Submit Answers
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {isInstructor && (
        <Button onClick={handleGenerate} disabled={generating} variant="outline">
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? "Generating quiz with AI..." : "Generate Quiz from Materials"}
        </Button>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No quizzes available</p>
        </div>
      ) : (
        quizzes.map((q) => (
          <Card key={q.id} className="bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">{q.title}</p>
                <p className="text-xs text-muted-foreground">
                  {q.questions.length} questions • {new Date(q.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={q.status === "published" ? "default" : "secondary"} className="capitalize">
                {q.status}
              </Badge>
              {isInstructor && q.status === "draft" && (
                <Button size="sm" variant="outline" onClick={() => handlePublish(q.id)}>Publish</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => startQuiz(q.id)}>
                <Eye className="h-3.5 w-3.5 mr-1" /> {isInstructor ? "Preview" : "Take Quiz"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CourseQuizzes;
