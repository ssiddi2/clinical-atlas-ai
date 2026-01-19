import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Brain,
  Award,
  Loader2,
  Play,
  AlertCircle,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

// Sample USMLE-style question bank
const usmleSampleQuestions: QuizQuestion[] = [
  {
    id: 1,
    stem: "A 58-year-old man with a history of hypertension and type 2 diabetes presents to the emergency department with crushing substernal chest pain radiating to his left arm for the past 45 minutes. ECG shows ST-segment elevation in leads V1-V4. Troponin I is elevated at 2.5 ng/mL. Which of the following is the most appropriate initial management?",
    options: [
      "Obtain echocardiogram",
      "Administer thrombolytics",
      "Immediate percutaneous coronary intervention",
      "Start heparin drip and observe",
      "Schedule stress test",
    ],
    correctIndex: 2,
    explanation: "This patient presents with an acute ST-elevation myocardial infarction (STEMI). The standard of care for STEMI is immediate reperfusion therapy, preferably with primary percutaneous coronary intervention (PCI) if available within 90-120 minutes of first medical contact. PCI is superior to thrombolytics when available in a timely manner.",
    topic: "Cardiology",
  },
  {
    id: 2,
    stem: "A 35-year-old woman presents with fatigue, weight gain, and cold intolerance over the past 6 months. Physical examination reveals dry skin, bradycardia, and delayed relaxation phase of deep tendon reflexes. Laboratory studies show TSH of 15 mIU/L (normal: 0.5-5.0) and free T4 of 0.5 ng/dL (normal: 0.8-1.8). Which of the following is the most likely diagnosis?",
    options: [
      "Graves disease",
      "Hashimoto thyroiditis",
      "Subacute thyroiditis",
      "Toxic multinodular goiter",
      "Thyroid cancer",
    ],
    correctIndex: 1,
    explanation: "The clinical presentation (fatigue, weight gain, cold intolerance, dry skin, bradycardia, delayed DTR relaxation) combined with elevated TSH and low free T4 indicates primary hypothyroidism. In a young to middle-aged woman, Hashimoto thyroiditis (chronic autoimmune thyroiditis) is the most common cause of primary hypothyroidism in iodine-sufficient areas.",
    topic: "Endocrinology",
  },
  {
    id: 3,
    stem: "A 72-year-old man with a 50-pack-year smoking history presents with progressive dyspnea and chronic productive cough. Pulmonary function tests show FEV1/FVC ratio of 0.55 and FEV1 of 45% predicted with minimal bronchodilator response. Which of the following is the most appropriate long-term management?",
    options: [
      "Short-acting beta-agonist as needed only",
      "Long-acting muscarinic antagonist plus long-acting beta-agonist",
      "High-dose inhaled corticosteroid monotherapy",
      "Oral prednisone daily",
      "Theophylline monotherapy",
    ],
    correctIndex: 1,
    explanation: "This patient has severe COPD (GOLD Stage III, FEV1 30-49% predicted) with significant airflow limitation. According to GOLD guidelines, patients with severe COPD benefit from combination long-acting bronchodilator therapy with LAMA + LABA. Inhaled corticosteroids may be added for patients with frequent exacerbations, but are not first-line monotherapy.",
    topic: "Pulmonology",
  },
  {
    id: 4,
    stem: "A 25-year-old woman presents with sudden onset of severe headache described as 'the worst headache of my life.' She has no significant medical history. On examination, she is alert but photophobic with mild neck stiffness. Non-contrast CT of the head is negative. What is the most appropriate next step?",
    options: [
      "Discharge with analgesics and follow-up",
      "MRI of the brain",
      "Lumbar puncture",
      "CT angiography",
      "Empiric treatment for migraine",
    ],
    correctIndex: 2,
    explanation: "A thunderclap headache ('worst headache of life') with neck stiffness raises strong concern for subarachnoid hemorrhage (SAH). While non-contrast CT head is highly sensitive (>95%) within 6 hours, a negative CT does not rule out SAH. Lumbar puncture is required to evaluate for xanthochromia and RBCs in the CSF when clinical suspicion remains high despite negative CT.",
    topic: "Neurology",
  },
  {
    id: 5,
    stem: "A 45-year-old man with chronic hepatitis C and cirrhosis presents with increasing abdominal distension over 2 weeks. Paracentesis reveals ascitic fluid with albumin of 0.8 g/dL (serum albumin 2.8 g/dL), WBC 85/μL with 15% PMNs, and negative culture. What is the most appropriate initial management of his ascites?",
    options: [
      "Large volume paracentesis with albumin replacement",
      "TIPS procedure",
      "Sodium restriction and diuretics",
      "Liver transplant evaluation",
      "IV antibiotics for spontaneous bacterial peritonitis",
    ],
    correctIndex: 2,
    explanation: "This patient has uncomplicated ascites with a serum-ascites albumin gradient (SAAG) of 2.0 g/dL (>1.1), indicating portal hypertension. The ascitic fluid PMN count <250/μL rules out SBP. First-line management of ascites includes sodium restriction (≤2g/day) and diuretic therapy (typically spironolactone ± furosemide). Large volume paracentesis is reserved for tense ascites or diuretic-refractory cases.",
    topic: "Gastroenterology",
  },
];

