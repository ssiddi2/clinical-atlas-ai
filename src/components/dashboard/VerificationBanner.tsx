import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface VerificationBannerProps {
  status: 'pending' | 'verified' | 'rejected' | null;
  onboardingCompleted: boolean;
}

const VerificationBanner = ({ status, onboardingCompleted }: VerificationBannerProps) => {
  // Don't show banner if verified
  if (status === 'verified') return null;

  // Show complete profile banner if onboarding not done
  if (!onboardingCompleted) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Complete Your Profile</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Finish setting up your student profile to unlock all features and verify your account.
            </p>
            <Button asChild size="sm" className="gradient-livemed">
              <Link to="/onboarding">Complete Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pending verification
  if (status === 'pending') {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Verification Pending</h4>
            <p className="text-sm text-muted-foreground">
              Your documents are being reviewed. You have access to limited features while we verify your student status. This typically takes 24-48 hours.
            </p>
          </div>
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
            <h4 className="font-medium text-sm mb-1">Verification Failed</h4>
            <p className="text-sm text-muted-foreground mb-3">
              We couldn't verify your student status with the documents provided. Please upload clearer documents or contact support for assistance.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/onboarding">Upload New Documents</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/contact">Contact Support</Link>
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
