import React, { useEffect, useState } from 'react';
import { Award, Lock, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { usersAPI } from '../services/api';

const RARITY_STYLES = {
  common: 'border-slate-200 bg-white',
  rare: 'border-blue-200 bg-blue-50/50',
  epic: 'border-purple-200 bg-purple-50/60',
  legendary: 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100',
};

const RewardsPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI.getDashboard()
      .then((response) => setBadges(response.data.data.allBadges || []))
      .catch((requestError) => {
        console.error('[RewardsPage] Could not load badge catalog:', requestError);
        setError(requestError.response?.data?.message || 'Could not load your trophy room.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(badges.map((badge) => badge.category))];

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-600">Your achievements</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Trophy Room</h1>
          <p className="mt-2 text-sm text-slate-600">Every badge celebrates a real learning milestone.</p>
        </div>
        <Link to="/dashboard/avatars">
          <Button variant="secondary" size="sm">Visit Avatar Workshop</Button>
        </Link>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
      {loading ? (
        <div className="h-72 animate-pulse rounded-3xl bg-slate-200" aria-label="Loading rewards" />
      ) : (
        categories.map((category) => (
          <section key={category} aria-labelledby={`category-${category}`} className="space-y-3">
            <h2 id={`category-${category}`} className="text-xl font-black text-slate-900">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges.filter((badge) => badge.category === category).map((badge) => (
                <Card
                  key={badge.badgeCode}
                  className={`border ${RARITY_STYLES[badge.rarity] || RARITY_STYLES.common} ${
                    badge.isUnlocked ? 'shadow-sm' : 'opacity-80'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                        badge.isUnlocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {badge.isUnlocked
                          ? <Trophy className="h-6 w-6" aria-hidden="true" />
                          : <Lock className="h-5 w-5" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-900">{badge.title}</h3>
                          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase text-slate-500">
                            {badge.rarity}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{badge.description}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                        <span>{badge.isUnlocked ? 'Earned!' : 'Progress'}</span>
                        <span>{badge.progressLabel}</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${badge.title} progress`}
                        aria-valuemin="0"
                        aria-valuemax={badge.goal}
                        aria-valuenow={badge.progress}
                        className="h-2 overflow-hidden rounded-full bg-slate-200"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-teal-500 transition-[width]"
                          style={{ width: `${Math.min(100, (badge.progress / badge.goal) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {badge.isUnlocked && badge.unlockedAt && (
                      <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                        <Award className="h-3.5 w-3.5" aria-hidden="true" />
                        Earned {new Date(badge.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Sparkles className="h-4 w-4 text-purple-500" aria-hidden="true" />
        New badges unlock as you explore standards, practice, and keep streaks going.
      </p>
    </div>
  );
};

export default RewardsPage;
