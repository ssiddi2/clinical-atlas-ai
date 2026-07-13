import { createContext, useContext, type ReactNode } from "react";

// App is light-only. This provider is kept as a no-op passthrough so existing
// imports keep working; `theme` is always "light".
const ThemeCtx = createContext<{ theme: "light"; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export const usePublicTheme = () => useContext(ThemeCtx);

export const PublicThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeCtx.Provider value={{ theme: "light", toggle: () => {} }}>
    <div className="min-h-screen flex flex-col">{children}</div>
  </ThemeCtx.Provider>
);
