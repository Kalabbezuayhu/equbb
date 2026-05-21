import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { ToastProvider } from './components/ui/Toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import UserDashboard from './pages/UserDashboard';
import DrawPage from './pages/DrawPage';

const App: React.FC = () => {
  const { darkMode, isAuthenticated, user } = useAppStore();
  const isAdmin = user?.role === 'admin';

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ToastProvider>
      <Router>
        <div className={darkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminPage /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={isAuthenticated ? (isAdmin ? <AdminPage /> : <UserDashboard />) : <Navigate to="/login" />} />
              <Route path="/draw" element={isAuthenticated ? <DrawPage /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
