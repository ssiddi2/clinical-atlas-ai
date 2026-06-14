import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import livemedLogoFull from "@/assets/livemed-logo-full.png.asset.json";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePublicTheme } from "./PublicThemeProvider";
import { useTranslation } from "@/i18n";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { theme, toggle } = usePublicTheme();

  const navItems = [
    { label: t("nav.programs"), href: "/programs" },
    { label: t("nav.rotations"), href: "/rotations" },
    { label: t("nav.institutions"), href: "/institutions" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-[#030508]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20" 
          : "bg-[#030508]/60 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none"
      }`}
    >
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center group flex-shrink-0">
          <img 
            src={livemedLogoFull.url} 
            alt="Livemed Academy" 
            className="h-8 md:h-11 transition-all duration-300 group-hover:opacity-80 object-contain"
            width="176"
            height="44"
            fetchPriority="high"
            decoding="sync"
          />
        </Link>

        {/* Desktop Navigation */}
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

        {/* Auth Buttons + Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <LanguageSwitcher />
          <Button 
            variant="ghost" 
            className="text-[13px] font-normal text-white/70 hover:text-white hover:bg-transparent px-0"
            asChild
          >
            <Link to="/auth">{t("nav.signIn")}</Link>
          </Button>
          <Button 
            className="bg-white text-black hover:bg-white/90 rounded-full px-5 h-8 text-[13px] font-medium" 
            asChild
          >
            <Link to="/apply">{t("nav.applyNow")}</Link>
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2 text-white hover:text-white transition-colors"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            className="p-2 text-white hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Language</span>
                <LanguageSwitcher />
              </div>
              <button
                onClick={toggle}
                className="flex items-center justify-between text-white/70 hover:text-white transition-colors"
              >
                <span className="text-white/40 text-sm">Theme</span>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <Button variant="ghost" className="justify-start text-white/70 hover:text-white hover:bg-transparent" asChild>
                <Link to="/auth">{t("nav.signIn")}</Link>
              </Button>
              <Button className="bg-white text-black hover:bg-white/90 rounded-full font-medium" asChild>
                <Link to="/apply">{t("nav.applyNow")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
