import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Flame, Sparkles } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { challengesAPI } from '../../services/api';

const DailyChallengesPanel = () => {
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    challengesAPI.getDaily()
      .then((response) => setDaily(response.data.data))
      .catch((requestError) => {
        console.error('[DailyChallengesPanel] Could not load challenges:', requestError);
        setError(requestError.response?.data?.message || 'Daily challenges are unavailable right now.');
      });
  }, []);

  return (
    <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-teal-50/60">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-600" aria-hidden="true" />
          Today’s Challenges
        </CardTitle>
        <Badge variant="teal">{daily ? `${daily.completedCount}/3 complete` : 'Daily quests'}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p role="status" className="text-sm font-semibold text-rose-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(daily?.challenges || []).map((challenge) => (
              <div key={challenge.code} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-slate-800">{challenge.title}</h3>
                  {challenge.completed && <CheckCircle2 className="h-5 w-5 text-teal-600" aria-label="Completed" />}
                </div>
                <p className="mt-1 text-xs text-slate-500">{challenge.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-amber-500" />{challenge.rewardXP} XP</span>
                  {challenge.durationSeconds > 0 && (
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />Timed</span>
                  )}
                  {challenge.standardCode && <span>{challenge.standardCode}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-orange-700">
            <Flame className="h-4 w-4" aria-hidden="true" />
            Challenge completions keep your learning streak alive.
          </p>
          <Link to="/dashboard/challenges">
            <Button variant="playful" size="sm" className="gap-2">
              Play today’s quests <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {daily?.bonusChest?.unlocked && (
          <p className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900" role="status">
            Bonus chest unlocked! {daily.bonusChest.claimed ? 'Your 60 XP reward is claimed.' : 'Finish collecting your rewards!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChallengesPanel;
