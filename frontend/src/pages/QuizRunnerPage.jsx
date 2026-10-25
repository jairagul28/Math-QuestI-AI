import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizzesAPI, topicsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import {
  ArrowLeft,
  Target,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { getDifficultyColor } from '../utils/formatters';
import { notifyBadgeUnlocks } from '../utils/gamification';

export const QuizRunnerPage = () => {
  const { id } = useParams(); // topicId
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [topic, setTopic] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Final summary state
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizSummary, setQuizSummary] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  // Initialize Quiz Session
  const initQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      setQuizComplete(false);
      setQuizSummary(null);
      setFeedback(null);
      setSelectedOption(null);

      // Fetch Topic
      const topicRes = await topicsAPI.getTopicById(id);
      setTopic(topicRes.data.data);

      // Start Session on Backend
      const startRes = await quizzesAPI.startQuiz({
        topicId: topicRes.data.data._id,
        questionCount: 5,
      });

      setAttemptId(startRes.data.attemptId);
      setCurrentQuestion(startRes.data.currentQuestion);
      setCurrentDifficulty(startRes.data.currentDifficulty || 'medium');
    } catch (err) {
      console.error('[Quiz Init Error]:', err);
      setError(err.response?.data?.message || 'Could not start quiz session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initQuiz();
  }, [id]);

  const [nextQuestionData, setNextQuestionData] = useState(null);

  // Submit student's chosen answer
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || submitting || feedback) return;

    try {
      setSubmitting(true);
      const res = await quizzesAPI.submitAnswer(attemptId, {
        questionIndex: currentQuestion.questionIndex,
        selectedOptionIndex: selectedOption,
      });

      const { isQuizComplete, feedback: fb, nextQuestion, summary, newlyUnlockedBadges } = res.data;

      setFeedback(fb);
      if (newlyUnlockedBadges && newlyUnlockedBadges.length > 0) {
        setUnlockedBadges((prev) => [...prev, ...newlyUnlockedBadges]);
        notifyBadgeUnlocks(newlyUnlockedBadges);
      }

      if (isQuizComplete) {
        setQuizComplete(true);
        setQuizSummary(summary);
        if (refreshUser) refreshUser();
      } else {
        setNextQuestionData(nextQuestion);
        setCurrentDifficulty(res.data.currentDifficulty);
      }
    } catch (err) {
      console.error('[Submit Answer Error]:', err);
      setError(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = () => {
    if (nextQuestionData) {
      setCurrentQuestion(nextQuestionData);
      setNextQuestionData(null);
      setSelectedOption(null);
      setFeedback(null);
    }
  };

  // Move to next question after reviewing feedback
  const handleNextQuestion = async () => {
    try {
      setLoading(true);
      setSelectedOption(null);
      setFeedback(null);

      // Fetch current state from result or advance
      const res = await quizzesAPI.getQuizResult(attemptId);
      const attempt = res.data.data;

      // Find the next unanswered question from backend attempt
      const nextIdx = attempt.answers.length;
      if (nextIdx < attempt.totalQuestions) {
        const nextQ = attempt.questions
          ? attempt.questions[nextIdx]
          : {
              questionIndex: nextIdx,
              totalQuestions: attempt.totalQuestions,
              questionText: 'Next practice problem loading...',
              options: ['A', 'B', 'C', 'D'],
            };

        // Note: the submitAnswer response already provided nextQuestion, let's use it if available
        // Or re-query attempt
        window.location.reload(); // Simple reload or state update
      }
    } catch (err) {
      console.error('[Next Question Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle advancing using state returned from submitAnswer
  const advanceToNext = (nextQ, nextDiff) => {
    setSelectedOption(null);
    setFeedback(null);
    setCurrentQuestion(nextQ);
    setCurrentDifficulty(nextDiff);
  };

  if (loading) {
    return (
      <div className="py-12 max-w-3xl mx-auto px-4 space-y-6 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Quiz Unavailable</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <div className="flex justify-center gap-3">
          <Link to={`/topics/${id}`}>
            <Button variant="secondary" size="md">
              Back to Lesson
            </Button>
          </Link>
          <Button variant="playful" size="md" onClick={initQuiz}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ================= 1. FINAL RESULTS VIEW =================
  if (quizComplete && quizSummary) {
    const isPassing = quizSummary.accuracy >= 70;

    return (
      <div className="py-10 max-w-2xl mx-auto px-4 space-y-8 animate-in fade-in">
        <Card className="border-2 border-purple-200 shadow-2xl overflow-hidden text-center p-8 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl">
            {isPassing ? <Trophy className="w-10 h-10 animate-bounce" /> : <Target className="w-10 h-10" />}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              Quest Mission Accomplished
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              {isPassing ? 'Outstanding Work!' : 'Good Effort, Keep Practicing!'}
            </h2>
            <p className="text-xs text-slate-500">
              {topic?.title} • Standard {topic?.standardCode}
            </p>
          </div>

          {/* Stats Highlight Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Accuracy</p>
              <p className="text-2xl font-black text-purple-700">{quizSummary.accuracy}%</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-black text-teal-600">
                {quizSummary.correctAnswers}/{quizSummary.totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">XP Earned</p>
              <p className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 fill-amber-500" />
                +{quizSummary.earnedXP}
              </p>
            </div>
          </div>

          {/* Difficulty Progression Trail */}
          {quizSummary.difficultyProgression && quizSummary.difficultyProgression.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-left space-y-2">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                Adaptive Difficulty Path:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {quizSummary.difficultyProgression.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getDifficultyColor(step.difficulty)}`}>
                      Q{step.questionIndex + 1}: {step.difficulty}
                    </span>
                    {idx < quizSummary.difficultyProgression.length - 1 && (
                      <span className="text-slate-300">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly Unlocked Badges */}
          {unlockedBadges && unlockedBadges.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                New Badge Unlocked!
              </div>
              {unlockedBadges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-amber-950 text-sm">{badge.title}</h5>
                    <p className="text-xs text-amber-800">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={initQuiz} className="w-full sm:w-auto gap-2">
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </Button>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="playful" size="md" className="w-full gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Mission Control
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ================= 2. ACTIVE QUIZ RUNNER VIEW =================
  const progressPercent = Math.round(
    ((currentQuestion.questionIndex) / currentQuestion.totalQuestions) * 100
  );

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/topics/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit to Lesson
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="teal">Georgia {topic?.standardCode}</Badge>
          <Badge variant="slate" className={getDifficultyColor(currentDifficulty)}>
            Difficulty: {currentDifficulty.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>
            Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
          </span>
          <span className="text-purple-600 font-black">{currentQuestion.points || 20} XP at Stake</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-2 border-purple-100 shadow-xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
            {topic?.category} Problem
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* 4 Clickable Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const letters = ['A', 'B', 'C', 'D'];

            let optionStyle =
              'border-2 border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40 text-slate-800';

            if (isSelected) {
              optionStyle = 'border-2 border-purple-600 bg-purple-50 text-purple-900 shadow-sm';
            }

            // Post-submission feedback colors
            if (feedback) {
              if (idx === feedback.correctOptionIndex) {
                optionStyle = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
              } else if (isSelected && !feedback.isCorrect) {
                optionStyle = 'border-2 border-rose-500 bg-rose-50 text-rose-950 line-through';
              } else {
                optionStyle = 'border-2 border-slate-100 bg-slate-50 opacity-60 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={feedback !== null || submitting}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 rounded-2xl text-left font-semibold text-sm sm:text-base transition-all flex items-center gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {letters[idx]}
                </span>
                <span className="flex-1">{option}</span>
                {feedback && idx === feedback.correctOptionIndex && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {feedback && isSelected && !feedback.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Section (Shown after submitting) */}
        {feedback && (
          <div className={`p-5 rounded-2xl border-2 space-y-3 animate-in fade-in ${
            feedback.isCorrect ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <h4 className={`font-black text-sm ${feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {feedback.isCorrect ? 'Correct! Excellent Math!' : 'Not Quite Right'}
                </h4>
              </div>

              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                feedback.isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}>
                +{feedback.earnedXP} XP
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {feedback.explanation}
            </p>

            {/* Adaptive Difficulty Adjustment Notification */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-bold text-slate-500">
              {feedback.currentDifficulty !== currentDifficulty && (
                <span className="flex items-center gap-1 text-purple-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Adapting difficulty to {feedback.currentDifficulty.toUpperCase()} based on your answers!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {!feedback ? (
            <Button
              variant="playful"
              size="lg"
              disabled={selectedOption === null || submitting}
              isLoading={submitting}
              onClick={handleSubmitAnswer}
              className="w-full justify-center"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              onClick={handleAdvance}
              className="w-full justify-center gap-2"
            >
              <span>Continue to Next Challenge</span>
              <Target className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QuizRunnerPage;
