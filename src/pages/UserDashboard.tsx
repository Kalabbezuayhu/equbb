import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore, useToast } from '../store';
import { Calendar, Trophy, CheckCircle2, Clock, Users, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import RouletteWheel from '../components/RouletteWheel';

const UserDashboard: React.FC = () => {
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
    equbAmount,
    requestContributionPayment
  } = useAppStore();
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
    startPolling();
    return () => {
      stopPolling();
    };
  }, [fetchAllData, startPolling, stopPolling]);

  // Calculate payment status
  const allPaid = contributions.length > 0 && contributions.every(c => c.status === 'paid');
  const paidCount = contributions.filter(c => c.status === 'paid').length;
  const unpaidCount = contributions.length - paidCount;

  // Check if current user has won
  const hasWonBefore = winners.some(w => w.memberName === user?.name);
  const lastWin = winners.find(w => w.memberName === user?.name);

  // Check if there's a new winner (last winner in list)
  const latestWinner = winners.length > 0 ? winners[0] : null;

  // Handle payment request
  const handleRequestPayment = async (id: number) => {
    try {
      await requestContributionPayment(id);
      addToast('Payment request sent! ✅', 'success');
    } catch (error) {
      console.error("Error requesting payment:", error);
      addToast('Failed to send payment request!', 'error');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hey {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Welcome to your Equb Dashboard!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">This Round's Prize</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">ETB {(members.length * equbAmount).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Current Round</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{winners.length + 1}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Equb Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">ETB {equbAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Latest Winner Announcement */}
        {latestWinner && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
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

        {/* Roulette Wheel when draw is active */}
        {drawStatus?.drawStarted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🎉 The Draw is Live! 🎉</h2>
                <RouletteWheel 
                  members={members} 
                  contributions={contributions}
                  nextWinner={drawStatus?.nextWinner}
                  isSpinning={drawStatus?.wheelSpinning}
                  equbAmount={equbAmount}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* If user has won before */}
        {hasWonBefore && lastWin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-8 bg-gradient-to-br from-gold-50 to-primary-50 dark:from-gold-900/30 dark:to-primary-900/30 border-2 border-gold-500/30">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gold-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎉 You're a Winner! 🎉</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You won round {lastWin.round} and took home ETB {lastWin.amount.toLocaleString()}!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Won on {lastWin.date}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Payment Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Status</h2>
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
            
            {/* User's Contribution */}
            {user && (() => {
              const userContribution = contributions.find(c => c.memberName === user.name);
              
              if (!userContribution) {
                return (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Contribution</h3>
                    <p className="text-gray-600 dark:text-gray-300">No contribution yet - check back soon!</p>
                  </div>
                );
              }

              return (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Contribution</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">
                      Amount: <span className="font-bold">ETB {userContribution.amount.toLocaleString()}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Due Date: <span className="font-bold">{userContribution.dueDate || 'TBD'}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Status: {userContribution.status === 'paid' ? (
                        <span className="text-green-600 dark:text-green-400 font-bold">✅ Paid</span>
                      ) : userContribution.userPaymentRequested ? (
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">⏳ Payment Requested</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-bold">❌ Pending</span>
                      )}
                    </p>
                    {userContribution.status !== 'paid' && !userContribution.userPaymentRequested && (
                      <Button 
                        onClick={() => handleRequestPayment(userContribution.id)}
                        className="mt-2 w-full"
                      >
                        I Paid!
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </Card>
        </motion.div>

        {/* Next Draw Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-500 via-gold-500 to-primary-700 text-white p-8 rounded-2xl mb-6">
                        <Calendar className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">
                          {drawStatus?.drawStarted ? "Draw Started! 🎉" : "Next Draw Coming Soon! 🎉"}
                        </h2>
                        
                        <div className="mt-8 p-4 bg-white/10 rounded-xl">
                          <p className="text-lg">Prize: <span className="font-bold text-2xl">ETB {(members.length * equbAmount).toLocaleString()}</span></p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {drawStatus?.drawStarted ? (
                          <div className="text-center">
                            <p className="text-green-600 dark:text-green-400 text-lg font-semibold mb-4">
                              🎉 Draw has started! The wheel is above!
                            </p>
                          </div>
                        ) : allPaid ? (
                          <div className="text-center">
                            <p className="text-green-600 dark:text-green-400 text-lg font-semibold mb-4">
                              ✅ All members have paid! The draw will start soon!
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-yellow-600 dark:text-yellow-400 text-lg font-semibold mb-4">
                              Waiting for {unpaidCount} member(s) to pay...
                            </p>
                          </div>
                        )}
                        
                        <Button onClick={() => navigate('/draw')} size="lg" className="gap-2">
                          {drawStatus?.drawStarted ? "See Draw Page →" : "Check Draw Page →"}
                        </Button>
                      </div>
            </div>
          </Card>
        </motion.div>

        {/* Past Winners */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past Winners</h2>
            <div className="space-y-4">
              {winners.length > 0 ? (
                winners.map((winner, index) => (
                  <motion.div 
                    key={winner.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
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
  );
};

export default UserDashboard;
