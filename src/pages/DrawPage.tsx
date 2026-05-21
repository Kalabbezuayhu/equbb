import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store';
import { Trophy, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import RouletteWheel from '../components/RouletteWheel';

const DrawPage: React.FC = () => {
  const [localLoading, setLocalLoading] = useState(true);
  const navigate = useNavigate();
  
  const { 
    members, 
    winners, 
    fetchAllData, 
    user, 
    contributions,
    drawStatus,
    startPolling,
    stopPolling,
    equbAmount
  } = useAppStore();

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
    startPolling();
    return () => {
      stopPolling();
    };
  }, [fetchAllData, startPolling, stopPolling]);

  const isAdmin = user?.role === 'admin';

  // Calculate payment status
  const allPaid = contributions.length > 0 && contributions.every(c => c.status === 'paid');
  const paidCount = contributions.filter(c => c.status === 'paid').length;
  const unpaidCount = contributions.length - paidCount;

  // Check if there's a new winner (last winner in list)
  const latestWinner = winners.length > 0 ? winners[0] : null;

  if (localLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Draw Page...</p>
        </div>
      </div>
    );
  }

  // If admin, go to admin page
  if (isAdmin) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm">
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Draw & Winners</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Check the draw status and past winners!
            </p>
          </div>
        </motion.div>

        {/* Latest Winner Announcement */}
        {latestWinner && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="p-8 bg-gradient-to-r from-gold-50 to-primary-50 dark:from-gold-900/30 dark:to-primary-900/30 border-2 border-gold-500/30">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gold-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎉 Latest Winner! 🎉</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{latestWinner.memberName}</p>
                <p className="text-xl opacity-95 font-medium">Won Round {latestWinner.round} with ETB {latestWinner.amount.toLocaleString()}! 💰</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Won on {latestWinner.date}</p>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidCount}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Paid</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unpaidCount}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Unpaid</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className={cn(
                  "w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center",
                  allPaid ? "bg-green-500" : "bg-gray-300"
                )}>
                  {allPaid && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allPaid ? "Yes" : "No"}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">All Paid</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-8">
                {(drawStatus?.drawStarted || false) ? (
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">🎉 The Draw is Live! 🎉</h3>
                <RouletteWheel 
                  members={members} 
                  contributions={contributions}
                  nextWinner={drawStatus?.nextWinner}
                  isSpinning={drawStatus?.wheelSpinning}
                  equbAmount={equbAmount}
                />
              </div>
            ) : (
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary-500 via-gold-500 to-primary-700 text-white p-8 rounded-2xl mb-6">
                      <Calendar className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">
                        {allPaid ? "Draw Started Soon! 🎉" : "Next Draw Coming Soon! 🎉"}
                      </h2>
                      
                      <div className="mt-8 p-4 bg-white/10 rounded-xl">
                        <p className="text-lg">Prize: <span className="font-bold text-2xl">ETB {(members.length * equbAmount).toLocaleString()}</span></p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {allPaid ? (
                        <div className="text-center">
                          <p className="text-green-600 dark:text-green-400 text-lg font-semibold mb-4">
                            ✅ All members have paid! The draw will start soon! Stay tuned!
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-yellow-600 dark:text-yellow-400 text-lg font-semibold mb-4">
                            Waiting for {unpaidCount} member(s) to pay... The admin will start the draw once everyone has paid!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">ETB {(members.length * equbAmount).toLocaleString()}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">This Round's Prize</p>
                  </div>
                  <div className="text-center p-4 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-gold-600 dark:text-gold-400 mb-1">{members.length}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Participants</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{drawStatus?.round || 1}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Current Round</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Past Winners</h2>
              <div className="space-y-4">
                {winners.length > 0 ? (
                  winners.map((winner, index) => (
                    <motion.div 
                      key={winner.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl",
                        index === 0 ? "bg-gradient-to-br from-gold-400 to-gold-600" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                        index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800" :
                        "bg-gradient-to-br from-primary-500 to-primary-700"
                      )}>
                        {winner.memberName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{winner.memberName}</p>
                          <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">Round {winner.round}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{winner.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">ETB {winner.amount.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No winners yet! Be the first!</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DrawPage;
