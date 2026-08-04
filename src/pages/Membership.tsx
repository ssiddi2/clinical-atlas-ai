import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmbeddedCheckoutPanel } from "@/components/payments/EmbeddedCheckoutPanel";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { ALL_ACCESS_PRICE_ID } from "@/lib/stripe";

const includes = [
  "Unlimited ATLAS™ — your AI Professor",
  "Full curriculum across 10 core specialties",
  "Complete QBank with tutor and timed modes",
  "USMLE Step 2 CK Score Predictor",
  "Residency prep and MATCH readiness content",
];

export default function Membership() {
  const [params] = useSearchParams();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { isActive, status, currentPeriodEnd } = useSubscription(user?.id ?? null);
  const completed = !!params.get("session_id");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null),
    );
  }, []);

  return (
    <div className="flex-1">
      <PaymentTestModeBanner />
      <section className="py-16 md:py-20 bg-section-glow">
        <div className="container mx-auto max-w-3xl">
          <div className="chip chip-brand mb-6">
            <Sparkles className="h-4 w-4" />
            All-Access membership
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need to train smarter
          </h1>
          <p className="text-lg text-soft mb-10">
            $75 per quarter, billed every three months. Start with a 1-month free trial — card
            required, cancel any time before it ends.
          </p>

          <div className="lm-card p-8">
            {completed ? (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">Thank you — your membership is being activated</h2>
                <p className="text-sm text-muted-foreground">
                  It can take a few seconds to appear. You can head back to your dashboard now.
                </p>
                <Button asChild className="gradient-livemed">
                  <Link to="/dashboard">Go to dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ) : isActive ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">All-Access is active</h2>
                  <Badge variant="outline">{status}</Badge>
                </div>
                {currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Current period ends {new Date(currentPeriodEnd).toLocaleDateString()}.
                  </p>
                )}
                <Button asChild variant="outline">
                  <Link to="/dashboard">Back to dashboard</Link>
                </Button>
              </div>
            ) : checkingOut && user ? (
              <EmbeddedCheckoutPanel
                priceId={ALL_ACCESS_PRICE_ID}
                userId={user.id}
                customerEmail={user.email}
                returnUrl={`${window.location.origin}/membership?session_id={CHECKOUT_SESSION_ID}`}
              />
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-display text-4xl font-bold">$75</span>
                  <span className="text-muted-foreground">/ quarter</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                {user ? (
                  <Button className="w-full gradient-livemed" onClick={() => setCheckingOut(true)}>
                    Start 1-month free trial<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild className="w-full gradient-livemed">
                    <Link to="/auth">Sign in to subscribe</Link>
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Live physician rotations and Virtual Rounds are a separate, applied-for clinical
                  pathway and are not included in this membership.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}