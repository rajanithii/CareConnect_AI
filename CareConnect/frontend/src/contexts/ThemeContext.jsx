import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const value = { isDark, toggleTheme: () => setIsDark((d) => !d) };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
