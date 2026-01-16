import { Link } from "react-router-dom";
import livemedLogo from "@/assets/livemed-logo.png";

const Footer = () => {
  const footerLinks = {
    Programs: [
      { label: "Pre-Clinical", href: "/programs/pre-clinical" },
      { label: "Clinical Years", href: "/programs/clinical" },
      { label: "Residency Prep", href: "/programs/residency" },
      { label: "CME", href: "/programs/cme" },
    ],
    Platform: [
      { label: "ELI™ AI Professor", href: "/eli" },
      { label: "Virtual Rotations", href: "/rotations" },
      { label: "Assessments", href: "/assessments" },
      { label: "Live Sessions", href: "/live" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "For Institutions", href: "/institutions" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
    Resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Support", href: "/support" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={livemedLogo} alt="LIVEMED" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The global standard for AI-powered medical education.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LIVEMED University
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4 text-sm">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Designed for the future of medical education
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
