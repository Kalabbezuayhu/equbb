import React, { useState } from 'react';
import { Menu, Moon, Sun, Bell, User, ChevronDown, X, LogOut } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  toggleSidebar: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar }) => {
  const { darkMode, toggleDarkMode, notifications, user, logout } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 sticky top-0 z-30">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1 lg:flex-none"></div>

        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
                          !notification.read && "bg-primary-50 dark:bg-primary-900/20"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-gray-500 text-sm">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
