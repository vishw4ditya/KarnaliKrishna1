import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggler = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
      title="Toggle Light/Dark Theme"
      id="theme-toggler"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-indigo-500" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
};

export default ThemeToggler;
