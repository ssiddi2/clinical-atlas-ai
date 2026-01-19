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
    <footer className="relative border-t border-white/5 bg-livemed-deep overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1 mb-4 md:mb-0">
            <Link to="/" className="inline-block mb-4 md:mb-6 group">
              <img 
                src={livemedLogoFull} 
                alt="LIVEMED University" 
                className="h-12 md:h-24 object-contain logo-glow transition-all duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-xs md:text-sm text-white/40 leading-relaxed max-w-[200px]">
              Division of Clinical & Continuing Medical Education
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
            LIVEMED University is a professional medical education platform offering clinical and continuing medical education. 
            LIVEMED University is not a degree-granting institution and does not award MD or equivalent medical degrees.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 relative">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} LIVEMED University. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
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
