import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Award, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CONFETTI_COLORS = ['#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899', '#60a5fa'];
const LEVEL_REWARDS = {
  2: 'Math Bot avatar',
  3: 'Number Wizard avatar and Galaxy Background',
  4: 'Space Explorer avatar',
  5: 'Puzzle Dragon avatar',
};

function playLevelSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.12);
  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
  oscillator.onended = () => audioContext.close();
}

const GamificationFeedback = () => {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const previous = useRef(null);
  const [levelUp, setLevelUp] = useState(null);
  const [xpGain, setXpGain] = useState(0);
  const [badge, setBadge] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('mq_reward_sounds') === 'true'
  );

  useEffect(() => {
    if (!user) {
      previous.current = null;
      return;
    }

    const current = { xp: user.totalXP || 0, level: user.level || 1 };
    if (previous.current) {
      const difference = current.xp - previous.current.xp;
      if (difference > 0) {
        setXpGain(difference);
        window.setTimeout(() => setXpGain(0), 2600);
      }
      if (current.level > previous.current.level) {
        setLevelUp({ level: current.level, reward: LEVEL_REWARDS[current.level] || null });
        if (soundEnabled) playLevelSound();
      }
    }
    previous.current = current;
  }, [user, soundEnabled]);

  useEffect(() => {
    if (!levelUp) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setLevelUp(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [levelUp]);

  useEffect(() => {
    const onBadge = (event) => {
      setBadge(event.detail);
      window.setTimeout(() => setBadge(null), 3200);
    };
    window.addEventListener('mq:badge-unlocked', onBadge);
    return () => window.removeEventListener('mq:badge-unlocked', onBadge);
  }, []);

  const toggleSound = () => {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);
    localStorage.setItem('mq_reward_sounds', String(enabled));
  };

  return (
    <>
      <AnimatePresence>
        {xpGain > 0 && (
          <motion.div
            key="xp-gain"
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-black text-amber-950 shadow-xl"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />+{xpGain} XP
          </motion.div>
        )}
        {badge && (
          <motion.div
            key={`badge-${badge.badgeCode}`}
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-5 right-4 z-[70] flex max-w-sm items-center gap-3 rounded-2xl bg-purple-700 px-4 py-3 text-white shadow-xl"
          >
            <Award className="h-6 w-6 shrink-0 text-amber-300" aria-hidden="true" />
            <span><strong>Badge unlocked!</strong> {badge.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelUp && (
          <motion.div
            key="level-up-backdrop"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLevelUp(null)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="level-up-title"
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-purple-700 via-indigo-600 to-teal-500 p-8 text-center text-white shadow-2xl"
              initial={reduceMotion ? false : { scale: 0.8, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              {!reduceMotion && Array.from({ length: 18 }, (_, index) => (
                <motion.span
                  key={index}
                  aria-hidden="true"
                  className="absolute h-2.5 w-2.5 rounded-sm"
                  style={{
                    left: `${(index * 37) % 100}%`,
                    top: `${(index * 19) % 70}%`,
                    backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                  }}
                  animate={{ y: [0, 40 + (index % 4) * 12], rotate: [0, 180 + index * 12], opacity: [1, 0] }}
                  transition={{ duration: 1.1 + (index % 3) * 0.25, repeat: Infinity, repeatDelay: 0.4 }}
                />
              ))}
              <button
                type="button"
                onClick={() => setLevelUp(null)}
                aria-label="Close level-up celebration"
                className="absolute right-4 top-4 rounded-xl p-2 text-white/80 hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <Sparkles className="mx-auto h-10 w-10 text-amber-300" aria-hidden="true" />
              <h2 id="level-up-title" className="mt-3 text-3xl font-black">Level Up!</h2>
              <motion.p
                className="my-4 text-7xl font-black text-amber-300"
                initial={reduceMotion ? false : { scale: 0.5 }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: reduceMotion ? 0 : 0.6 }}
              >
                {levelUp.level}
              </motion.p>
              <p className="font-bold text-purple-100">You’re becoming a stronger math explorer!</p>
              {levelUp.reward && (
                <p className="mt-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-black text-amber-200">
                  Reward unlocked: {levelUp.reward}
                </p>
              )}
              <button
                type="button"
                aria-pressed={soundEnabled}
                onClick={toggleSound}
                className="mt-5 rounded-xl border border-white/40 px-3 py-2 text-sm font-bold hover:bg-white/10"
              >
                Celebration sound: {soundEnabled ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => setLevelUp(null)}
                className="mt-5 block w-full rounded-2xl bg-amber-400 px-5 py-3 font-black text-amber-950 hover:bg-amber-300"
              >
                Keep learning!
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GamificationFeedback;
