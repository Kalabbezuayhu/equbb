import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { useAppStore, useToast } from '../store';
import { DollarSign, CheckCircle2, Clock } from 'lucide-react';

const ContributionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  
  const { contributions, fetchAllData, markContributionPaid } = useAppStore();
  const { addToast } = useToast();

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

  const handleMarkPaid = async (id: number) => {
    try {
      await markContributionPaid(id);
      addToast('Contribution marked as paid! ✅', 'success');
    } catch (error) {
      addToast('Failed to mark contribution as paid!', 'error');
    }
  };

  const totalPaid = contributions.filter(c => c.status === 'paid').length;
  const totalUnpaid = contributions.filter(c => c.status === 'unpaid').length;
  const totalCollection = totalPaid * 1000;

  if (localLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Contributions Page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contributions</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage all contributions and mark them as paid</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Total Collected</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">ETB {totalCollection.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">Total from paid contributions</p>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Paid</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPaid}/{contributions.length}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round((totalPaid / contributions.length) * 100)}% completion rate</p>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnpaid}/{contributions.length}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ETB {(totalUnpaid * 1000).toLocaleString()} remaining</p>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contribution Details</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Member</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Round</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.map((contribution, index) => (
                        <motion.tr 
                          key={contribution.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {contribution.memberName.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">{contribution.memberName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">Round {contribution.round}</td>
                          <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">ETB {contribution.amount.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            {contribution.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {contribution.status === 'unpaid' && (
                              <Button size="sm" onClick={() => handleMarkPaid(contribution.id)}>
                                Mark Paid
                              </Button>
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

export default ContributionsPage;
