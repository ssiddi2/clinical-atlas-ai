import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  /** Where to land when there is no history to pop (deep link, fresh tab). */
  fallback?: string;
  /** Routes that are already a home surface and never show the control. */
  hideOn?: string[];
  className?: string;
}

/**
 * Shared "go back" control. Pops browser history when there is any,
 * otherwise routes to a sensible home so a deep link never dead-ends.
 */
const BackButton = ({
  fallback = "/dashboard",
  hideOn = ["/", "/dashboard", "/index"],
  className = "",
}: BackButtonProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (hideOn.includes(pathname)) return null;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback, { replace: true });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={goBack}
      aria-label="Go back"
      className={`rounded-full bg-muted/60 hover:bg-muted text-foreground/80 flex-shrink-0 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default BackButton;
