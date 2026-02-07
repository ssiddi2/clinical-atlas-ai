import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Timer, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQBankSession } from '@/hooks/useQBankSession';
import QuestionCard from '@/components/qbank/QuestionCard';
import QuestionNav from '@/components/qbank/QuestionNav';
import LabValuesPanel from '@/components/qbank/LabValuesPanel';
import { cn } from '@/lib/utils';

export default function QBankSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    session,
    questions,
    currentQuestion,
    currentIndex,
    isLoading,
    isSubmitting,
    showExplanation,
    setShowExplanation,
    selectAnswer,
    submitAnswer,
    toggleFlag,
    toggleStrikethrough,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    completeSession,
    updateTimeSpent,
  } = useQBankSession({ sessionId: id });

  const [showLabValues, setShowLabValues] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Timer for timed mode
  useEffect(() => {
    if (session?.mode === 'timed' && session.timeRemainingSeconds && session.status === 'in_progress') {
      setTimeRemaining(session.timeRemainingSeconds);
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session]);

  // Track time spent on current question
  useEffect(() => {
    if (!currentQuestion || session?.status !== 'in_progress') return;

    const interval = setInterval(() => {
      updateTimeSpent(1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, session?.status, updateTimeSpent]);

  // Auto-end when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && session?.mode === 'timed') {
      handleEndTest();
    }
  }, [timeRemaining, session?.mode]);

  const handleEndTest = async () => {
    const score = await completeSession();
    if (score !== null) {
      navigate(`/qbank/review/${id}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleNextInTutor = useCallback(() => {
    setShowExplanation(false);
    nextQuestion();
  }, [nextQuestion, setShowExplanation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">This session may have been deleted or expired.</p>
          <Button onClick={() => navigate('/qbank')}>Return to QBank</Button>
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => q.selectedAnswer !== undefined).length;
  const correctCount = questions.filter(q => q.isCorrect === true).length;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowEndDialog(true)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <span className="text-sm text-muted-foreground capitalize">{session.mode} Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session.mode === 'timed' && timeRemaining !== null && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-muted text-foreground'
            )}>
              <Timer className="h-4 w-4" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </div>

          <Button variant="outline" onClick={() => setShowLabValues(!showLabValues)}>
            Lab Values
          </Button>

          <Button 
            variant="default" 
            onClick={() => setShowEndDialog(true)}
          >
            End Test
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-hidden">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={currentQuestion.selectedAnswer}
            showExplanation={showExplanation}
            mode={session.mode}
            onSelectAnswer={selectAnswer}
            onToggleFlag={toggleFlag}
            onToggleStrikethrough={toggleStrikethrough}
            onSubmit={submitAnswer}
            onNext={showExplanation ? handleNextInTutor : nextQuestion}
            onPrev={prevQuestion}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Navigation Panel */}
        <QuestionNav
          questions={questions}
          currentIndex={currentIndex}
          onNavigate={goToQuestion}
        />

        {/* Lab Values Panel */}
        {showLabValues && (
          <LabValuesPanel 
            isOpen={showLabValues} 
            onToggle={() => setShowLabValues(false)} 
          />
        )}
      </div>

      {/* End Test Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Test?</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">{answeredCount}</p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">{questions.length - answeredCount}</p>
                <p className="text-sm text-muted-foreground">Unanswered</p>
              </div>
            </div>

            {session.mode === 'tutor' && (
              <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-lg font-semibold text-foreground">
                  {correctCount}/{answeredCount} correct ({answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%)
                </p>
              </div>
            )}

            {questions.length - answeredCount > 0 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                You have {questions.length - answeredCount} unanswered questions. Are you sure you want to end?
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Continue Test
            </Button>
            <Button onClick={handleEndTest}>
              End & Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
