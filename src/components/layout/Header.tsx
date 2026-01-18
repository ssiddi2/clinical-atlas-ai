import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import livemedLogoFull from "@/assets/livemed-logo-full.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Programs", href: "/programs" },
    { label: "Rotations", href: "/rotations" },
    { label: "Institutions", href: "/institutions" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
      <div className="container mx-auto flex h-18 items-center justify-between px-6 py-3">
        {/* Logo with Glow */}
        <Link to="/" className="flex items-center group">
          <img 
            src={livemedLogoFull} 
            alt="Livemed Learning" 
            className="h-10 w-auto logo-glow transition-all duration-300 group-hover:scale-105" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gradient-to-r after:from-livemed-cyan after:to-livemed-blue hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-sm font-medium text-white/60 hover:text-white hover:bg-white/5"
            asChild
          >
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button 
            className="btn-glow gradient-livemed rounded-full px-6 text-sm font-semibold text-white shadow-glow" 
            asChild
          >
            <Link to="/auth?mode=signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dark border-t border-white/5">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-white/5">
              <Button variant="ghost" className="justify-start text-white/60 hover:text-white hover:bg-white/5" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="btn-glow gradient-livemed rounded-full font-semibold" asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
