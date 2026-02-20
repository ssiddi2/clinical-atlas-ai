import { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lightbulb, Play } from "lucide-react";

const AnimatedDiagram = lazy(() => import("./AnimatedDiagram"));
const ClinicalTimeline = lazy(() => import("./ClinicalTimeline"));

interface LessonSection {
  id: string;
  section_order: number;
  section_title: string;
  content_type: string;
  content_text: string | null;
  media_url: string | null;
  media_caption: string | null;
}

interface LessonContentRendererProps {
  section: LessonSection;
}

const LessonContentRenderer = ({ section }: LessonContentRendererProps) => {
  const renderContent = () => {
    switch (section.content_type) {
      case "text":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{section.section_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {section.content_text?.split("\n").map((paragraph, idx) => (
                  <p key={idx} className="text-base leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "video":
        const videoId = extractVideoId(section.media_url);
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Play className="h-5 w-5 text-accent" />
                {section.section_title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={section.section_title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    Video not available
                  </div>
                )}
              </div>
              {section.media_caption && (
                <p className="text-sm text-muted-foreground mt-3 italic">
                  {section.media_caption}
                </p>
              )}
            </CardContent>
          </Card>
        );

      case "image":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{section.section_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden">
                <img
                  src={section.media_url || ""}
                  alt={section.section_title}
                  className="w-full h-auto object-contain max-h-[500px] mx-auto"
                />
              </div>
              {section.media_caption && (
                <p className="text-sm text-muted-foreground mt-3 text-center italic">
                  {section.media_caption}
                </p>
              )}
              {section.content_text && (
                <div className="mt-4 prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed">{section.content_text}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "clinical_pearl":
        return (
          <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    Clinical Pearl: {section.section_title}
                  </h4>
                  <p className="text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                    {section.content_text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "key_points":
        const points = section.content_text?.split("\n").filter(Boolean) || [];
        return (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                {section.section_title || "Key Points"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-base leading-relaxed">{point.replace(/^[•\-\d.]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );

      case "animated_diagram":
        try {
          const diagramData = JSON.parse(section.content_text || "{}");
          return (
            <Suspense fallback={<Card><CardContent className="p-6 text-muted-foreground">Loading diagram…</CardContent></Card>}>
              <AnimatedDiagram
                title={section.section_title}
                steps={diagramData.steps || []}
                viewBox={diagramData.viewBox}
              />
            </Suspense>
          );
        } catch {
          return null;
        }

      case "clinical_timeline":
        try {
          const timelineData = JSON.parse(section.content_text || "{}");
          return (
            <Suspense fallback={<Card><CardContent className="p-6 text-muted-foreground">Loading timeline…</CardContent></Card>}>
              <ClinicalTimeline
                title={section.section_title}
                events={timelineData.events || []}
              />
            </Suspense>
          );
        } catch {
          return null;
        }

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{section.section_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{section.content_text}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return renderContent();
};

// Helper function to extract YouTube video ID
function extractVideoId(url: string | null): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /vimeo\.com\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export default LessonContentRenderer;
