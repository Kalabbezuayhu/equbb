import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore, useToast } from '../store';
import { CheckCircle2, Clock, Trophy, Users, DollarSign, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import RouletteWheel from '../components/RouletteWheel';

const AdminPage: React.FC = () => {
  const [localLoading, setLocalLoading] = useState(true);
  const [newEqubAmount, setNewEqubAmount] = useState('');
  
  const { 
    members, 
    winners, 
    contributions,
    fetchAllData, 
    markContributionPaid,
    setWinnerAndAdvance,
    user,
    drawStatus,
    startDraw,
    startPolling,
    stopPolling,
    equbAmount,
    setEqubAmount,
    startWheel,
    stopWheel
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

  const handleMarkPaid = async (id: number) => {
    try {
      await markContributionPaid(id);
      addToast('Contribution marked as paid! ✅', 'success');
    } catch (error) {
      addToast('Failed to mark contribution as paid!', 'error');
    }
  };

  const handleStartDraw = async () => {
    try {
      await startDraw();
      addToast('Draw started! 🎉', 'success');
    } catch (error) {
      addToast('Failed to start draw!', 'error');
    }
  };

  const handleSetEqubAmount = async () => {
    const amount = parseInt(newEqubAmount);
    if (!amount || amount < 100) {
      addToast('Please enter a valid amount (minimum 100)', 'error');
      return;
    }
    try {
      await setEqubAmount(amount);
      addToast('Equb amount updated! ✅', 'success');
      setNewEqubAmount('');
    } catch (error) {
      addToast('Failed to update equb amount!', 'error');
    }
  };

  const handleSpinStart = async () => {
    try {
      await startWheel();
    } catch (error) {
      addToast('Failed to start wheel!', 'error');
    }
  };

  const handleWinner = async () => {
    try {
      await setWinnerAndAdvance();
      await stopWheel();
      addToast('🎉 Winner selected successfully!', 'success');
    } catch (error) {
      addToast('Failed to add winner!', 'error');
    }
  };

  if (localLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Equb Admin Dashboard - Round {drawStatus?.round || 1}
          </p>
        </div>

        {/* Equb Amount Setting */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Settings className="w-6 h-6" /> Equb Amount Setting
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Current Equb Amount: <span className="font-bold text-xl text-gray-900 dark:text-white">ETB {equbAmount.toLocaleString()}</span></p>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="New amount (minimum 100)"
                  value={newEqubAmount}
                  onChange={(e) => setNewEqubAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSetEqubAmount}>
                  Update Amount
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Paid Contributions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidCount}/{contributions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Collection</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">ETB {(paidCount * equbAmount).toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{drawStatus?.round || 1}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Contributions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-7 h-7" /> Contributions
              </h2>
              
              {/* Payment Status Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
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

              {/* Contributions List */}
              <div className="space-y-3">
                {contributions.map((contribution) => (
                  <div 
                    key={contribution.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {contribution.memberName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{contribution.memberName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Round {contribution.round}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-gray-900 dark:text-white">ETB {contribution.amount.toLocaleString()}</p>
                      {contribution.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {contribution.userPaymentRequested && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                              ⏳ Payment Requested
                            </span>
                          )}
                          <Button size="sm" onClick={() => handleMarkPaid(contribution.id)}>
                            Mark Paid
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Draw */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7" /> Monthly Draw
              </h2>
              
              {!allPaid ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Mark all contributions as paid first!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {unpaidCount} member(s) still need to pay
                  </p>
                </div>
              ) : !drawStatus?.drawStarted ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-primary-500 via-gold-500 to-primary-700 text-white p-8 rounded-2xl mb-6">
                    <Trophy className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Ready to Start the Draw!</h2>
                    <p className="text-lg opacity-95">All members have paid!</p>
                    {drawStatus?.nextWinner && (
                      <p className="mt-4 text-lg opacity-90">
                        Next in line: <span className="font-bold">{drawStatus.nextWinner.name}</span>
                      </p>
                    )}
                  </div>
                  <Button onClick={handleStartDraw} size="lg" className="gap-2">
                    Start the Draw! 🎉
                  </Button>
                </div>
              ) : (
                <RouletteWheel 
                  members={members}
                  contributions={contributions}
                  nextWinner={drawStatus?.nextWinner}
                  onWinner={handleWinner}
                  isSpinning={drawStatus?.wheelSpinning}
                  onStartSpin={handleSpinStart}
                  equbAmount={equbAmount}
                />
              )}
            </Card>

            {/* Past Winners */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Past Winners</h3>
              <div className="space-y-3">
                {winners.length > 0 ? (
                  winners.map((winner, index) => (
                    <div 
                      key={winner.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                        index === 0 ? "bg-gradient-to-br from-gold-400 to-gold-600" :
                        "bg-gradient-to-br from-primary-500 to-primary-700"
                      )}>
                        {winner.memberName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{winner.memberName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Round {winner.round} • {winner.date}</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">ETB {winner.amount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Trophy className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No winners yet!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
