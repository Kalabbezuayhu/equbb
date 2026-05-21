import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { Settings, DollarSign, Calendar, Save, Moon, Sun } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useAppStore();
  const [equbName, setEqubName] = useState('Workplace Equb');
  const [contributionAmount, setContributionAmount] = useState('1000');
  const [roundDuration, setRoundDuration] = useState('30');
  const [totalMembers, setTotalMembers] = useState('12');

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your Equb configuration</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Settings</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equb Name</label>
                      <Input value={equbName} onChange={(e) => setEqubName(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleDarkMode}
                        className={cn(
                          "w-14 h-7 rounded-full transition-colors relative",
                          darkMode ? "bg-primary-600" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
                          darkMode ? "left-8" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contribution</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount per Round (ETB)</label>
                      <Input type="number" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Round Settings</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Round Duration (Days)</label>
                      <Input type="number" value={roundDuration} onChange={(e) => setRoundDuration(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Members</label>
                      <Input type="number" value={totalMembers} onChange={(e) => setTotalMembers(e.target.value)} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="gap-2"><Save className="w-5 h-5" /> Save Changes</Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
