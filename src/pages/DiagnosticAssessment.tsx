import { useState, useEffect, useRef } from "react";
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
import { useScorePredictor } from "@/hooks/useScorePredictor";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Brain,
  Loader2,
  Play,
  Target,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Zap,
  Heart,
  Wind,
  Activity,
  Stethoscope,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

interface DiagnosticQuestion {
  id: number;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  specialty: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Comprehensive diagnostic questions across all major USMLE topics
const diagnosticQuestions: DiagnosticQuestion[] = [
  // Cardiology
  {
    id: 1,
    stem: "A 65-year-old man presents with exertional chest pain that resolves with rest. ECG shows ST depression during exercise. What is the most likely diagnosis?",
    options: ["Unstable angina", "Stable angina", "NSTEMI", "Prinzmetal angina", "Aortic stenosis"],
    correctIndex: 1,
    explanation: "Stable angina presents with predictable chest pain triggered by exertion that resolves with rest. The ST depression during exercise confirms myocardial ischemia.",
    topic: "Coronary Artery Disease",
    specialty: "Cardiology",
    difficulty: 'easy'
  },
  {
    id: 2,
    stem: "A patient with heart failure has bilateral pulmonary crackles, elevated JVP, and S3 gallop. Which medication provides the greatest mortality benefit?",
    options: ["Digoxin", "Furosemide", "Lisinopril", "Amlodipine", "Hydralazine"],
    correctIndex: 2,
    explanation: "ACE inhibitors like lisinopril have proven mortality benefit in heart failure with reduced ejection fraction by blocking the RAAS system and preventing cardiac remodeling.",
    topic: "Heart Failure",
    specialty: "Cardiology",
    difficulty: 'medium'
  },
  {
    id: 3,
    stem: "A patient develops torsades de pointes. Which electrolyte abnormality is most commonly associated?",
    options: ["Hyperkalemia", "Hypocalcemia", "Hypomagnesemia", "Hypernatremia", "Hypophosphatemia"],
    correctIndex: 2,
    explanation: "Hypomagnesemia prolongs the QT interval and predisposes to torsades de pointes. IV magnesium is the first-line treatment.",
    topic: "Arrhythmias",
    specialty: "Cardiology",
    difficulty: 'medium'
  },
  // Pulmonology
  {
    id: 4,
    stem: "A 55-year-old smoker has chronic cough and dyspnea. PFTs show FEV1/FVC ratio of 0.60. What is the diagnosis?",
    options: ["Restrictive lung disease", "Obstructive lung disease", "Mixed pattern", "Normal spirometry", "Poor effort"],
    correctIndex: 1,
    explanation: "FEV1/FVC ratio <0.70 indicates obstructive lung disease. In a smoker, COPD is the most likely cause.",
    topic: "COPD",
    specialty: "Pulmonology",
    difficulty: 'easy'
  },
  {
    id: 5,
    stem: "A patient with asthma exacerbation is given albuterol and becomes tremulous with palpitations. What is the mechanism?",
    options: ["Alpha-1 receptor stimulation", "Beta-2 receptor stimulation", "Muscarinic blockade", "Histamine release", "Dopamine release"],
    correctIndex: 1,
    explanation: "Albuterol is a beta-2 agonist. Side effects include tremor (skeletal muscle beta-2), tachycardia (cardiac beta-1 cross-reactivity), and hypokalemia.",
    topic: "Asthma",
    specialty: "Pulmonology",
    difficulty: 'easy'
  },
  {
    id: 6,
    stem: "A hospitalized patient develops sudden dyspnea and pleuritic chest pain. D-dimer is elevated. What is the most appropriate next step?",
    options: ["Start heparin immediately", "CT pulmonary angiography", "Ventilation-perfusion scan", "Lower extremity ultrasound", "Echocardiogram"],
    correctIndex: 1,
    explanation: "With high clinical suspicion for PE and elevated D-dimer, CT pulmonary angiography is the gold standard for diagnosis in hemodynamically stable patients.",
    topic: "Pulmonary Embolism",
    specialty: "Pulmonology",
    difficulty: 'medium'
  },
  // Neurology
  {
    id: 7,
    stem: "A 70-year-old man presents with sudden onset right-sided weakness and aphasia. Symptoms started 2 hours ago. CT head is negative for hemorrhage. What is the next step?",
    options: ["MRI brain", "Aspirin 325mg", "IV tPA", "Carotid ultrasound", "Lumbar puncture"],
    correctIndex: 2,
    explanation: "IV tPA (alteplase) is indicated for acute ischemic stroke within 4.5 hours of symptom onset after ruling out hemorrhage with CT.",
    topic: "Stroke",
    specialty: "Neurology",
    difficulty: 'medium'
  },
  {
    id: 8,
    stem: "A patient has resting tremor, bradykinesia, and cogwheel rigidity. Which neurotransmitter is deficient?",
    options: ["Acetylcholine", "Serotonin", "Dopamine", "GABA", "Norepinephrine"],
    correctIndex: 2,
    explanation: "Parkinson's disease results from loss of dopaminergic neurons in the substantia nigra. Treatment includes dopamine precursors (levodopa) or agonists.",
    topic: "Movement Disorders",
    specialty: "Neurology",
    difficulty: 'easy'
  },
  {
    id: 9,
    stem: "A young woman has episodes of optic neuritis, sensory disturbances, and urinary symptoms over several years. MRI shows periventricular white matter lesions. What is the diagnosis?",
    options: ["Guillain-Barré syndrome", "Multiple sclerosis", "Amyotrophic lateral sclerosis", "Myasthenia gravis", "Transverse myelitis"],
    correctIndex: 1,
    explanation: "Multiple sclerosis presents with neurological deficits disseminated in time and space. Periventricular plaques on MRI are characteristic.",
    topic: "Demyelinating Diseases",
    specialty: "Neurology",
    difficulty: 'medium'
  },
  // Gastroenterology
  {
    id: 10,
    stem: "A patient with cirrhosis has asterixis and confusion. Ammonia level is elevated. What is the first-line treatment?",
    options: ["Neomycin", "Lactulose", "Rifaximin", "Zinc supplementation", "Protein restriction"],
    correctIndex: 1,
    explanation: "Lactulose is first-line for hepatic encephalopathy. It traps ammonia in the gut as ammonium and promotes excretion through cathartic effect.",
    topic: "Liver Disease",
    specialty: "Gastroenterology",
    difficulty: 'easy'
  },
  {
    id: 11,
    stem: "A patient has epigastric pain relieved by eating. H. pylori stool antigen is positive. What is the best treatment regimen?",
    options: ["PPI alone for 8 weeks", "PPI + clarithromycin + amoxicillin", "H2 blocker + bismuth", "Sucralfate monotherapy", "Antacids as needed"],
    correctIndex: 1,
    explanation: "Triple therapy with PPI + clarithromycin + amoxicillin (or metronidazole) for 14 days is standard treatment for H. pylori infection.",
    topic: "Peptic Ulcer Disease",
    specialty: "Gastroenterology",
    difficulty: 'medium'
  },
  {
    id: 12,
    stem: "A patient with ulcerative colitis develops toxic megacolon. Abdominal X-ray shows colonic dilation >6cm. What is the next step?",
    options: ["Increase mesalamine dose", "Add azathioprine", "Surgical consultation for colectomy", "Start oral prednisone", "Colonoscopy"],
    correctIndex: 2,
    explanation: "Toxic megacolon is a surgical emergency. Perforation risk is high and urgent surgical consultation for colectomy is indicated.",
    topic: "Inflammatory Bowel Disease",
    specialty: "Gastroenterology",
    difficulty: 'hard'
  },
  // Endocrinology
  {
    id: 13,
    stem: "A patient has polyuria, polydipsia, and random glucose of 250 mg/dL. HbA1c is 9.5%. What is the most appropriate initial treatment?",
    options: ["Diet and exercise alone", "Metformin monotherapy", "Insulin", "Sulfonylurea", "GLP-1 agonist"],
    correctIndex: 2,
    explanation: "With HbA1c >9% and symptomatic hyperglycemia, insulin is often needed initially to achieve glycemic control before transitioning to oral agents.",
    topic: "Diabetes Mellitus",
    specialty: "Endocrinology",
    difficulty: 'medium'
  },
  {
    id: 14,
    stem: "A patient has heat intolerance, weight loss, tremor, and exophthalmos. TSH is suppressed with elevated free T4. What is the diagnosis?",
    options: ["Hashimoto thyroiditis", "Graves disease", "Toxic adenoma", "Subacute thyroiditis", "TSH-secreting adenoma"],
    correctIndex: 1,
    explanation: "Graves disease is autoimmune hyperthyroidism with thyroid-stimulating immunoglobulins. Exophthalmos and pretibial myxedema are unique to Graves.",
    topic: "Thyroid Disorders",
    specialty: "Endocrinology",
    difficulty: 'easy'
  },
  {
    id: 15,
    stem: "A patient on chronic prednisone therapy develops hypertension, central obesity, and purple striae. What test confirms the diagnosis?",
    options: ["Random cortisol level", "24-hour urine free cortisol", "Morning ACTH level", "Dexamethasone suppression test", "Aldosterone level"],
    correctIndex: 1,
    explanation: "24-hour urine free cortisol is the best screening test for Cushing syndrome. It measures total cortisol production over a full day.",
    topic: "Adrenal Disorders",
    specialty: "Endocrinology",
    difficulty: 'medium'
  },
  // Internal Medicine / General
  {
    id: 16,
    stem: "A patient with rheumatoid arthritis develops morning stiffness lasting >1 hour with symmetric joint swelling. What is the first-line DMARD?",
    options: ["Prednisone", "Methotrexate", "Hydroxychloroquine", "Sulfasalazine", "Etanercept"],
    correctIndex: 1,
    explanation: "Methotrexate is the anchor DMARD for rheumatoid arthritis. It's started early to prevent joint destruction and can be combined with other agents.",
    topic: "Rheumatology",
    specialty: "Internal Medicine",
    difficulty: 'medium'
  },
  {
    id: 17,
    stem: "A patient has fatigue, pallor, and glossitis. CBC shows MCV of 115 fL. What vitamin deficiency is most likely?",
    options: ["Iron", "Vitamin B12", "Folate", "Vitamin D", "Vitamin C"],
    correctIndex: 1,
    explanation: "Macrocytic anemia (MCV >100) with neurological symptoms and glossitis suggests B12 deficiency. Folate deficiency causes similar CBC findings but without neurological manifestations.",
    topic: "Hematology",
    specialty: "Internal Medicine",
    difficulty: 'easy'
  },
  {
    id: 18,
    stem: "A patient develops AKI after receiving IV contrast. Creatinine rises from 1.0 to 2.5 mg/dL. Which intervention could have prevented this?",
    options: ["Furosemide before contrast", "N-acetylcysteine", "IV normal saline hydration", "Mannitol infusion", "Dopamine infusion"],
    correctIndex: 2,
    explanation: "IV hydration with isotonic saline before and after contrast administration is the primary preventive measure for contrast-induced nephropathy.",
    topic: "Nephrology",
    specialty: "Internal Medicine",
    difficulty: 'medium'
  },
  // Emergency Medicine
  {
    id: 19,
    stem: "A patient presents with severe allergic reaction: hypotension, urticaria, and stridor. What is the first medication to give?",
    options: ["IV diphenhydramine", "IV methylprednisolone", "IM epinephrine", "Albuterol nebulizer", "IV famotidine"],
    correctIndex: 2,
    explanation: "IM epinephrine (0.3-0.5mg, 1:1000) is the first-line treatment for anaphylaxis. It should be given immediately and can be repeated.",
    topic: "Anaphylaxis",
    specialty: "Emergency Medicine",
    difficulty: 'easy'
  },
  {
    id: 20,
    stem: "A trauma patient has Beck's triad: hypotension, distended neck veins, and muffled heart sounds. What is the diagnosis?",
    options: ["Tension pneumothorax", "Cardiac tamponade", "Massive hemothorax", "Aortic dissection", "Myocardial contusion"],
    correctIndex: 1,
    explanation: "Beck's triad is classic for cardiac tamponade. Emergent pericardiocentesis or surgical drainage is required.",
    topic: "Trauma",
    specialty: "Emergency Medicine",
    difficulty: 'medium'
  },
];

interface StudyPlanRecommendation {
  specialty: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  estimatedHours: number;
  modules: string[];
}

const DiagnosticAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Assessment state
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; selected: number; correct: boolean; topic: string; specialty: string }[]>([]);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes for diagnostic
  const [studyPlan, setStudyPlan] = useState<StudyPlanRecommendation[]>([]);
  const [savingResults, setSavingResults] = useState(false);
  const startTimeRef = useRef<number>(0);
  
  const { saveAssessmentResult, refreshPrediction } = useScorePredictor(user?.id ?? null);

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
  
  useEffect(() => {
    if (assessmentStarted && startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }
  }, [assessmentStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = diagnosticQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctIndex;

    setAnswers([
      ...answers,
      { 
        questionId: question.id, 
        selected: selectedAnswer, 
        correct: isCorrect,
        topic: question.topic,
        specialty: question.specialty
      },
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setAssessmentComplete(true);
      await generateStudyPlan();
    }
  };

  const generateStudyPlan = async () => {
    if (!user) return;
    
    setSavingResults(true);
    
    // Calculate performance by specialty
    const specialtyPerformance: Record<string, { correct: number; total: number; topics: Set<string> }> = {};
    
    answers.forEach((answer) => {
      if (!specialtyPerformance[answer.specialty]) {
        specialtyPerformance[answer.specialty] = { correct: 0, total: 0, topics: new Set() };
      }
      specialtyPerformance[answer.specialty].total++;
      specialtyPerformance[answer.specialty].topics.add(answer.topic);
      if (answer.correct) {
        specialtyPerformance[answer.specialty].correct++;
      }
    });
    
    // Add current question to performance
    const currentQ = diagnosticQuestions[currentQuestion];
    const lastAnswer = answers[answers.length - 1];
    if (lastAnswer) {
      if (!specialtyPerformance[currentQ.specialty]) {
        specialtyPerformance[currentQ.specialty] = { correct: 0, total: 0, topics: new Set() };
      }
    }

    // Generate study plan recommendations
    const plan: StudyPlanRecommendation[] = Object.entries(specialtyPerformance)
      .map(([specialty, data]) => {
        const score = Math.round((data.correct / data.total) * 100);
        const priority: 'high' | 'medium' | 'low' = score < 50 ? 'high' : score < 70 ? 'medium' : 'low';
        
        const recommendations: string[] = [];
        const estimatedHours = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;
        
        if (priority === 'high') {
          recommendations.push(`Focus on core ${specialty} concepts first`);
          recommendations.push(`Complete all foundational modules before advancing`);
          recommendations.push(`Use ATLAS™ for personalized explanations`);
        } else if (priority === 'medium') {
          recommendations.push(`Review challenging topics in ${specialty}`);
          recommendations.push(`Practice more clinical vignettes`);
        } else {
          recommendations.push(`Maintain current understanding with periodic review`);
          recommendations.push(`Focus on edge cases and exceptions`);
        }

        return {
          specialty,
          score,
          priority,
          recommendations,
          estimatedHours,
          modules: Array.from(data.topics)
        };
      })
      .sort((a, b) => a.score - b.score); // Sort by score ascending (weakest first)

    setStudyPlan(plan);

    // Save to database
    const timeTaken = startTimeRef.current > 0 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 40 * 60 - timeRemaining;

    const topicPerf: Record<string, { correct: number; total: number }> = {};
    answers.forEach((answer) => {
      if (!topicPerf[answer.topic]) {
        topicPerf[answer.topic] = { correct: 0, total: 0 };
      }
      topicPerf[answer.topic].total++;
      if (answer.correct) {
        topicPerf[answer.topic].correct++;
      }
    });

    const correctCount = answers.filter(a => a.correct).length;

    try {
      await saveAssessmentResult(
        'diagnostic',
        diagnosticQuestions.length,
        correctCount,
        timeTaken,
        topicPerf
      );

      // Save study plan to profile
      await supabase
        .from('profiles')
        .update({
          weak_areas: plan.filter(p => p.priority === 'high' || p.priority === 'medium').map(p => p.specialty)
        })
        .eq('user_id', user.id);

      await refreshPrediction();

      toast({
        title: "📊 Diagnostic Complete!",
        description: "Your personalized study plan has been created",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error saving diagnostic results:', error);
    } finally {
      setSavingResults(false);
    }
  };

  const getScore = () => {
    const correct = answers.filter((a) => a.correct).length;
    return Math.round((correct / diagnosticQuestions.length) * 100);
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'Cardiology': return <Heart className="h-5 w-5" />;
      case 'Pulmonology': return <Wind className="h-5 w-5" />;
      case 'Neurology': return <Brain className="h-5 w-5" />;
      case 'Emergency Medicine': return <Activity className="h-5 w-5" />;
      default: return <Stethoscope className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-livemed-success bg-livemed-success/10 border-livemed-success/20';
      default: return 'text-muted-foreground bg-muted';
    }
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
              <ClipboardCheck className="h-5 w-5 text-accent" />
              <h1 className="font-semibold">Diagnostic Assessment</h1>
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
          <Progress value={((currentQuestion + 1) / diagnosticQuestions.length) * 100} className="h-1" />
        )}
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Start Screen */}
        {!assessmentStarted && !assessmentComplete && (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <Badge className="mb-4 gradient-livemed text-white border-0">Recommended First Step</Badge>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">USMLE Diagnostic Assessment</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                This comprehensive assessment evaluates your baseline knowledge across all major USMLE topics 
                to create a personalized study plan tailored to your strengths and weaknesses.
              </p>
            </div>

            <Card className="max-w-xl mx-auto border-accent/20">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-2xl gradient-livemed flex items-center justify-center mx-auto mb-4">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl">Baseline Knowledge Evaluation</CardTitle>
                <CardDescription>
                  Comprehensive multi-specialty diagnostic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gradient-livemed">
                      {diagnosticQuestions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient-livemed">40</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient-livemed">6</div>
                    <div className="text-xs text-muted-foreground">Specialties</div>
                  </div>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    What You'll Get
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-livemed-success mt-0.5 flex-shrink-0" />
                      <span>Personalized study plan based on your performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-livemed-success mt-0.5 flex-shrink-0" />
                      <span>Identification of high-priority focus areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-livemed-success mt-0.5 flex-shrink-0" />
                      <span>Estimated study hours per specialty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-livemed-success mt-0.5 flex-shrink-0" />
                      <span>Initial MATCH Ready™ Score prediction</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    Specialties Covered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Cardiology', 'Pulmonology', 'Neurology', 'Gastroenterology', 'Endocrinology', 'Emergency Medicine'].map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="gap-1">
                        {getSpecialtyIcon(specialty)}
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full gradient-livemed" 
                  onClick={() => setAssessmentStarted(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Begin Diagnostic Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Question View */}
        {assessmentStarted && !assessmentComplete && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {getSpecialtyIcon(diagnosticQuestions[currentQuestion].specialty)}
                        {diagnosticQuestions[currentQuestion].specialty}
                      </Badge>
                      <Badge variant="secondary">{diagnosticQuestions[currentQuestion].topic}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestion + 1} of {diagnosticQuestions.length}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-relaxed font-normal">
                    {diagnosticQuestions[currentQuestion].stem}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selectedAnswer?.toString()}
                    onValueChange={(v) => setSelectedAnswer(parseInt(v))}
                    disabled={showExplanation}
                  >
                    {diagnosticQuestions[currentQuestion].options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                          showExplanation
                            ? idx === diagnosticQuestions[currentQuestion].correctIndex
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
                        {showExplanation && idx === diagnosticQuestions[currentQuestion].correctIndex && (
                          <CheckCircle className="h-5 w-5 text-livemed-success flex-shrink-0" />
                        )}
                        {showExplanation && idx === selectedAnswer && idx !== diagnosticQuestions[currentQuestion].correctIndex && (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="bg-accent/5 border-accent/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-accent" />
                            Explanation
                          </h4>
                          <p className="text-sm leading-relaxed">
                            {diagnosticQuestions[currentQuestion].explanation}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
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
                    {currentQuestion < diagnosticQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Generate Study Plan
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Results & Study Plan */}
        {assessmentComplete && (
          <div className="space-y-6">
            {/* Score Summary */}
            <Card className="text-center border-accent/20">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-24 h-24 rounded-full gradient-livemed flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-3xl font-bold text-white">{getScore()}%</span>
                </motion.div>
                <CardTitle className="text-2xl">Diagnostic Complete!</CardTitle>
                <CardDescription className="text-base mt-2">
                  You answered {answers.filter((a) => a.correct).length} of {diagnosticQuestions.length} questions correctly
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Personalized Study Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-livemed flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Your Personalized Study Plan</CardTitle>
                    <CardDescription>Based on your diagnostic performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {savingResults ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    <span className="ml-2 text-muted-foreground">Generating your study plan...</span>
                  </div>
                ) : (
                  <>
                    {studyPlan.map((item, idx) => (
                      <motion.div
                        key={item.specialty}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`border ${getPriorityColor(item.priority)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  item.priority === 'high' ? 'bg-destructive/20' :
                                  item.priority === 'medium' ? 'bg-amber-500/20' : 'bg-livemed-success/20'
                                }`}>
                                  {getSpecialtyIcon(item.specialty)}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{item.specialty}</h3>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'outline' : 'secondary'}>
                                      {item.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                                    </Badge>
                                    <span className="text-muted-foreground">~{item.estimatedHours} hours</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${
                                  item.score >= 70 ? 'text-livemed-success' :
                                  item.score >= 50 ? 'text-amber-500' : 'text-destructive'
                                }`}>
                                  {item.score}%
                                </div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                            </div>
                            
                            <Progress 
                              value={item.score} 
                              className="h-2 mb-3"
                            />
                            
                            <div className="space-y-1">
                              {item.recommendations.map((rec, i) => (
                                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <Zap className="h-3 w-3 mt-1 flex-shrink-0 text-accent" />
                                  {rec}
                                </p>
                              ))}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs text-muted-foreground mb-2">Focus Topics:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.modules.map((mod) => (
                                  <Badge key={mod} variant="secondary" className="text-xs">
                                    {mod}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    
                    {/* Total Study Time */}
                    <Card className="bg-accent/5 border-accent/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-accent" />
                            <div>
                              <p className="font-medium">Estimated Total Study Time</p>
                              <p className="text-sm text-muted-foreground">To reach exam readiness</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gradient-livemed">
                              {studyPlan.reduce((sum, p) => sum + p.estimatedHours, 0)} hours
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/score-predictor">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View MATCH Ready™ Score
                </Link>
              </Button>
              <Button className="gradient-livemed" asChild>
                <Link to="/curriculum">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Your Study Plan
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticAssessment;
