import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import livemedLogo from "@/assets/livemed-logo-light.png.asset.json";
import LanguageSwitcher from "./LanguageSwitcher";
import BackButton from "./BackButton";
import { useTranslation } from "@/i18n";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

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
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 md:pt-4">
      <div
        className={`container mx-auto flex h-14 md:h-16 items-center justify-between rounded-full border px-4 md:px-6 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-border shadow-lg shadow-foreground/5"
            : "bg-white/70 backdrop-blur-md border-border/60"
        }`}
      >
        {/* Back + Logo */}
        <div className="flex items-center gap-1.5 min-w-0">
        <BackButton fallback="/" className="-ml-1" />
        <Link to="/" className="flex items-center group flex-shrink-0">
          <img
            src={livemedLogo.url}
            alt="Livemed Academy"
            className="h-8 md:h-10 transition-all duration-300 group-hover:opacity-80 object-contain"
            width="176"
            height="44"
            fetchPriority="high"
            decoding="sync"
          />
        </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons + Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
            asChild
          >
            <Link to="/auth">{t("nav.signIn")}</Link>
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 h-9 text-[13px] font-semibold"
            asChild
          >
            <Link to="/apply">{t("nav.applyNow")}</Link>
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1">
          <button
            className="p-2 text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-lg shadow-foreground/5">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-base font-medium text-muted-foreground hover:text-foreground active:bg-muted transition-colors py-3.5 border-b border-border/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Language</span>
                <LanguageSwitcher />
              </div>
              <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground hover:bg-transparent" asChild>
                <Link to="/auth">{t("nav.signIn")}</Link>
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold" asChild>
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
