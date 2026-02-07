import { Flag, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SessionQuestion } from '@/hooks/useQBankSession';
import AnswerOption from './AnswerOption';

interface QuestionCardProps {
  question: SessionQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  showExplanation: boolean;
  mode: 'tutor' | 'timed';
  onSelectAnswer: (index: number) => void;
  onToggleFlag: () => void;
  onToggleStrikethrough: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  mode,
  onSelectAnswer,
  onToggleFlag,
  onToggleStrikethrough,
  onSubmit,
  onNext,
  onPrev,
  isSubmitting,
}: QuestionCardProps) {
  const hasAnswered = question.isCorrect !== undefined;
  const canSubmit = selectedAnswer !== undefined && !hasAnswered && mode === 'tutor';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Badge variant="outline" className={cn('text-xs', getDifficultyColor(question.difficulty))}>
            {question.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {question.subject}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {question.system}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{Math.floor(question.timeSpent / 60)}:{String(question.timeSpent % 60).padStart(2, '0')}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFlag}
            className={cn(
              question.isFlagged && 'text-yellow-400 hover:text-yellow-500'
            )}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="p-6 bg-card/50 border-border mb-6">
          <div className="text-sm text-muted-foreground mb-2">
            ID: {question.question_id}
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {question.stem}
            </p>
          </div>
          {question.question_image_url && (
            <img
              src={question.question_image_url}
              alt="Question"
              className="mt-4 max-w-full rounded-lg"
            />
          )}
        </Card>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <AnswerOption
              key={index}
              index={index}
              text={option}
              isSelected={selectedAnswer === index}
              isCorrect={hasAnswered ? index === question.correct_answer_index : undefined}
              isStrikethrough={question.strikethroughs.includes(index)}
              showResult={showExplanation}
              disabled={hasAnswered}
              onSelect={() => onSelectAnswer(index)}
              onToggleStrikethrough={() => onToggleStrikethrough(index)}
            />
          ))}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <Card className="mt-6 p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Explanation
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {question.explanation}
              </p>
            </div>
            {question.explanation_image_url && (
              <img
                src={question.explanation_image_url}
                alt="Explanation"
                className="mt-4 max-w-full rounded-lg"
              />
            )}
            {question.first_aid_reference && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  First Aid Reference: {question.first_aid_reference}
                </span>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-card/50">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={questionNumber === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {canSubmit && (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={questionNumber === totalQuestions}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
