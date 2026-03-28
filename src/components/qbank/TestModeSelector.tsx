import { Clock, BookOpen, Timer, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageContext';

interface TestModeSelectorProps {
  selectedMode: 'tutor' | 'timed';
  onSelectMode: (mode: 'tutor' | 'timed') => void;
}

export default function TestModeSelector({ selectedMode, onSelectMode }: TestModeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Tutor Mode */}
      <Card
        className={cn(
          'p-6 cursor-pointer transition-all duration-200 border-2',
          selectedMode === 'tutor'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
        onClick={() => onSelectMode('tutor')}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              selectedMode === 'tutor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{t("qbank.testMode.tutor")}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("qbank.testMode.tutorDesc")}
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                {t("qbank.testMode.instantExplanations")}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                {t("qbank.testMode.learnAsYouGo")}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                {t("qbank.testMode.noTimePressure")}
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Timed Mode */}
      <Card
        className={cn(
          'p-6 cursor-pointer transition-all duration-200 border-2',
          selectedMode === 'timed'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
        onClick={() => onSelectMode('timed')}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              selectedMode === 'timed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <Timer className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{t("qbank.testMode.timed")}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("qbank.testMode.timedDesc")}
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3 text-primary" />
                {t("qbank.testMode.realisticTiming")}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3 text-primary" />
                {t("qbank.testMode.avgTime")}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3 text-primary" />
                {t("qbank.testMode.reviewAtEnd")}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
