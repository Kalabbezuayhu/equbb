import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Home, Users, DollarSign, Trophy, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../store';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAppStore();
  const isAdmin = user?.role === 'admin';

  const adminNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/members', icon: Users, label: 'Members' },
    { path: '/contributions', icon: DollarSign, label: 'Contributions' },
    { path: '/draw', icon: Trophy, label: 'Draw & Winners' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const userNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/draw', icon: Trophy, label: 'Draw & Winners' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className={cn(
          "fixed lg:static top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 flex flex-col",
          !isOpen && "lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">EqubPro</span>
          </div>
          {isAdmin && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
              Admin
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive 
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
