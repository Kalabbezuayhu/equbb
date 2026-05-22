import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store';
import { Moon, Sun, Users, DollarSign, Trophy, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { toggleDarkMode, darkMode } = useAppStore();

  const features = [
    {
      icon: <Users className="w-10 h-10 text-primary-500" />,
      title: "👥 Member Management",
      description: "The official roster of our financial syndicate."
    },
    {
      icon: <DollarSign className="w-10 h-10 text-gold-500" />,
      title: "💰 Contribution Tracking",
      description: "A transparent ledger of financial responsibility.."
    },
    {
      icon: <Trophy className="w-10 h-10 text-primary-500" />,
      title: "🎲 Fair Turn System",
      description: "Powered by an unbiased algorithm, not favoritism."
    },
    {
      icon: <Shield className="w-10 h-10 text-gold-500" />,
      title: "🔒 Simple & Reliable",
      description: "Built to be so foolproof that even the friend who loses their keys five times a day can use it."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">EqubPro</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Equb for Fresh Corner
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Where our group pools its funds fairly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link to="/login">
                    <Button size="lg" className="gap-2 text-lg">
                      Start
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="text-lg">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-200 dark:bg-primary-900/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold-200 dark:bg-gold-900/30 rounded-full blur-3xl"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Collection</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">ETB 0</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rounds</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">1</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Winners</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"> WHY THIS EQUb?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Teamwork makes my dream work.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">🎉 Ready to start your Equb?</h2>
            <p className="text-xl text-primary-100 mb-8">Join now… before your friends start a new group without you 😭</p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 text-lg">Join now</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">EqubPro</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">© 2026 EqubPro. All rights reserved(kalab bezuayhu).</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
