import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Layers } from "lucide-react";

interface DiagramStep {
  label: string;
  description: string;
  svgElements: string; // SVG path/group markup as string
  highlight?: string;
}

interface AnimatedDiagramProps {
  title: string;
  steps: DiagramStep[];
  viewBox?: string;
}

const AnimatedDiagram = ({ title, steps, viewBox = "0 0 400 300" }: AnimatedDiagramProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Layers className="h-5 w-5 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SVG Diagram Area */}
        <div className="relative bg-muted/30 rounded-xl p-4 overflow-hidden aspect-[4/3]">
          <svg viewBox={viewBox} className="w-full h-full" aria-label={title}>
            <AnimatePresence mode="wait">
              {steps.slice(0, currentStep + 1).map((step, idx) => (
                <motion.g
                  key={idx}
                  initial={{ opacity: 0, transform: "translateY(10px)" }}
                  animate={{ opacity: 1, transform: "translateY(0)" }}
                  transition={{ duration: 0.5, delay: idx === currentStep ? 0.1 : 0 }}
                  dangerouslySetInnerHTML={{ __html: step.svgElements }}
                />
              ))}
            </AnimatePresence>
          </svg>
        </div>

        {/* Step Info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-accent/5 border border-accent/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-semibold">
                {currentStep + 1}
              </span>
              <h4 className="font-semibold text-foreground">{steps[currentStep].label}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? "bg-accent w-4"
                    : idx < currentStep
                    ? "bg-accent/50"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next Step
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimatedDiagram;
