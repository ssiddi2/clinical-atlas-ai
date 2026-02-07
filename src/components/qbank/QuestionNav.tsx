import { Flag, Check, X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionQuestion } from '@/hooks/useQBankSession';

interface QuestionNavProps {
  questions: SessionQuestion[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function QuestionNav({
  questions,
  currentIndex,
  onNavigate,
}: QuestionNavProps) {
  const getQuestionStatus = (question: SessionQuestion, index: number) => {
    const isCurrent = index === currentIndex;
    const isAnswered = question.selectedAnswer !== undefined;
    const isCorrect = question.isCorrect;
    const isFlagged = question.isFlagged;

    return { isCurrent, isAnswered, isCorrect, isFlagged };
  };

  const getQuestionStyles = (status: ReturnType<typeof getQuestionStatus>) => {
    const base = 'relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 border-2';
    
    if (status.isCurrent) {
      return cn(base, 'border-primary bg-primary/20 text-primary ring-2 ring-primary/30');
    }
    
    if (status.isCorrect === true) {
      return cn(base, 'border-green-500 bg-green-500/20 text-green-400');
    }
    
    if (status.isCorrect === false) {
      return cn(base, 'border-red-500 bg-red-500/20 text-red-400');
    }
    
    if (status.isAnswered) {
      return cn(base, 'border-blue-500 bg-blue-500/20 text-blue-400');
    }
    
    return cn(base, 'border-border bg-card hover:border-primary/50 text-muted-foreground');
  };

  const answeredCount = questions.filter(q => q.selectedAnswer !== undefined).length;
  const correctCount = questions.filter(q => q.isCorrect === true).length;
  const incorrectCount = questions.filter(q => q.isCorrect === false).length;
  const flaggedCount = questions.filter(q => q.isFlagged).length;

  return (
    <div className="w-64 bg-card/50 border-l border-border flex flex-col h-full">
      {/* Stats */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Progress</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-blue-400 fill-blue-400" />
            <span className="text-muted-foreground">Answered:</span>
            <span className="text-foreground font-medium">{answeredCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 text-green-400" />
            <span className="text-muted-foreground">Correct:</span>
            <span className="text-foreground font-medium">{correctCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-3 w-3 text-red-400" />
            <span className="text-muted-foreground">Incorrect:</span>
            <span className="text-foreground font-medium">{incorrectCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-3 w-3 text-yellow-400" />
            <span className="text-muted-foreground">Flagged:</span>
            <span className="text-foreground font-medium">{flaggedCount}</span>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-foreground mb-3">Questions</h3>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((question, index) => {
            const status = getQuestionStatus(question, index);
            
            return (
              <button
                key={question.id}
                className={getQuestionStyles(status)}
                onClick={() => onNavigate(index)}
              >
                {index + 1}
                {status.isFlagged && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 fill-yellow-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-border" />
            <span className="text-muted-foreground">Unanswered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/20" />
            <span className="text-muted-foreground">Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20" />
            <span className="text-muted-foreground">Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-500/20" />
            <span className="text-muted-foreground">Incorrect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
