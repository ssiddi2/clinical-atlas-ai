import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  { icon: GraduationCap, text: "Submit an application with your medical school transcript" },
  { icon: ShieldCheck, text: "Faculty verify your credential, then review your application" },
  { icon: Award, text: "Placements unlock evaluations, Letters of Recommendation & match support" },
];

export default function UpgradeToApplyDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Applied-for clinical pathway</DialogTitle>
          <DialogDescription>
            Virtual rotations with live physicians aren't a one-click purchase. They're a faculty-verified clinical
            pathway — and applicants need an active All-Access membership before applying.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 py-2">
          {benefits.map((b) => (
            <li key={b.text} className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="h-4 w-4 text-accent" />
              </div>
              <span className="text-muted-foreground pt-1.5">{b.text}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Maybe later</Button>
          <Button asChild className="gradient-livemed">
            <Link to="/apply">Start your application<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}