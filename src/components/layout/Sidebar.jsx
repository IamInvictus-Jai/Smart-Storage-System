import { Home, Search, Crown, LogOut, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();
  
  const isAdmin = user?.role === 'admin';
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  // Close sidebar on mobile after navigation
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  };
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/query', icon: Search, label: 'Query' },
    { to: '/data/import', icon: Database, label: 'Data Import' },
  ];
  
  if (isAdmin) {
    navItems.push({ to: '/admin', icon: Crown, label: 'Admin' });
  }
  
  return (
    <>
      {/* Backdrop for mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-surface border-r border-border shadow-lg
          transition-all duration-300 z-30 flex flex-col
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
        `}
      >
        {/* Toggle button (desktop only) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-surface border border-border rounded-full items-center justify-center hover:bg-surface-hover transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-text" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-text" />
          )}
        </button>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-text hover:bg-surface-hover'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon 
                className={`w-5 h-5 flex-shrink-0 ${
                  item.label === 'Admin' ? 'text-yellow-500' : ''
                }`} 
              />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        {/* Account section */}
        <div className="p-4 border-t border-border">
          <div className={`${sidebarCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-2'}`}>
            {!sidebarCollapsed && (
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-text truncate">{user?.email}</p>
                <p className="text-xs text-text-secondary capitalize">{user?.role || 'user'}</p>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors w-full ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
