import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { challengesAPI } from '../services/api';
import { notifyBadgeUnlocks } from '../utils/gamification';
import { useAuth } from '../hooks/useAuth';

const DailyChallengesPage = () => {
  const { refreshUser } = useAuth();
  const [daily, setDaily] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [resetSeconds, setResetSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadChallenges = useCallback(async () => {
    try {
      setError('');
      const response = await challengesAPI.getDaily();
      setDaily(response.data.data);
      return response.data.data;
    } catch (requestError) {
      console.error('[DailyChallengesPage] Could not load challenges:', requestError);
      setError(requestError.response?.data?.message || 'Could not load today’s challenges.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const resetAt = useMemo(() => {
    if (!daily?.date || !daily?.timeZone) return null;
    const [year, month, day] = daily.date.split('-').map(Number);
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
    let guess = Date.parse(`${nextDate}T00:00:00.000Z`);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: daily.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    for (let index = 0; index < 3; index += 1) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(guess))
        .map(({ type, value }) => [type, value]));
      const localAsUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second)
      );
      guess += Date.parse(`${nextDate}T00:00:00.000Z`) - localAsUtc;
    }
    return guess;
  }, [daily?.date, daily?.timeZone]);

  useEffect(() => {
    if (!resetAt) return undefined;
    const updateCountdown = () => setResetSeconds(Math.max(0, Math.floor((resetAt - Date.now()) / 1000)));
    let refreshed = false;
    updateCountdown();
    const interval = window.setInterval(() => {
      updateCountdown();
      if (!refreshed && resetAt <= Date.now()) {
        refreshed = true;
        loadChallenges();
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [loadChallenges, resetAt]);

  const selected = daily?.challenges.find((challenge) => challenge.code === selectedCode);
  const currentQuestion = selected?.questions[questionIndex];

  useEffect(() => {
    if (!selected || selected.durationSeconds <= 0 || selected.completed || selected.expired) return undefined;
    setRemainingSeconds(selected.remainingSeconds || selected.durationSeconds);
    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [selected?.code, selected?.remainingSeconds, selected?.durationSeconds, selected?.completed, selected?.expired]);

  useEffect(() => {
    if (!selected || selected.durationSeconds <= 0 || remainingSeconds > 0 || !selected.answeredCount) return;
    setDaily((current) => ({
      ...current,
      challenges: current.challenges.map((challenge) => challenge.code === selected.code
        ? { ...challenge, expired: true }
        : challenge),
    }));
  }, [remainingSeconds, selected?.code, selected?.durationSeconds, selected?.startedAt]);

  const startChallenge = (challenge) => {
    setFeedback(null);
    setSelectedCode(challenge.code);
    setQuestionIndex(challenge.answeredCount);
    setRemainingSeconds(challenge.remainingSeconds || challenge.durationSeconds);
  };

  const submitAnswer = async (selectedOptionIndex) => {
    if (!selected || !currentQuestion || submitting || remainingSeconds === 0 && selected.durationSeconds > 0) return;
    try {
      setSubmitting(true);
      const response = await challengesAPI.submitAnswer(selected.code, {
        questionIndex,
        selectedOptionIndex,
      });
      const result = response.data.data;
      setFeedback(result);
      notifyBadgeUnlocks(result.newlyUnlockedBadges || []);
      setDaily((current) => ({
        ...current,
        completedCount: current.completedCount + (result.completed ? 1 : 0),
        challenges: current.challenges.map((challenge) => challenge.code === selected.code
          ? {
              ...challenge,
              answeredCount: result.answeredCount,
              completed: result.completed,
              remainingSeconds: result.remainingSeconds,
            }
          : challenge),
        bonusChest: result.bonusChest || current.bonusChest,
      }));
      if (result.completed) refreshUser();
    } catch (requestError) {
      console.error('[DailyChallengesPage] Could not submit answer:', requestError);
      setError(requestError.response?.data?.message || 'Could not record your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const continueChallenge = () => {
    setFeedback(null);
    if (!feedback?.completed) setQuestionIndex((index) => index + 1);
    else loadChallenges();
  };

  if (loading) return <div className="h-72 animate-pulse rounded-3xl bg-slate-200" aria-label="Loading challenges" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-700">
        <ArrowLeft className="h-4 w-4" /> Mission Control
      </Link>
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-500 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-purple-200">Daily quest board · Grade {daily?.grade}</p>
            <h1 className="mt-2 text-3xl font-black">Three quests. One bonus chest.</h1>
            <p className="mt-2 text-sm text-purple-100">
              {daily?.date} · Resets in {Math.floor(resetSeconds / 3600)}:
              {String(Math.floor((resetSeconds % 3600) / 60)).padStart(2, '0')}:
              {String(resetSeconds % 60).padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 text-center">
            <Flame className="mx-auto h-7 w-7 text-orange-300" aria-hidden="true" />
            <p className="mt-1 font-black">{daily?.completedCount || 0}/3</p>
            <p className="text-xs font-bold text-purple-100">completed</p>
          </div>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

      {selected && !feedback && currentQuestion && (
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{selected.title} · Question {questionIndex + 1} of {selected.questionCount}</CardTitle>
            {selected.durationSeconds > 0 && (
              <Badge variant={remainingSeconds < 30 ? 'yellow' : 'teal'}>
                <Clock3 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-lg font-bold text-slate-800">{currentQuestion.questionText}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={`${currentQuestion.questionIndex}-${option}`}
                  variant="secondary"
                  size="md"
                  disabled={submitting || remainingSeconds === 0 && selected.durationSeconds > 0}
                  onClick={() => submitAnswer(index)}
                  className="justify-start text-left"
                  aria-label={`Answer option ${index + 1}: ${option}`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selected && feedback && (
        <Card className="border-teal-200">
          <CardContent className="space-y-4 p-6">
            <p className={`flex items-center gap-2 text-lg font-black ${feedback.isCorrect ? 'text-teal-700' : 'text-orange-700'}`}>
              {feedback.isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              {feedback.isCorrect ? 'That’s correct!' : 'Good try — here’s how to solve it.'}
            </p>
            <p className="text-sm text-slate-600">{feedback.explanation}</p>
            {feedback.rewardXP > 0 && (
              <p className="rounded-xl bg-amber-100 p-3 font-black text-amber-900">
                <Sparkles className="mr-1 inline h-4 w-4" /> +{feedback.rewardXP} XP earned!
              </p>
            )}
            {feedback.bonusChest?.unlocked && (
              <p className="rounded-xl bg-purple-100 p-3 font-black text-purple-900" role="status">
                Bonus chest {feedback.bonusChest.claimed ? 'opened: +60 XP!' : 'unlocked!'}
              </p>
            )}
            <Button variant="playful" size="md" onClick={continueChallenge}>
              {feedback.completed ? 'Back to the challenge board' : 'Next question'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(daily?.challenges || []).map((challenge) => (
          <Card key={challenge.code} className={challenge.completed ? 'border-teal-300' : 'border-slate-200'}>
            <CardContent className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{challenge.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{challenge.description}</p>
                </div>
                {challenge.completed && <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" aria-label="Completed" />}
              </div>
              <div className="mt-4 flex-1 space-y-1 text-xs font-bold text-slate-500">
                <p>{challenge.questionCount} question{challenge.questionCount === 1 ? '' : 's'} · +{challenge.rewardXP} XP</p>
                {challenge.standardCode && <p>Standard {challenge.standardCode}</p>}
                {challenge.durationSeconds > 0 && <p>3-minute timer</p>}
              </div>
              <Button
                variant={challenge.completed ? 'secondary' : 'playful'}
                size="sm"
                disabled={challenge.completed || challenge.expired}
                onClick={() => startChallenge(challenge)}
                className="mt-4 w-full"
              >
                {challenge.completed ? 'Completed' : challenge.expired ? 'Time expired' : challenge.answeredCount ? 'Continue' : 'Start quest'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyChallengesPage;
