import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import LessonContentRenderer from "@/components/lesson/LessonContentRenderer";
import {
  BookOpen,
  Brain,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  MessageSquare,
  Award,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

interface Module {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  content_type: string;
  specialty_id: string;
}

interface LessonSection {
  id: string;
  section_order: number;
  section_title: string;
  content_type: string;
  content_text: string | null;
  media_url: string | null;
  media_caption: string | null;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_image_url: string | null;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: string;
  sort_order: number;
}

// Fallback lesson content when database content is empty
const getFallbackLessonContent = (title: string): LessonSection[] => {
  return [
    {
      id: "1",
      section_order: 0,
      section_title: "Overview",
      content_type: "text",
      content_text: `This module covers the essential concepts of ${title}. Understanding these fundamentals is critical for clinical practice and USMLE success.`,
      media_url: null,
      media_caption: null,
    },
    {
      id: "2",
      section_order: 1,
      section_title: "Pathophysiology",
      content_type: "text",
      content_text: `The underlying mechanisms involve complex interactions between cellular, molecular, and systemic factors. Key pathways include inflammatory cascades, hemodynamic changes, and compensatory mechanisms that ultimately determine disease progression and clinical presentation.`,
      media_url: null,
      media_caption: null,
    },
    {
      id: "3",
      section_order: 2,
      section_title: "Clinical Presentation",
      content_type: "text",
      content_text: `Patients typically present with a constellation of symptoms that reflect the underlying pathology. A thorough history and physical examination are essential for accurate diagnosis and risk stratification.`,
      media_url: null,
      media_caption: null,
    },
    {
      id: "4",
      section_order: 3,
      section_title: "Remember This",
      content_type: "clinical_pearl",
      content_text: `Always consider the differential diagnosis and risk stratify early. The clinical presentation may be subtle, especially in elderly or immunocompromised patients.`,
      media_url: null,
      media_caption: null,
    },
    {
      id: "5",
      section_order: 4,
      section_title: "Key Takeaways",
      content_type: "key_points",
      content_text: `Always consider the differential diagnosis
Risk stratification guides management intensity
Monitor for complications and treatment response
Patient education improves outcomes
Follow guideline-directed medical therapy when applicable`,
      media_url: null,
      media_caption: null,
    },
  ];
};

// Fallback quiz questions when database content is empty
const getFallbackQuizQuestions = (title: string): QuizQuestion[] => {
  return [
    {
      id: "1",
      question_text: `A 65-year-old patient presents with progressive symptoms. Physical examination reveals key findings consistent with the pathology covered in "${title}". What is the most appropriate initial diagnostic test?`,
      question_image_url: null,
      options: ["Complete blood count", "Electrocardiogram", "Chest X-ray", "Basic metabolic panel"],
      correct_answer_index: 1,
      explanation: "An ECG is often the first-line diagnostic test as it provides rapid, non-invasive information about cardiac function and rhythm.",
      difficulty: "medium",
      sort_order: 0,
    },
    {
      id: "2",
      question_text: "Which of the following mechanisms is most directly involved in the pathophysiology of this condition?",
      question_image_url: null,
      options: ["Increased systemic vascular resistance", "Decreased cardiac output", "Impaired oxygen delivery", "All of the above"],
      correct_answer_index: 3,
      explanation: "The pathophysiology is multifactorial and involves complex interactions between hemodynamic changes, tissue perfusion, and compensatory mechanisms.",
      difficulty: "medium",
      sort_order: 1,
    },
    {
      id: "3",
      question_text: "Which parameter should be monitored most closely during treatment initiation?",
      question_image_url: null,
      options: ["Blood pressure", "Heart rate", "Renal function", "All of the above"],
      correct_answer_index: 3,
      explanation: "Careful monitoring of multiple parameters is essential when initiating therapy.",
      difficulty: "easy",
      sort_order: 2,
    },
  ];
};

const ModuleView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<Module | null>(null);
  const [lessonSections, setLessonSections] = useState<LessonSection[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const isQuiz = module?.content_type === "quiz";

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
    if (user && moduleId) {
      loadModule();
    }
  }, [user, moduleId]);

  const loadModule = async () => {
    setLoading(true);
    
    const { data: moduleData, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .maybeSingle();

    if (error || !moduleData) {
      toast({
        title: "Module not found",
        description: "The requested module could not be loaded.",
        variant: "destructive",
      });
      navigate("/curriculum");
      return;
    }

    setModule(moduleData);

    // Load lesson content from database
    const { data: lessonData } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("module_id", moduleId)
      .order("section_order", { ascending: true });

    if (lessonData && lessonData.length > 0) {
      setLessonSections(lessonData);
    } else {
      // Use fallback content if no database content exists
      setLessonSections(getFallbackLessonContent(moduleData.title));
    }

    // Load quiz questions from database
    const { data: quizData } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order", { ascending: true });

    if (quizData && quizData.length > 0) {
      // Parse the JSONB options field
      const parsedQuestions = quizData.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
      }));
      setQuizQuestions(parsedQuestions as QuizQuestion[]);
    } else {
      // Use fallback questions if no database content exists
      setQuizQuestions(getFallbackQuizQuestions(moduleData.title));
    }

    // Load existing progress
    const { data: progressData } = await supabase
      .from("user_module_progress")
      .select("*")
      .eq("module_id", moduleId)
      .eq("user_id", user?.id)
      .maybeSingle();

    if (progressData) {
      setProgress(progressData.progress_percent || 0);
    }

    setLoading(false);
  };

  const updateProgress = async (newProgress: number) => {
    if (!user || !moduleId) return;

    const { error } = await supabase
      .from("user_module_progress")
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        progress_percent: newProgress,
        last_accessed_at: new Date().toISOString(),
        completed_at: newProgress >= 100 ? new Date().toISOString() : null,
      });

    if (!error) {
      setProgress(newProgress);
    }
  };

  const handleNextSection = () => {
    if (lessonSections.length > 0 && currentSection < lessonSections.length - 1) {
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      const newProgress = Math.round(((nextSection + 1) / lessonSections.length) * 100);
      updateProgress(newProgress);
    } else {
      updateProgress(100);
      toast({
        title: "Module Complete! 🎉",
        description: "Great work! You've completed this lesson.",
      });
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = quizQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct_answer_index;

    setAnswers([
      ...answers,
      { questionId: question.id, selected: selectedAnswer, correct: isCorrect },
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      updateProgress(Math.round(((currentQuestion + 2) / quizQuestions.length) * 100));
    } else {
      setQuizComplete(true);
      updateProgress(100);
    }
  };

  const getScore = () => {
    const correct = answers.filter((a) => a.correct).length;
    return Math.round((correct / quizQuestions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/curriculum" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-sm">{module.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{module.duration_minutes} min</span>
                <span>•</span>
                <span>{progress}% complete</span>
              </div>
            </div>
          </div>
          <Link to="/dashboard">
            <img src={livemedLogo} alt="Livemed" style={{ height: '80px', width: 'auto' }} className="object-contain" />
          </Link>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lesson Content */}
        {!isQuiz && lessonSections.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <span>Section {currentSection + 1} of {lessonSections.length}</span>
            </div>

            <LessonContentRenderer section={lessonSections[currentSection]} />

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevSection}
                disabled={currentSection === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {lessonSections.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentSection
                        ? "bg-accent"
                        : idx < currentSection
                        ? "bg-accent/50"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleNextSection} className="gradient-livemed">
                {currentSection < lessonSections.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Complete
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Ask ELI */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-accent" />
                  <span className="text-sm">Have questions about this material?</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/eli?topic=${encodeURIComponent(module.title)}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask ELI™
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz Content */}
        {isQuiz && !quizStarted && !quizComplete && (
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl gradient-livemed flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{module.title}</CardTitle>
              <CardDescription className="text-base">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-livemed">{quizQuestions.length}</div>
                  <div className="text-muted-foreground">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-livemed">{module.duration_minutes}</div>
                  <div className="text-muted-foreground">Minutes</div>
                </div>
              </div>
              <Button size="lg" className="gradient-livemed" onClick={() => setQuizStarted(true)}>
                Start Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {isQuiz && quizStarted && !quizComplete && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-sm font-medium">
                    {answers.filter((a) => a.correct).length} correct
                  </span>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {quizQuestions[currentQuestion].question_text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(v) => setSelectedAnswer(parseInt(v))}
                  disabled={showExplanation}
                >
                  {quizQuestions[currentQuestion].options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        showExplanation
                          ? idx === quizQuestions[currentQuestion].correct_answer_index
                            ? "border-livemed-success bg-livemed-success/10"
                            : idx === selectedAnswer
                            ? "border-destructive bg-destructive/10"
                            : "border-border"
                          : selectedAnswer === idx
                          ? "border-accent bg-accent/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                      {showExplanation && idx === quizQuestions[currentQuestion].correct_answer_index && (
                        <CheckCircle className="h-5 w-5 text-livemed-success" />
                      )}
                      {showExplanation && idx === selectedAnswer && idx !== quizQuestions[currentQuestion].correct_answer_index && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {showExplanation && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-accent" />
                        Explanation
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {quizQuestions[currentQuestion].explanation}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              {!showExplanation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="gradient-livemed"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="gradient-livemed">
                  {currentQuestion < quizQuestions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      See Results
                      <Award className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {isQuiz && quizComplete && (
          <Card className="text-center">
            <CardHeader>
              <div className="w-20 h-20 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                You scored {getScore()}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-livemed-success">
                    {answers.filter((a) => a.correct).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">
                    {answers.filter((a) => !a.correct).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/curriculum">Back to Curriculum</Link>
                </Button>
                <Button className="gradient-livemed" asChild>
                  <Link to={`/eli?topic=${encodeURIComponent("Review: " + module.title)}`}>
                    <Brain className="mr-2 h-4 w-4" />
                    Review with ELI™
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
