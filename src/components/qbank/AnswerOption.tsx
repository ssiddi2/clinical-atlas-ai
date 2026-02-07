import { Check, X, Slash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnswerOptionProps {
  index: number;
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isStrikethrough: boolean;
  showResult: boolean;
  disabled: boolean;
  onSelect: () => void;
  onToggleStrikethrough: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function AnswerOption({
  index,
  text,
  isSelected,
  isCorrect,
  isStrikethrough,
  showResult,
  disabled,
  onSelect,
  onToggleStrikethrough,
}: AnswerOptionProps) {
  const getOptionStyles = () => {
    if (showResult) {
      if (isCorrect === true) {
        return 'border-green-500 bg-green-500/10';
      }
      if (isSelected && isCorrect === false) {
        return 'border-red-500 bg-red-500/10';
      }
      // Show correct answer
      if (isCorrect === undefined) {
        return 'border-green-500 bg-green-500/10';
      }
    }
    
    if (isSelected && !disabled) {
      return 'border-primary bg-primary/10';
    }
    
    return 'border-border hover:border-primary/50 hover:bg-accent/50';
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onToggleStrikethrough();
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
        getOptionStyles(),
        isStrikethrough && 'opacity-50',
        disabled && 'cursor-default'
      )}
      onClick={() => !disabled && onSelect()}
      onContextMenu={handleRightClick}
    >
      {/* Option Letter */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
          isSelected 
            ? 'border-primary bg-primary text-primary-foreground' 
            : 'border-muted-foreground/30 text-muted-foreground',
          showResult && isCorrect === true && 'border-green-500 bg-green-500 text-white',
          showResult && isSelected && isCorrect === false && 'border-red-500 bg-red-500 text-white'
        )}
      >
        {showResult && isCorrect === true ? (
          <Check className="h-4 w-4" />
        ) : showResult && isSelected && isCorrect === false ? (
          <X className="h-4 w-4" />
        ) : (
          OPTION_LETTERS[index]
        )}
      </div>

      {/* Option Text */}
      <div className="flex-1 pt-1">
        <p className={cn(
          'text-foreground',
          isStrikethrough && 'line-through text-muted-foreground'
        )}>
          {text}
        </p>
      </div>

      {/* Strikethrough indicator */}
      {isStrikethrough && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStrikethrough();
          }}
          className="absolute top-2 right-2 p-1 rounded hover:bg-accent"
          title="Remove strikethrough"
        >
          <Slash className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
