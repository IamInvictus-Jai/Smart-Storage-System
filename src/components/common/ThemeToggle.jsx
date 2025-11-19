import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-text" />
      ) : (
        <Moon className="w-5 h-5 text-text" />
      )}
    </button>
  );
};
