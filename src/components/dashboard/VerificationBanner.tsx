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
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <AlertCircle className="h-[18px] w-[18px]" />
          </span>
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
          <span className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </span>
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
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-destructive text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <XCircle className="h-[18px] w-[18px]" />
          </span>
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
