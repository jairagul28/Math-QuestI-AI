import React, { useCallback, useEffect, useState } from 'react';
import { Crown, EyeOff, Flame, Lock, ShieldCheck, Trophy, Users } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { usersAPI } from '../services/api';
import { AVATAR_EMOJI, ACCESSORY_EMOJI } from '../utils/rewardCatalog';

const PERIODS = [
  { value: 'weekly', label: 'This Week' },
  { value: 'all-time', label: 'All-Time' },
];
const FILTERS = [
  { value: 'my-class', label: 'My Class' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
];

const LeaderboardRow = ({ student }) => (
  <li className={`flex items-center gap-3 rounded-2xl border p-3 ${
    student.isCurrentUser ? 'border-purple-300 bg-purple-50' : 'border-slate-100 bg-white'
  }`}>
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 font-black text-amber-900">
      {student.rank <= 3 ? <Crown className="h-4 w-4" aria-hidden="true" /> : student.rank}
    </span>
    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-purple-100 to-teal-100 text-2xl" aria-hidden="true">
      {AVATAR_EMOJI[student.avatar] || AVATAR_EMOJI.fox}
      {ACCESSORY_EMOJI[student.accessory] && (
        <span className="absolute -right-1 -top-1 text-xs">{ACCESSORY_EMOJI[student.accessory]}</span>
      )}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-black text-slate-900">
        {student.displayName}{student.isCurrentUser ? ' (You)' : ''}
      </span>
      <span className="text-xs font-semibold text-slate-500">Level {student.level}</span>
    </span>
    <span className="shrink-0 text-right">
      <span className="block font-black text-amber-700">{student.xp.toLocaleString()} XP</span>
      <span className="text-[10px] font-bold uppercase text-slate-400">Rank #{student.rank}</span>
    </span>
  </li>
);

const LeaderboardPage = () => {
  const [settings, setSettings] = useState(null);
  const [period, setPeriod] = useState('weekly');
  const [grade, setGrade] = useState('5');
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      const response = await usersAPI.getLeaderboardSettings();
      setSettings(response.data.data);
      setGrade(String(response.data.data.grade));
    } catch (requestError) {
      console.error('[LeaderboardPage] Could not load privacy settings:', requestError);
      setError(requestError.response?.data?.message || 'Could not load leaderboard settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBoard = useCallback(async () => {
    if (!settings?.optIn) {
      setBoard(null);
      return;
    }
    try {
      setError('');
      const response = await usersAPI.getLeaderboard({ period, grade });
      setBoard(response.data.data);
    } catch (requestError) {
      console.error('[LeaderboardPage] Could not load leaderboard:', requestError);
      setError(requestError.response?.data?.message || 'Could not load the leaderboard.');
    }
  }, [grade, period, settings?.optIn]);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { loadBoard(); }, [loadBoard]);

  const setParticipation = async (optIn) => {
    try {
      setSaving(true);
      setError('');
      const response = await usersAPI.updateLeaderboardSettings({ optIn });
      setSettings((current) => ({ ...current, ...response.data.data }));
    } catch (requestError) {
      console.error('[LeaderboardPage] Could not update participation:', requestError);
      setError(requestError.response?.data?.message || 'Could not update leaderboard participation.');
    } finally {
      setSaving(false);
    }
  };

  const visibleEntries = board?.entries || [];
  const currentOutsideTopTen = board?.currentUser
    && !visibleEntries.some((entry) => entry.isCurrentUser);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-600 to-teal-500 p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-9 w-9 text-amber-300" aria-hidden="true" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-purple-200">Friendly math competition</p>
            <h1 className="text-3xl font-black">Leaderboard</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-purple-100">
          Joining is optional. Only a generated nickname, avatar, level, and XP are shown—never your real name or email.
        </p>
      </div>

      <Card className="border border-teal-200 bg-teal-50/50">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" aria-hidden="true" />
            <div>
              <h2 className="font-black text-slate-900">Kid-safe privacy controls</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your leaderboard nickname is <strong>{settings?.nickname || 'generated for you'}</strong>. You can leave at any time.
              </p>
            </div>
          </div>
          {settings?.optIn ? (
            <Button variant="secondary" size="sm" disabled={saving} onClick={() => setParticipation(false)} className="gap-2">
              <EyeOff className="h-4 w-4" aria-hidden="true" /> Hide me
            </Button>
          ) : (
            <Button variant="playful" size="sm" disabled={saving || loading} onClick={() => setParticipation(true)} className="gap-2">
              <Users className="h-4 w-4" aria-hidden="true" /> {saving ? 'Saving…' : 'Opt in'}
            </Button>
          )}
        </CardContent>
      </Card>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200" aria-label="Loading leaderboard" />
      ) : !settings?.optIn ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto h-10 w-10 text-purple-500" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-black text-slate-900">You’re currently hidden</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Opt in when you’re ready. You can withdraw instantly, and your account stays private by default.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Leaderboard time period">
              {PERIODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={period === item.value}
                  onClick={() => setPeriod(item.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-black ${
                    period === item.value ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Leaderboard group">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={grade === item.value}
                  onClick={() => setGrade(item.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${
                    grade === item.value ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
              {period === 'weekly' ? 'Weekly XP race' : 'All-time XP'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {board?.message && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{board.message}</p>}
            {visibleEntries.length > 0 ? (
              <ol className="space-y-2" aria-label="Leaderboard rankings">
                {visibleEntries.map((student) => <LeaderboardRow key={student.rank} student={student} />)}
              </ol>
            ) : !board?.message ? (
              <p className="py-8 text-center text-sm font-semibold text-slate-500">No opted-in learners in this group yet.</p>
            ) : null}
            {currentOutsideTopTen && (
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Your position</p>
                <LeaderboardRow student={board.currentUser} />
              </div>
            )}
            {period === 'weekly' && (
              <p className="text-center text-xs font-semibold text-slate-400">
                Weekly XP resets every Monday at 00:00 UTC.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaderboardPage;
