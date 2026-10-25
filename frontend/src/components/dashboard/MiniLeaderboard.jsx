import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { usersAPI } from '../../services/api';
import { AVATAR_EMOJI } from '../../utils/rewardCatalog';

const MiniLeaderboard = () => {
  const [settings, setSettings] = useState(null);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    usersAPI.getLeaderboardSettings()
      .then(async (response) => {
        if (!active) return;
        const preference = response.data.data;
        setSettings(preference);
        if (preference.optIn) {
          const board = await usersAPI.getLeaderboard({
            period: 'weekly',
            grade: String(preference.grade),
          });
          if (active) setEntries(board.data.data.entries.slice(0, 3));
        }
      })
      .catch((error) => {
        console.error('[MiniLeaderboard] Could not load weekly board:', error);
        if (active) setError('Unable to load the leaderboard right now.');
      });
    return () => { active = false; };
  }, []);

  return (
    <Card className="border border-amber-200">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Weekly leaderboard
        </CardTitle>
        <Link to="/dashboard/leaderboard" className="text-xs font-black text-purple-700 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <p role="status" className="text-sm font-semibold text-rose-600">{error}</p>
        ) : settings?.optIn ? (
          entries.length ? entries.map((student) => (
            <div key={student.rank} className={`flex items-center gap-3 rounded-xl p-2 ${
              student.isCurrentUser ? 'bg-purple-50' : 'bg-slate-50'
            }`}>
              <span className="w-6 text-center text-sm font-black text-amber-700">#{student.rank}</span>
              <span className="text-xl" aria-hidden="true">{AVATAR_EMOJI[student.avatar] || AVATAR_EMOJI.fox}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">{student.displayName}</span>
              <span className="text-xs font-black text-amber-700">{student.xp} XP</span>
            </div>
          )) : <p className="text-sm text-slate-500">No weekly scores yet. Start a quest!</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Leaderboards are private until you opt in with your generated nickname.</p>
            <Link to="/dashboard/leaderboard">
              <Button variant="secondary" size="sm" className="gap-2">
                Review privacy settings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniLeaderboard;
