import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  PieChart,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const VideoLessonModal = ({ isOpen, onClose, topic }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const speechRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: 'Welcome to Fraction Adventure!',
      subtitle: 'Georgia Mathematics Standard 5.NR.3',
      narration:
        'Hello Young Mathematician! Welcome to your interactive video-style math adventure. Today, we are exploring fractions and discovering why denominators matter so much when combining parts.',
      visual: (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-purple-600 text-white flex items-center justify-center text-4xl font-black shadow-lg animate-bounce">
            1/2
          </div>
          <h4 className="text-xl font-black text-slate-800">The Power of Equal Parts</h4>
          <p className="text-sm text-slate-600 max-w-md">
            Fractions represent numbers that exist between whole integers. They tell us how many pieces we have out of a whole!
          </p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Numerator vs. Denominator',
      subtitle: 'Understanding the Anatomy of a Fraction',
      narration:
        'Every fraction has two main parts. The numerator on top tells us how many pieces we are counting. The denominator on the bottom tells us how many total equal pieces make up the whole unit.',
      visual: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 items-center">
          <div className="bg-purple-50 p-5 rounded-2xl border-2 border-purple-200 text-center space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase">Top Number</span>
            <h3 className="text-3xl font-black text-purple-900">Numerator (3)</h3>
            <p className="text-xs text-purple-700">"How many pieces we currently have"</p>
          </div>
          <div className="bg-teal-50 p-5 rounded-2xl border-2 border-teal-200 text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase">Bottom Number</span>
            <h3 className="text-3xl font-black text-teal-900">Denominator (4)</h3>
            <p className="text-xs text-teal-700">"How many equal parts make one whole"</p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Visualizing Fractions',
      subtitle: 'Comparing 1/2, 2/4, and 4/8',
      narration:
        'Look at these three fraction strips. One half, two fourths, and four eighths cover the exact same amount of space! They are called equivalent fractions because their values are identical.',
      visual: (
        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>1/2 One Half</span>
              <span>50%</span>
            </div>
            <div className="w-full bg-slate-100 h-8 rounded-xl overflow-hidden flex border border-slate-200">
              <div className="w-1/2 bg-purple-500 flex items-center justify-center text-white text-xs font-bold">1/2</div>
              <div className="w-1/2 bg-slate-100"></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>2/4 Two Fourths</span>
              <span>50%</span>
            </div>
            <div className="w-full bg-slate-100 h-8 rounded-xl overflow-hidden flex border border-slate-200">
              <div className="w-1/4 bg-teal-500 border-r border-white flex items-center justify-center text-white text-xs font-bold">1/4</div>
              <div className="w-1/4 bg-teal-500 flex items-center justify-center text-white text-xs font-bold">1/4</div>
              <div className="w-1/2 bg-slate-100"></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>4/8 Four Eighths</span>
              <span>50%</span>
            </div>
            <div className="w-full bg-slate-100 h-8 rounded-xl overflow-hidden flex border border-slate-200">
              <div className="w-1/8 bg-amber-400 border-r border-white flex items-center justify-center text-amber-950 text-[10px] font-bold">1/8</div>
              <div className="w-1/8 bg-amber-400 border-r border-white flex items-center justify-center text-amber-950 text-[10px] font-bold">1/8</div>
              <div className="w-1/8 bg-amber-400 border-r border-white flex items-center justify-center text-amber-950 text-[10px] font-bold">1/8</div>
              <div className="w-1/8 bg-amber-400 flex items-center justify-center text-amber-950 text-[10px] font-bold">1/8</div>
              <div className="w-1/2 bg-slate-100"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Worked Example: Unlike Denominators',
      subtitle: 'What is 1/3 + 2/5?',
      narration:
        'Here is a real problem: one third plus two fifths. We cannot add them yet because 3 and 5 are different sized slices. We find the least common denominator, which is 15. One third becomes 5 over 15. Two fifths becomes 6 over 15. Adding the tops gives us 11 over 15.',
      visual: (
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono text-sm">
          <div className="text-amber-300 font-bold text-xs uppercase tracking-wider">Step-by-Step Breakdown:</div>
          <div className="flex items-center gap-2 text-base font-bold">
            <span className="text-purple-300">1/3</span> + <span className="text-teal-300">2/5</span> = ?
          </div>
          <div className="text-xs text-slate-300">1. Least Common Multiple of 3 & 5 = 15</div>
          <div className="text-xs text-slate-300">2. Convert: 1/3 = (1×5)/(3×5) = 5/15</div>
          <div className="text-xs text-slate-300">3. Convert: 2/5 = (2×3)/(5×3) = 6/15</div>
          <div className="text-emerald-400 font-bold pt-1 border-t border-slate-700 text-sm">
            4. Add numerators: 5/15 + 6/15 = 11/15 ✓
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Mission Complete! What We Learned',
      subtitle: 'Key Takeaways for Georgia Standard Mastery',
      narration:
        'Fantastic job! Remember: always find a common denominator before adding or subtracting fractions, and only add the numerators. Now you are ready to test your knowledge in the practice quiz!',
      visual: (
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 fill-amber-500" />
          </div>
          <h4 className="text-xl font-black text-slate-800">You are Ready for Quests!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have completed this video-style interactive lesson. Proceed directly to the adaptive quiz to earn XP and level up.
          </p>
        </div>
      ),
    },
  ];

  // Stop any active speech on unmount or slide change
  const stopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speakCurrentSlide = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }

    stopNarration();

    if (isMuted) return;

    const text = slides[currentSlide].narration;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower, clear child-friendly pace
    utterance.pitch = 1.05;

    utterance.onend = () => {
      // Auto-advance to next slide if playing and not on last slide
      if (isPlaying && currentSlide < slides.length - 1) {
        setTimeout(() => {
          setCurrentSlide((prev) => prev + 1);
        }, 1200);
      } else if (currentSlide === slides.length - 1) {
        setIsPlaying(false);
      }
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isOpen && isPlaying) {
      speakCurrentSlide();
    } else {
      stopNarration();
    }
    return () => stopNarration();
  }, [currentSlide, isPlaying, isOpen, isMuted]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentSlide(0);
      stopNarration();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopNarration();
    } else {
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    stopNarration();
    setCurrentSlide(0);
    setIsPlaying(true);
  };

  const current = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border-2 border-purple-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
              🎬
            </span>
            <div>
              <h3 className="text-base font-bold truncate">
                Interactive Video-Style Lesson: Fractions
              </h3>
              <p className="text-[11px] text-purple-200">
                Narrated multimedia explanation • Slide {currentSlide + 1} of {slides.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopNarration();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Presentation Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="teal">{current.subtitle}</Badge>
              <span className="text-xs font-bold text-slate-400">
                Part {currentSlide + 1}/{slides.length}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{current.title}</h2>
          </div>

          {/* Interactive Visual Graphic */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-inner">
            {current.visual}
          </div>

          {/* Narration Subtitle Box */}
          <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
              🗣️
            </div>
            <p className="text-xs sm:text-sm text-purple-950 font-medium leading-relaxed italic">
              "{current.narration}"
            </p>
          </div>
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Progress Indicators */}
          <div className="grid grid-cols-5 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  stopNarration();
                  setCurrentSlide(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'bg-purple-600'
                    : idx < currentSlide
                    ? 'bg-teal-500'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? 'secondary' : 'playful'}
                size="sm"
                onClick={handlePlayPause}
                className="gap-1.5"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Narration'}</span>
              </Button>

              <button
                onClick={handleRestart}
                title="Restart from beginning"
                className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentSlide === 0}
                onClick={() => {
                  stopNarration();
                  setCurrentSlide((prev) => Math.max(0, prev - 1));
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={currentSlide === slides.length - 1}
                onClick={() => {
                  stopNarration();
                  setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLessonModal;

