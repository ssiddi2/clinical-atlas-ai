import { Link } from "react-router-dom";
import livemedLogoFull from "@/assets/livemed-logo-full.png";

const Footer = () => {
  const footerLinks = {
    Programs: [
      { label: "Pre-Clinical", href: "/programs/pre-clinical" },
      { label: "Clinical Years", href: "/programs/clinical" },
      { label: "Residency Prep", href: "/programs/residency" },
      { label: "CME", href: "/programs/cme" },
    ],
    Platform: [
      { label: "ATLAS™ AI Professor", href: "/atlas" },
      { label: "Virtual Rotations", href: "/rotations" },
      { label: "Assessments", href: "/assessments" },
      { label: "Live Sessions", href: "/live" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "For Institutions", href: "/institutions" },
      { label: "Contact", href: "/contact" },
    ],
    Resources: [
      { label: "Pricing", href: "/pricing" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img 
                src={livemedLogoFull} 
                alt="Livemed Learning" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The global standard for AI-powered medical education.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-5 text-xs uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
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

      {/* Bottom Bar */}
      <div className="border-t border-border/20">
        <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Livemed Learning. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
