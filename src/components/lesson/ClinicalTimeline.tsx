import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  TestTube, 
  Pill, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface TimelineEvent {
  label: string;
  description: string;
  type: "presentation" | "exam" | "labs" | "diagnosis" | "treatment" | "outcome";
  time?: string;
}

interface ClinicalTimelineProps {
  title: string;
  events: TimelineEvent[];
}

const typeConfig: Record<string, { icon: typeof Stethoscope; color: string; bg: string }> = {
  presentation: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  exam: { icon: Stethoscope, color: "text-cyan-400", bg: "bg-cyan-500/20 border-cyan-500/30" },
  labs: { icon: TestTube, color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/30" },
  diagnosis: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" },
  treatment: { icon: Pill, color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
  outcome: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
};

const ClinicalTimeline = ({ title, events }: ClinicalTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative ml-4">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => {
              const config = typeConfig[event.type] || typeConfig.presentation;
              const Icon = config.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative pl-10"
                >
                  {/* Node */}
                  <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-foreground">{event.label}</h4>
                      {event.time && (
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicalTimeline;
