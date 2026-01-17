import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import livemedLogoFull from "@/assets/livemed-logo-full.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Programs", href: "/programs" },
    { label: "ATLAS™", href: "/atlas" },
    { label: "Rotations", href: "/rotations" },
    { label: "Institutions", href: "/institutions" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={livemedLogoFull} 
            alt="Livemed Learning" 
            className="h-8 w-auto" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-transparent"
            asChild
          >
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button 
            className="gradient-livemed rounded-full px-6 text-sm font-medium shadow-sm hover:shadow-md transition-shadow" 
            asChild
          >
            <Link to="/auth?mode=signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
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
        <div className="md:hidden glass-effect border-t border-border/20">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-border/20">
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="gradient-livemed rounded-full" asChild>
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
