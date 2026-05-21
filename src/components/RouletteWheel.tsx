import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, PartyPopper, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface RouletteWheelProps {
  members: any[];
  contributions?: any[];
  nextWinner?: any;
  onWinner?: () => void;
  isSpinning?: boolean;
  onStartSpin?: () => void;
  equbAmount?: number;
}

const defaultColors = [
  '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6',
  '#14b8a6', '#f97316', '#06b6d4', '#ec4899'
];

const RouletteWheel: React.FC<RouletteWheelProps> = ({ 
  members, 
  contributions = [], 
  nextWinner, 
  onWinner, 
  isSpinning, 
  onStartSpin,
  equbAmount = 1000
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [winner, setWinner] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [localSpinning, setLocalSpinning] = useState(false);
  const [autoSpinning, setAutoSpinning] = useState(false);

  // Filter members who have paid contributions
  const paidMemberIds = contributions
    .filter(c => c.status === 'paid')
    .map(c => c.memberId);
  
  const activeMembers = members.filter(m => paidMemberIds.includes(m.id));
  const displayMembers = activeMembers.length > 0 ? activeMembers : members;

  const startSpin = () => {
    if (!onWinner || !onStartSpin || !nextWinner) return;
    if (localSpinning || autoSpinning) return;
    
    setWinner(null);
    setShowConfetti(false);
    
    const winnerIndex = displayMembers.findIndex(m => m.id === nextWinner.id);
    if (winnerIndex === -1) return;
    
    const fullSpins = 15; 
    const anglePerMember = 360 / displayMembers.length;
    const targetAngle = winnerIndex * anglePerMember + anglePerMember / 2;
    const totalRotation = fullSpins * 360 + (360 - targetAngle) + 90;
    
    onStartSpin();
    setLocalSpinning(true);
    setRotation(totalRotation);
    
    setTimeout(() => {
      setWinner(nextWinner);
      setShowConfetti(true);
      if (onWinner) onWinner();
      setLocalSpinning(false);
    }, 8000);
  };

  // Auto-spin for users when draw starts
  useEffect(() => {
    if (isSpinning && !autoSpinning && !localSpinning && nextWinner) {
      setWinner(null);
      setShowConfetti(false);
      
      const winnerIndex = displayMembers.findIndex(m => m.id === nextWinner.id);
      if (winnerIndex === -1) return;
      
      const fullSpins = 15; 
      const anglePerMember = 360 / displayMembers.length;
      const targetAngle = winnerIndex * anglePerMember + anglePerMember / 2;
      const totalRotation = fullSpins * 360 + (360 - targetAngle) + 90;
      
      setAutoSpinning(true);
      setRotation(totalRotation);
      
      setTimeout(() => {
        setWinner(nextWinner);
        setShowConfetti(true);
        setAutoSpinning(false);
      }, 8000);
    }
  }, [isSpinning, nextWinner, displayMembers]);

  // Confetti effect
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const actuallySpinning = isSpinning || localSpinning || autoSpinning;

  return (
    <div className="flex flex-col items-center gap-8 relative">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 - 50 + '%',
                y: '-20px',
                scale: 0,
                rotate: Math.random() * 360,
                opacity: 1
              }}
              animate={{
                y: '100vh',
                scale: [0, 1, 0],
                rotate: Math.random() * 720,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5
              }}
              className="absolute left-1/2"
              style={{
                backgroundColor: defaultColors[Math.floor(Math.random() * defaultColors.length)],
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {/* Pointer with glow */}
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: actuallySpinning ? [0, -12, 0] : 0 }}
          transition={{ duration: 0.2, repeat: actuallySpinning ? Infinity : 0 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400 blur-xl opacity-50"></div>
            <div className="relative w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-gold-500 drop-shadow-2xl"></div>
          </div>
        </motion.div>

        {/* Wheel with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-gold-400 to-primary-600 rounded-full blur-2xl opacity-40 animate-pulse"></div>
          
          <motion.div
            ref={wheelRef}
            className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] rounded-full shadow-2xl overflow-hidden border-8 border-gray-200 dark:border-slate-700 z-10"
            animate={{ rotate: rotation }}
            transition={{ duration: 8, ease: [0.2, 0.8, 0.3, 1] }}
          >
            {displayMembers.map((member, index) => {
              const angle = 360 / displayMembers.length;
              const rotation = index * angle;
              const color = member.color || defaultColors[index % defaultColors.length];
              
              return (
                <div
                  key={member.id}
                  className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% 100%)`,
                      backgroundColor: color,
                    }}
                  />
                  <div
                    className="absolute top-10 right-10 transform rotate-[90deg] translate-x-1/2 origin-center"
                    style={{
                      transform: `rotate(${angle / 2}deg) translateY(-25px)`,
                    }}
                  >
                    <span className="text-white font-bold text-sm sm:text-base whitespace-nowrap drop-shadow-md tracking-wide">
                      {member.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Center circle with gold border */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-white to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-full shadow-xl border-4 border-gold-500 flex items-center justify-center z-10">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gold-500 drop-shadow-md" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Winner display with sparkles */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-gold-500 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md relative overflow-hidden"
        >
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  x: [0, Math.sin(i * 45) * 30],
                  y: [0, Math.cos(i * 45) * 30],
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <Sparkles className="w-6 h-6 text-white/60" />
              </motion.div>
            ))}
          </div>
          
          <div className="relative z-10">
            <PartyPopper className="w-14 h-14 mx-auto mb-4 animate-bounce" />
            <h2 className="text-4xl font-bold mb-3">🎉 Winner! 🎉</h2>
            <p className="text-3xl font-semibold mb-3 drop-shadow-lg">{winner.name}</p>
            <p className="text-2xl opacity-95 font-medium">Wins ETB {(displayMembers.length * equbAmount).toLocaleString()}! 💰💰💰</p>
          </div>
        </motion.div>
      )}

      {/* Spin button with gradient and hover effect - only if onWinner and onStartSpin are provided */}
      {onWinner && onStartSpin && (
        <button
          onClick={startSpin}
          disabled={actuallySpinning}
          className={cn(
            "px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all transform",
            actuallySpinning 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-primary-600 via-gold-600 to-primary-600 hover:from-primary-700 hover:via-gold-700 hover:to-primary-700 text-white hover:shadow-3xl hover:scale-105 active:scale-95"
          )}
        >
          {actuallySpinning ? (
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              Spinning the Wheel of Fortune...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              🎰 Spin the Wheel! 🎰
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default RouletteWheel;
