import React from 'react';
import { Page } from '../App';
import { ArrowLeftOnRectangleIcon, ChartBarIcon, CocktailIcon, UsersIcon, UserCircleIcon, Cog6ToothIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onLogout: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onLogout, onLogin, isAuthenticated }) => {
  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'COWORKERS', label: 'Coworkers', icon: UsersIcon },
    { id: 'SETTINGS', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full bg-dark-card flex flex-col transition-all duration-300 ease-in-out w-16 hover:w-64 group z-30">
      <div className="flex items-center h-20 border-b border-dark-border justify-center">
         <CocktailIcon className="w-8 h-8 text-brand-accent flex-shrink-0" />
         <span className="text-xl font-bold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 group-hover:ml-3 transition-all duration-200">ShiftLog</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id as Page)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-150 justify-center group-hover:justify-start
              ${activePage === item.id 
                ? 'bg-brand-primary text-white' 
                : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'
              }`}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            <span className="font-semibold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 group-hover:ml-4 transition-all duration-200">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-2 py-4 border-t border-dark-border">
         {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center p-3 rounded-lg transition-colors duration-150 text-dark-text-secondary hover:bg-dark-border hover:text-dark-text justify-center group-hover:justify-start"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 group-hover:ml-4 transition-all duration-200">Logout</span>
            </button>
         ) : (
            <button
              onClick={onLogin}
              className="w-full flex items-center p-3 rounded-lg transition-colors duration-150 text-dark-text-secondary hover:bg-dark-border hover:text-dark-text justify-center group-hover:justify-start"
            >
              <UserCircleIcon className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 group-hover:ml-4 transition-all duration-200">Sign In</span>
            </button>
         )}
      </div>
    </aside>
  );
};

export default Sidebar;