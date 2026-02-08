import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import livemedLogoFull from "@/assets/livemed-logo-full.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Programs", href: "/programs" },
    { label: "Rotations", href: "/rotations" },
    { label: "Institutions", href: "/institutions" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-[#030508]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo - Apple style compact */}
        <Link to="/" className="flex items-center group flex-shrink-0">
          <img 
            src={livemedLogoFull} 
            alt="Livemed Academy" 
            className="h-8 md:h-11 transition-all duration-300 group-hover:opacity-80 object-contain" 
          />
        </Link>

        {/* Desktop Navigation - Apple style */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-[13px] font-normal text-white/70 hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Minimal */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-[13px] font-normal text-white/70 hover:text-white hover:bg-transparent px-0"
            asChild
          >
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button 
            className="bg-white text-black hover:bg-white/90 rounded-full px-5 h-8 text-[13px] font-medium" 
            asChild
          >
            <Link to="/apply">Apply Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
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
        <div className="md:hidden bg-[#030508]/95 backdrop-blur-2xl border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-base font-normal text-white/70 hover:text-white active:bg-white/10 transition-colors py-4 border-b border-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-white/10">
              <Button variant="ghost" className="justify-start text-white/70 hover:text-white hover:bg-transparent" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="bg-white text-black hover:bg-white/90 rounded-full font-medium" asChild>
                <Link to="/apply">Apply Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;