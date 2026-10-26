import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const UNAVAILABLE_MESSAGE = 'Video lesson for this topic is temporarily unavailable. Please try again.';

export const VideoLessonModal = ({
  isOpen,
  onClose,
  onRetry,
  topic,
  lesson,
  isLoading,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const advanceTimeoutRef = useRef(null);
  const [playbackCycle, setPlaybackCycle] = useState(0);

  const slides = Array.isArray(lesson?.videoSlides) && lesson.videoSlides.length === 5
    ? lesson.videoSlides
    : [];
  const topicKey = topic?._id || topic?.slug || '';
  const lessonKey = `${topicKey}:${lesson?._id || ''}:${lesson?.updatedAt || ''}`;

  const stopNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    stopNarration();
    setCurrentSlide(0);
    setIsPlaying(false);
    setPlaybackCycle(0);
  }, [lessonKey]);

  useEffect(() => {
    if (!isOpen || !isPlaying || !slides[currentSlide]) {
      stopNarration();
      return stopNarration;
    }

    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      setIsPlaying(false);
      return undefined;
    }

    stopNarration();
    if (isMuted) return stopNarration;

    const utterance = new SpeechSynthesisUtterance(slides[currentSlide].narration);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => {
      if (currentSlide < slides.length - 1) {
        advanceTimeoutRef.current = window.setTimeout(() => {
          setCurrentSlide((index) => Math.min(slides.length - 1, index + 1));
        }, 900);
      } else {
        setIsPlaying(false);
      }
    };
    window.speechSynthesis.speak(utterance);

    return stopNarration;
  }, [currentSlide, isMuted, isOpen, isPlaying, lessonKey, playbackCycle]);

  useEffect(() => () => stopNarration(), []);

  if (!isOpen) return null;

  const current = slides[currentSlide];
  const handleRestart = () => {
    stopNarration();
    setCurrentSlide(0);
    setIsPlaying(true);
    setPlaybackCycle((cycle) => cycle + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-3xl w-full border-2 border-purple-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-teal-600 text-white flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold truncate">
              {topic?.title || 'Mathematics'} Video Lesson
            </h3>
            <p className="text-[11px] text-purple-200">
              Grade {topic?.grade} • Narrated slide lesson
              {slides.length > 0 && ` • Slide ${currentSlide + 1} of ${slides.length}`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close video lesson"
            onClick={() => {
              stopNarration();
              setIsPlaying(false);
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 min-h-64 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Loading this topic's video lesson...</p>
          </div>
        ) : !current ? (
          <div className="p-8 min-h-64 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500" />
            <p className="max-w-md text-sm font-semibold text-slate-700">{UNAVAILABLE_MESSAGE}</p>
            <Button variant="playful" size="sm" onClick={onRetry} isLoading={isLoading}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-5 min-h-[300px]">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <Badge variant="teal">{current.subtitle}</Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{current.title}</h2>
                </div>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                  {currentSlide + 1}/{slides.length}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-3">
                {current.content.map((line, index) => (
                  <p key={`${currentSlide}-${index}`} className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {line}
                  </p>
                ))}
              </div>

              <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0 text-xs font-bold">
                  VO
                </div>
                <p className="text-xs sm:text-sm text-purple-950 font-medium leading-relaxed italic">
                  {current.narration}
                </p>
              </div>
              {!speechSupported && (
                <p role="status" className="text-xs text-amber-700">
                  Narration is not supported by this browser. You can still read and navigate the slides.
                </p>
              )}
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="grid grid-cols-5 gap-2" aria-label="Slide progress">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide ? 'step' : undefined}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-purple-600'
                        : index < currentSlide
                          ? 'bg-teal-500'
                          : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isPlaying ? 'secondary' : 'playful'}
                    size="sm"
                    onClick={() => setIsPlaying((playing) => !playing)}
                    className="gap-1.5"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play Narration'}</span>
                  </Button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    aria-label="Restart from beginning"
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted((muted) => !muted)}
                    aria-label={isMuted ? 'Unmute narration' : 'Mute narration'}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide((index) => Math.max(0, index - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentSlide === slides.length - 1}
                    onClick={() => setCurrentSlide((index) => Math.min(slides.length - 1, index + 1))}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoLessonModal;
