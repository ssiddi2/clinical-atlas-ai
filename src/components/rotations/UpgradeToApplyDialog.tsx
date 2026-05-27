import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Stethoscope, Video, ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  { icon: Stethoscope, text: "Apply to live virtual rotations with US-based attendings" },
  { icon: Video, text: "Join Virtual Rounds and bedside teaching sessions" },
  { icon: Award, text: "Eligible for Letters of Recommendation & evaluations" },
];

export default function UpgradeToApplyDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clinical membership required</DialogTitle>
          <DialogDescription>
            Virtual rotations are part of the Clinical tier. Upgrade to submit your application.
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
            <Link to="/apply">Upgrade to Clinical<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}