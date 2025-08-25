import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { MessageCircle, Shield, Home, BookOpen, HelpCircle, Award } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onChatOpen: () => void;
}

export function Header({ currentSection, onSectionChange, onChatOpen }: HeaderProps) {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-green-100 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="font-bold text-green-800 dark:text-green-400 text-lg">Safhira</h1>
              <p className="text-xs text-green-600 dark:text-green-500">Modern Health Education</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant={currentSection === 'home' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('home')}
              className="flex items-center space-x-2"
            >
              <Home size={16} />
              <span>Home</span>
            </Button>
            <Button
              variant={currentSection === 'quiz' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('quiz')}
              className="flex items-center space-x-2"
            >
              <Award size={16} />
              <span>Quiz</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onChatOpen}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <MessageCircle size={16} />
              <span>Private Chat</span>
            </Button>
          </nav>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <Shield size={12} />
              <span className="text-xs">100% Private</span>
            </Badge>
            
            {/* Theme Toggle Button */}
            <ThemeToggle />
            
            <Button
              className="md:hidden"
              variant="outline"
              size="sm"
              onClick={onChatOpen}
            >
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}