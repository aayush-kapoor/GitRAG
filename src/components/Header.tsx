import { GithubIcon as GitHubIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-dark-100/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GitHubIcon className="h-6 w-6 text-gray-900 dark:text-white" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">GitRAG</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700" />
            )}
          </Button>
          
          <a
            href="https://github.com/yourusername/repo-rag"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}