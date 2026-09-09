import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Award, TrendingUp, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";

const CaseStudies = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "92%", label: t("caseStudies.matchRate"), icon: Target },
    { value: "500+", label: t("caseStudies.matchedIMGs"), icon: GraduationCap },
    { value: "45+", label: t("caseStudies.countries"), icon: Users },
    { value: "35pt", label: t("caseStudies.avgImprovement"), icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">{t("caseStudies.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {t("caseStudies.title")}{" "}
              <span className="text-primary">{t("caseStudies.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("caseStudies.subtitle")}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t("caseStudies.readyWrite")}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              {t("caseStudies.readyWriteDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary" asChild>
                <Link to="/programs">
                  {t("caseStudies.explorePrograms")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/contact">{t("caseStudies.requestInfo")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
