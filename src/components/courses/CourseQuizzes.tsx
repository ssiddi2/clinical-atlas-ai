import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ClipboardCheck, Eye, Send, Edit2, Plus, Trash2, Check, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty?: string;
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
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [editQuestions, setEditQuestions] = useState<QuizQuestion[]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const startTimeRef = useRef<number>(0);

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

  // ---- QUIZ EDITOR ----
  const startEditing = (quiz: CourseQuiz) => {
    setEditingQuiz(quiz.id);
    setEditTitle(quiz.title);
    setEditQuestions(JSON.parse(JSON.stringify(quiz.questions)));
  };

  const updateQuestion = (idx: number, field: keyof QuizQuestion, value: any) => {
    setEditQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setEditQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const addQuestion = () => {
    setEditQuestions(prev => [...prev, {
      stem: "",
      options: ["", "", "", ""],
      correct_answer_index: 0,
      explanation: "",
      difficulty: "medium",
    }]);
  };

  const deleteQuestion = (idx: number) => {
    setEditQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const saveQuiz = async () => {
    setSaving(true);
    const { error } = await supabase.from("course_quizzes").update({
      title: editTitle,
      questions: editQuestions as any,
    }).eq("id", editingQuiz!);
    setSaving(false);
    if (!error) {
      toast({ title: "Quiz saved" });
      setEditingQuiz(null);
      loadQuizzes();
    } else {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    }
  };

  // ---- QUIZ TAKING (with persistence) ----
  const startQuiz = (quizId: string) => {
    setActiveQuiz(quizId);
    setAnswers({});
    setSubmitted(false);
    startTimeRef.current = Date.now();
  };

  const submitQuiz = async () => {
    setSubmitted(true);
    const quiz = quizzes.find(q => q.id === activeQuiz);
    if (!quiz) return;

    const score = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_answer_index ? 1 : 0), 0);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Persist attempt
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("course_quiz_attempts").insert({
        quiz_id: activeQuiz!,
        student_id: user.id,
        answers: answers as any,
        score,
        total_questions: quiz.questions.length,
        time_taken_seconds: timeTaken,
      });
    }
  };

  // ---- RENDER: Quiz Editor ----
  if (editingQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-semibold max-w-md" />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveQuiz} disabled={saving} className="gradient-livemed">
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingQuiz(null)}>Cancel</Button>
          </div>
        </div>

        {editQuestions.map((q, qi) => (
          <Card key={qi} className="bg-card/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Question {qi + 1}</span>
                <div className="flex items-center gap-2">
                  <Select value={q.difficulty || "medium"} onValueChange={v => updateQuestion(qi, "difficulty", v)}>
                    <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteQuestion(qi)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={q.stem}
                onChange={e => updateQuestion(qi, "stem", e.target.value)}
                placeholder="Question stem..."
                rows={2}
                className="text-sm"
              />
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qi, "correct_answer_index", oi)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                        q.correct_answer_index === oi
                          ? "border-green-500 bg-green-500/20 text-green-400"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </button>
                    <Input
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      className="h-8 text-sm"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                  </div>
                ))}
              </div>
              <Textarea
                value={q.explanation}
                onChange={e => updateQuestion(qi, "explanation", e.target.value)}
                placeholder="Explanation for correct answer..."
                rows={2}
                className="text-sm"
              />
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-2" /> Add Question
        </Button>
      </div>
    );
  }

  // ---- RENDER: Quiz Taking ----
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
                    <div key={oi} className={cls} onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}>
                      <span className="font-medium mr-2 text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
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

  // ---- RENDER: Quiz List ----
  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {isInstructor && (
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={generating} variant="outline">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {generating ? "Generating quiz with AI..." : "Generate Quiz from Materials"}
          </Button>
          <Button variant="outline" onClick={() => {
            // Create a new empty quiz for manual creation
            const createManualQuiz = async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              const { data, error } = await supabase.from("course_quizzes").insert({
                course_id: courseId,
                title: "New Quiz",
                questions: [],
                created_by: user.id,
                status: "draft",
              }).select().single();
              if (data && !error) {
                loadQuizzes();
                startEditing({ id: data.id, title: data.title, questions: [], status: "draft", created_at: data.created_at });
              }
            };
            createManualQuiz();
          }}>
            <Plus className="h-4 w-4 mr-2" /> Create Manual Quiz
          </Button>
        </div>
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
              <Badge variant={q.status === "published" ? "default" : "secondary"} className="capitalize">{q.status}</Badge>
              {isInstructor && (
                <Button size="sm" variant="ghost" onClick={() => startEditing(q)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
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
