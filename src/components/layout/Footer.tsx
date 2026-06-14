import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import livemedLogoDark from "@/assets/livemed-logo-full.png";
import livemedLogoLight from "@/assets/livemed-logo-light.png.asset.json";
import { usePublicTheme } from "./PublicThemeProvider";
import { useTranslation } from "@/i18n";

const Footer = forwardRef<HTMLElement>((props, ref) => {
  const { t } = useTranslation();
  const { theme } = usePublicTheme();

  const footerLinks = {
    [t("footer.programs")]: [
      { label: t("footer.preClinical"), href: "/programs/pre-clinical" },
      { label: t("footer.clinicalYears"), href: "/programs/clinical" },
      { label: t("footer.residencyPrep"), href: "/programs/residency" },
      { label: t("footer.cme"), href: "/programs/cme" },
    ],
    [t("footer.platform")]: [
      { label: t("footer.atlasAI"), href: "/atlas" },
      { label: t("footer.virtualRotations"), href: "/rotations" },
      { label: t("footer.assessments"), href: "/assessments" },
      { label: t("footer.liveSessions"), href: "/live" },
    ],
    [t("footer.company")]: [
      { label: t("footer.aboutUs"), href: "/about" },
      { label: t("footer.forInstitutions"), href: "/institutions" },
      { label: t("footer.contact"), href: "/contact" },
    ],
    [t("footer.resources")]: [
      { label: t("footer.applyNow"), href: "/apply" },
      { label: t("footer.privacyPolicy"), href: "/privacy" },
      { label: t("footer.termsOfService"), href: "/terms" },
    ],
  };

  return (
    <footer ref={ref} className="relative border-t border-white/5 bg-livemed-deep overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1 mb-4 md:mb-0">
            <Link to="/" className="inline-block mb-4 md:mb-6 group">
              <img 
                src={theme === "light" ? livemedLogoLight.url : livemedLogoDark} 
                alt="Livemed Academy" 
                className="h-12 md:h-24 object-contain logo-glow transition-all duration-300 group-hover:scale-105"
                width="192"
                height="96"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-xs md:text-sm text-white/40 leading-relaxed max-w-[200px]">
              {t("footer.division")}
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white/80 mb-5 text-xs uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="border-t border-white/5 relative">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <p className="text-[10px] md:text-xs text-white/30 text-center max-w-4xl mx-auto leading-relaxed">
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 relative">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            {t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {t("footer.terms")}
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
