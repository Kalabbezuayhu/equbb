import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { Users, DollarSign, Trophy, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const { fetchAllData, contributions, chartData, stats } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAllData();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLocalLoading(false);
      }
    };
    loadData();
  }, [fetchAllData]);

  if (localLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const statsData = [
    { title: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: 'from-primary-500 to-primary-700', change: '+2 this month' },
    { title: 'Total Collection', value: `ETB ${(stats?.totalCollection || 0).toLocaleString()}`, icon: DollarSign, color: 'from-gold-500 to-gold-700', change: '+12% from last round' },
    { title: 'Current Round', value: stats?.currentRound || 0, icon: Calendar, color: 'from-blue-500 to-blue-700', change: 'Ends in 3 days' },
    { title: 'Current Winner', value: stats?.currentWinner || '', icon: Trophy, color: 'from-purple-500 to-purple-700', change: 'Round 4 winner' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hey there! 👋</h1>
              <p className="text-gray-600 dark:text-gray-300">Let's see what's up with your Equb crew today.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center", stat.color)}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">{stat.change}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contribution Trends</h2>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Area type="monotone" dataKey="contributions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorContributions)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Draw</h2>
                  </div>
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/10 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Round 5</h3>
                    <p className="text-primary-700 dark:text-primary-300 font-semibold mb-4">Draw on June 20, 2024</p>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                        <p className="text-xs text-gray-500">Days</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                        <p className="text-xs text-gray-500">Hours</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                        <p className="text-xs text-gray-500">Mins</p>
                      </div>
                    </div>
                    <Button className="w-full">View Details</Button>
                  </div>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Payments</h2>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Member</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Round</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.map((contribution, index) => (
                        <motion.tr 
                          key={contribution.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {contribution.memberName.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{contribution.memberName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">Round {contribution.round}</td>
                          <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">ETB {contribution.amount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{contribution.paidAt || '-'}</td>
                          <td className="py-4 px-4">
                            {contribution.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
