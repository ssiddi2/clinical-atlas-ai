import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";

interface VerificationBannerProps {
  status: 'pending' | 'verified' | 'rejected' | null;
  onboardingCompleted: boolean;
}

const VerificationBanner = ({ status, onboardingCompleted }: VerificationBannerProps) => {
  const { t } = useTranslation();
  // Don't show banner if verified
  if (status === 'verified') return null;

  // Show complete profile banner if onboarding not done
  if (!onboardingCompleted) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{t("dashboard.verification.completeProfile")}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t("dashboard.verification.completeProfileDesc")}
            </p>
            <Button asChild size="sm" className="gradient-livemed">
              <Link to="/onboarding">{t("dashboard.verification.completeProfileBtn")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pending verification
  if (status === 'pending') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-1">{t("dashboard.verification.pending")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.verification.pendingDesc")}
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100 hover:text-orange-700 flex-shrink-0">
            <Link to="/profile">View Status</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Rejected
  if (status === 'rejected') {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{t("dashboard.verification.failed")}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t("dashboard.verification.failedDesc")}
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/onboarding">{t("dashboard.verification.uploadNew")}</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/contact">{t("dashboard.verification.contactSupport")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerificationBanner;
