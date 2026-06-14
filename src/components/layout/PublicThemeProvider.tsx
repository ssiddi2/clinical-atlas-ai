import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export const usePublicTheme = () => useContext(ThemeCtx);

export const PublicThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof localStorage !== "undefined" && localStorage.getItem("public-theme") === "light"
      ? "light"
      : "dark",
  );

  useEffect(() => {
    localStorage.setItem("public-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div className={`min-h-screen flex flex-col${theme === "light" ? " theme-light" : ""}`}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
};