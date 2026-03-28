import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/i18n/LanguageContext';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, description, compact = false }: UpgradePromptProps) {
  const { t } = useTranslation();
  const defaultDescriptions: Record<string, string> = {
    virtualRounds: t('dashboard.upgrade.virtualRounds', 'Join live telemedicine rounds with US physicians and earn clinical hours.'),
    rotationExperience: t('dashboard.upgrade.rotationExperience', 'Experience authentic clinical cases with real-time feedback.'),
    residencyPrep: t('dashboard.upgrade.residencyPrep', 'Access the full residency readiness program including CV review and mock interviews.'),
    lor: t('dashboard.upgrade.lor', 'Request letters of recommendation from faculty who have observed your clinical work.'),
  };

  const desc = description || defaultDescriptions[feature] || t('dashboard.upgrade.defaultDesc', 'Upgrade to Clinical tier to unlock this feature.');

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{t("dashboard.upgrade.clinicalRequired")}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/contact?type=upgrade">
            {t("dashboard.upgrade.learnMore")}
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md w-full glass-card border-primary/20 overflow-hidden">
        <div className="h-2 gradient-livemed" />
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t("dashboard.upgrade.upgradeTitle")}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {desc}
          </p>

          <div className="space-y-3">
            <Button className="w-full gradient-livemed" asChild>
              <Link to="/contact?type=upgrade">
                {t("dashboard.upgrade.requestAccess")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.upgrade.note")}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
