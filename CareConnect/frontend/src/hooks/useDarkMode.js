import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export function useDarkMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useDarkMode must be used within a ThemeProvider');
  return ctx;
}
