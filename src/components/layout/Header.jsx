import { Upload, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { Avatar } from '../common/Avatar';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const { sidebarCollapsed, toggleSidebar, openUploadModal } = useUIStore();
  
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
      {/* Left: Menu button (mobile) + App name */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <Menu className="w-5 h-5 text-text" />
          ) : (
            <X className="w-5 h-5 text-text" />
          )}
        </button>
        
        <h1 className="text-xl font-bold text-text">
          Smart Storage
        </h1>
      </div>
      
      {/* Right: Upload button + Theme toggle + Avatar */}
      <div className="flex items-center gap-3">
        {/* <button
          onClick={openUploadModal}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-all font-semibold shadow-md hover:shadow-lg"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button> */}
        
        <ThemeToggle />
        
        <Avatar email={user?.email || 'user@example.com'} size="md" />
      </div>
    </header>
  );
};