const Assessments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Assessment state
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; selected: number; correct: boolean }[]>([]);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes

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

  // Timer
  useEffect(() => {
    if (assessmentStarted && !assessmentComplete && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((t) => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [assessmentStarted, assessmentComplete, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = usmleSampleQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctIndex;

    setAnswers([
      ...answers,
      { questionId: question.id, selected: selectedAnswer, correct: isCorrect },
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < usmleSampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setAssessmentComplete(true);
    }
  };

  const getScore = () => {
    const correct = answers.filter((a) => a.correct).length;
    return Math.round((correct / usmleSampleQuestions.length) * 100);
  };

  const getPerformanceByTopic = () => {
    const topics: { [key: string]: { correct: number; total: number } } = {};
    
    answers.forEach((answer, idx) => {
      const question = usmleSampleQuestions[idx];
      if (!topics[question.topic]) {
        topics[question.topic] = { correct: 0, total: 0 };
      }
      topics[question.topic].total++;
      if (answer.correct) {
        topics[question.topic].correct++;
      }
    });

    return topics;
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
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <h1 className="font-semibold">Assessments</h1>
            </div>
          </div>
          
          {assessmentStarted && !assessmentComplete && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 300 ? "text-destructive font-bold" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          
          <Link to="/dashboard">
            <img src={livemedLogo} alt="LIVEMED" className="h-10 md:h-16 object-contain" />
          </Link>
        </div>
        {assessmentStarted && !assessmentComplete && (
          <Progress value={((currentQuestion + 1) / usmleSampleQuestions.length) * 100} className="h-1" />
        )}
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Start Screen */}
        {!assessmentStarted && !assessmentComplete && (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">USMLE-Style Practice Assessment</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Test your clinical knowledge with high-yield USMLE-style questions across multiple specialties.
              </p>
            </div>

            <Card className="max-w-xl mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-livemed flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Practice Exam</CardTitle>
                <CardDescription>
                  Multi-specialty clinical vignettes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gradient-livemed">
                      {usmleSampleQuestions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient-livemed">60</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient-livemed">5</div>
                    <div className="text-xs text-muted-foreground">Topics</div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    Topics Covered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(usmleSampleQuestions.map((q) => q.topic))].map((topic) => (
                      <Badge key={topic} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full gradient-livemed" 
                  onClick={() => setAssessmentStarted(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Question View */}
        {assessmentStarted && !assessmentComplete && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{usmleSampleQuestions[currentQuestion].topic}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {usmleSampleQuestions.length}
                  </span>
                </div>
                <CardTitle className="text-lg leading-relaxed font-normal">
                  {usmleSampleQuestions[currentQuestion].stem}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(v) => setSelectedAnswer(parseInt(v))}
                  disabled={showExplanation}
                >
                  {usmleSampleQuestions[currentQuestion].options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                        showExplanation
                          ? idx === usmleSampleQuestions[currentQuestion].correctIndex
                            ? "border-livemed-success bg-livemed-success/10"
                            : idx === selectedAnswer
                            ? "border-destructive bg-destructive/10"
                            : "border-border"
                          : selectedAnswer === idx
                          ? "border-accent bg-accent/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-1" />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer leading-relaxed">
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {option}
                      </Label>
                      {showExplanation && idx === usmleSampleQuestions[currentQuestion].correctIndex && (
                        <CheckCircle className="h-5 w-5 text-livemed-success flex-shrink-0" />
                      )}
                      {showExplanation && idx === selectedAnswer && idx !== usmleSampleQuestions[currentQuestion].correctIndex && (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {showExplanation && (
                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-accent" />
                        Explanation
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {usmleSampleQuestions[currentQuestion].explanation}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {answers.filter((a) => a.correct).length} of {answers.length} correct
              </div>
              
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
                  {currentQuestion < usmleSampleQuestions.length - 1 ? (
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

        {/* Results Screen */}
        {assessmentComplete && (
          <div className="space-y-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-24 h-24 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-4">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-3xl">Assessment Complete!</CardTitle>
                <CardDescription className="text-xl mt-2">
                  You scored <span className="font-bold text-foreground">{getScore()}%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex justify-center gap-12">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-livemed-success">
                      {answers.filter((a) => a.correct).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-destructive">
                      {answers.filter((a) => !a.correct).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Performance by Topic</h3>
                  <div className="space-y-3 max-w-md mx-auto">
                    {Object.entries(getPerformanceByTopic()).map(([topic, data]) => (
                      <div key={topic} className="flex items-center gap-4">
                        <span className="text-sm w-32 text-left">{topic}</span>
                        <Progress 
                          value={(data.correct / data.total) * 100} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {data.correct}/{data.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button variant="outline" onClick={() => {
                    setAssessmentStarted(false);
                    setAssessmentComplete(false);
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setTimeRemaining(60 * 60);
                  }}>
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/curriculum">Back to Curriculum</Link>
                  </Button>
                  <Button className="gradient-livemed" asChild>
                    <Link to="/eli">
                      <Brain className="mr-2 h-4 w-4" />
                      Review with ELI™
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessments;
