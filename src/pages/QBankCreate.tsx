import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useQBankSession } from '@/hooks/useQBankSession';
import TestModeSelector from '@/components/qbank/TestModeSelector';
import FilterPanel from '@/components/qbank/FilterPanel';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/LanguageContext';
import { useLearningProfile } from '@/hooks/useLearningProfile';
import AdaptedBadge from '@/components/learning/AdaptedBadge';

export default function QBankCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createSession, isLoading } = useQBankSession();
  const { t } = useTranslation();
  const { adaptation } = useLearningProfile();

  const [mode, setMode] = useState<'tutor' | 'timed'>('tutor');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [filters, setFilters] = useState({
    subjects: [] as string[],
    systems: [] as string[],
    difficulties: [] as string[],
    specialtyIds: [] as string[],
    questionStatus: 'all' as 'unused' | 'incorrect' | 'flagged' | 'all',
  });
  const [availableCount, setAvailableCount] = useState(0);
  const [isCheckingCount, setIsCheckingCount] = useState(false);
  const [appliedAdaptation, setAppliedAdaptation] = useState(false);

  // Apply learning-profile defaults once on first load.
  useEffect(() => {
    if (!adaptation || appliedAdaptation) return;
    setMode(adaptation.defaultMode);
    setQuestionCount(adaptation.recommendedQuestionCount);
    setFilters((prev) => prev.difficulties.length ? prev : { ...prev, difficulties: adaptation.recommendedDifficulty });
    setAppliedAdaptation(true);
  }, [adaptation, appliedAdaptation]);

  // Set initial status from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'incorrect' || status === 'flagged' || status === 'unused') {
      setFilters(prev => ({ ...prev, questionStatus: status }));
    }
  }, [searchParams]);

  // Check available question count when filters change
  useEffect(() => {
    const checkAvailableCount = async () => {
      setIsCheckingCount(true);
      
      let query = supabase
        .from('qbank_questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (filters.subjects.length) {
        query = query.in('subject', filters.subjects);
      }
      if (filters.systems.length) {
        query = query.in('system', filters.systems);
      }
      if (filters.difficulties.length) {
        const difficulties = filters.difficulties as Array<'easy' | 'medium' | 'hard'>;
        query = query.in('difficulty', difficulties);
      }
      if (filters.specialtyIds.length) {
        query = query.in('specialty_id', filters.specialtyIds);
      }

      const { count } = await query;
      setAvailableCount(count || 0);
      setIsCheckingCount(false);
    };

    checkAvailableCount();
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleStartTest = async () => {
    const sessionId = await createSession({
      mode,
      questionCount: Math.min(questionCount, availableCount),
      timeLimitMinutes: mode === 'timed' ? timeLimitMinutes : undefined,
      filters,
    });

    if (sessionId) {
      navigate(`/qbank/session/${sessionId}`);
    }
  };

  const PRESET_COUNTS = [10, 20, 40];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/qbank')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{t("qbank.createTest")}</h1>
              <p className="text-sm text-muted-foreground">{t("qbank.configureSession")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Test Mode */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-foreground">{t("qbank.testMode")}</h2>
                {adaptation && <AdaptedBadge />}
              </div>
              {adaptation?.hideTimerByDefault && (
                <p className="text-xs text-muted-foreground mb-3">
                  Tutor mode is preselected because you flagged high test anxiety — timer is off by default.
                </p>
              )}
              <TestModeSelector selectedMode={mode} onSelectMode={setMode} />
            </section>

            {/* Question Count */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("qbank.numberOfQuestions")}</h2>
              <Card className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                  {PRESET_COUNTS.map((count) => (
                    <Button
                      key={count}
                      variant={questionCount === count ? 'default' : 'outline'}
                      onClick={() => setQuestionCount(count)}
                      className="min-w-[60px]"
                    >
                      {count}
                    </Button>
                  ))}
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">{t("qbank.custom")}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={availableCount || 100}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <Slider
                  value={[questionCount]}
                  onValueChange={([value]) => setQuestionCount(value)}
                  min={1}
                  max={Math.max(availableCount, 100)}
                  step={1}
                  className="mb-2"
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1</span>
                  <span>{availableCount} {t("qbank.available")}</span>
                </div>
              </Card>
            </section>

            {/* Time Limit (Timed Mode Only) */}
            {mode === 'timed' && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">{t("qbank.timeLimit")}</h2>
                <Card className="p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    {[15, 30, 45, 60].map((mins) => (
                      <Button
                        key={mins}
                        variant={timeLimitMinutes === mins ? 'default' : 'outline'}
                        onClick={() => setTimeLimitMinutes(mins)}
                      >
                        {mins} min
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[timeLimitMinutes]}
                      onValueChange={([value]) => setTimeLimitMinutes(value)}
                      min={5}
                      max={120}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-16">
                      {timeLimitMinutes} min
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    {t("qbank.recommendedTime").replace("{time}", String(Math.round(questionCount * 1.5))).replace("{count}", String(questionCount))}
                  </p>
                </Card>
              </section>
            )}
          </div>

          {/* Filters Sidebar */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("qbank.filters")}</h2>
            <FilterPanel onFiltersChange={handleFiltersChange} />

            {/* Start Button */}
            <Card className="p-6 mt-6 sticky top-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">{t("qbank.readyToStart")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.min(questionCount, availableCount)} {t("qbank.questions")}
                </p>
                {mode === 'timed' && (
                  <p className="text-sm text-muted-foreground">{timeLimitMinutes} {t("qbank.timeLimit").toLowerCase()}</p>
                )}
              </div>
              
              {availableCount === 0 && !isCheckingCount && (
                <p className="text-sm text-red-400 text-center mb-4">
                  {t("qbank.noQuestionsMatch")}
                </p>
              )}

              <Button
                onClick={handleStartTest}
                disabled={isLoading || availableCount === 0}
                className="w-full gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                {isLoading ? t("qbank.creating") : t("qbank.startTest")}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
