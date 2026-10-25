import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usersAPI } from '../services/api';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  Target,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Compass,
  Zap,
  Lock,
  Flame,
} from 'lucide-react';
import { getDifficultyColor } from '../utils/formatters';
import DailyChallengesPanel from '../components/dashboard/DailyChallengesPanel';
import MiniLeaderboard from '../components/dashboard/MiniLeaderboard';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersAPI.getDashboard();
      if (res.data && res.data.data) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('[DashboardPage] Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Could not load student dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-slate-200/80 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-28 bg-slate-200/80 rounded-3xl" />
          <div className="h-28 bg-slate-200/80 rounded-3xl" />
          <div className="h-28 bg-slate-200/80 rounded-3xl" />
          <div className="h-28 bg-slate-200/80 rounded-3xl" />
        </div>
        <div className="h-44 bg-slate-200/80 rounded-3xl" />
        <div className="h-64 bg-slate-200/80 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Unable to load Mission Control</h3>
        <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
        <Button variant="playful" size="md" onClick={fetchDashboard}>
          Try Again
        </Button>
      </div>
    );
  }

  const {
    stats,
    continueLearning,
    topicProgress,
    recentActivity,
    performanceTrend,
    allBadges,
  } = dashboardData || {};

  const levelInfo = stats?.levelInfo || {
    currentLevel: stats?.level || 1,
    currentTier: { title: 'Novice Cadet' },
    percentage: 0,
    xpNeededForNext: 100,
  };

  return (
    <div className="space-y-8">
      {/* ================= HERO WELCOME BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-500 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 uppercase tracking-wider">
                Grade {user?.grade} Student
              </span>
              <span className="text-xs font-bold text-purple-200 bg-white/10 px-3 py-1 rounded-full">
                Level {stats?.level || 1} • {levelInfo.currentTier?.title || 'Explorer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
              Welcome back, {user?.name}! 🚀
            </h1>
            <p className="text-sm sm:text-base text-purple-100 max-w-xl font-medium">
              You are mastering Georgia Mathematics Standards. Earn XP, solve interactive quizzes, and unlock math achievement badges!
            </p>

            {/* Level XP Progress Bar */}
            <div className="max-w-md space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-purple-200">
                <span>Level {stats?.level || 1}</span>
                <span>
                  {levelInfo.nextTier
                    ? `${levelInfo.xpNeededForNext} XP to Level ${(stats?.level || 1) + 1}`
                    : 'Max Level Champion!'}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${levelInfo.percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 self-start md:self-auto shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-amber-950 font-black shadow-lg">
              <Sparkles className="w-7 h-7 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">Total XP Earned</p>
              <p className="text-3xl font-black text-white">{stats?.totalXP || 0} XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total XP */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total XP</p>
              <h3 className="text-2xl font-black text-slate-800">{stats?.totalXP || 0}</h3>
              <p className="text-xs text-slate-500 font-medium">Lifetime earned</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Level</p>
              <h3 className="text-2xl font-black text-slate-800">Level {stats?.level || 1}</h3>
              <p className="text-xs text-purple-600 font-semibold">{levelInfo.currentTier?.title || 'Cadet'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Completed Lessons */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lessons Completed</p>
              <h3 className="text-2xl font-black text-slate-800">{stats?.lessonsCompleted || 0}</h3>
              <p className="text-xs text-slate-500 font-medium">Georgia standards modules</p>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Accuracy */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz Accuracy</p>
              <h3 className="text-2xl font-black text-slate-800">
                {stats?.quizzesCompleted > 0 ? `${stats?.averageAccuracy}%` : '0%'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {stats?.quizzesCompleted > 0
                  ? `${stats?.quizzesCompleted} quizzes completed`
                  : 'No quizzes taken yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= DAILY STREAK ================= */}
      <Card className="overflow-hidden border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Flame className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-orange-700">Daily streak</p>
              <p className="text-2xl font-black text-slate-900">
                {stats?.streak?.current || 0} {stats?.streak?.current === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Best: {stats?.streak?.longest || 0} days · {stats?.streak?.freezes || 0} streak freezes
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label="This week's completed learning days">
            {(stats?.streak?.week || []).map((day) => (
              <div
                key={day.date}
                title={`${day.date}${day.completed ? ' · completed' : ''}`}
                aria-label={`${new Date(`${day.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  timeZone: 'UTC',
                })}${day.completed ? ', completed' : ', not completed'}`}
                className={`flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-[10px] font-black ${
                  day.completed
                    ? 'border-orange-300 bg-orange-200 text-orange-900'
                    : day.isToday
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <span>{new Date(`${day.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
                  weekday: 'short',
                  timeZone: 'UTC',
                })}</span>
                <span>{day.completed ? '✓' : '·'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DailyChallengesPanel />
      <MiniLeaderboard />

      {/* ================= CONTINUE LEARNING SECTION ================= */}
      {continueLearning && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-teal-50/40 shadow-soft">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="teal" className="gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
                Continue Learning
              </Badge>
              <span className="text-xs font-bold text-slate-400">
                Standard {continueLearning.standardCode}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{continueLearning.title}</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">{continueLearning.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="slate" className={getDifficultyColor(continueLearning.difficulty)}>
                    {continueLearning.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{continueLearning.estimatedMinutes || 15} mins
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/topics/${continueLearning._id || continueLearning.slug}`}>
                  <Button variant="secondary" size="md" className="gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Lesson</span>
                  </Button>
                </Link>
                <Link to={`/topics/${continueLearning._id || continueLearning.slug}/quiz`}>
                  <Button variant="playful" size="md" className="gap-1.5">
                    <Target className="w-4 h-4" />
                    <span>Practice Quiz</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span>Topic Mastery</span>
                <span>{continueLearning.percentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${continueLearning.percentage || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= RECHARTS PERFORMANCE CHART & RECENT ACTIVITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trend Chart with Recharts */}
        <Card className="border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Quiz Performance Trend
            </CardTitle>
            <Badge variant="yellow">Accuracy %</Badge>
          </CardHeader>
          <CardContent className="p-6">
            {performanceTrend && performanceTrend.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="quizNumber" tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip
                      formatter={(val) => [`${val}%`, 'Accuracy']}
                      labelFormatter={(lbl) => `Quiz Attempt ${lbl}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAccuracy)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-400 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No Performance Data Yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Complete your first adaptive practice quiz to see your learning curve charted right here!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Recent Practice Quests
            </CardTitle>
            <span className="text-xs font-bold text-slate-400">Latest Attempts</span>
          </CardHeader>
          <CardContent className="p-6">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-800">{activity.topicTitle}</p>
                        {activity.standardCode && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {activity.standardCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.accuracy}% Accuracy ({activity.score} pts) • {new Date(activity.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="yellow">+{activity.earnedXP} XP</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Zero Quests Logged</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Begin any Grade {user?.grade} topic below to start recording quiz achievements.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= ACHIEVEMENT GALLERY (LOCKED & UNLOCKED) ================= */}
      <Card className="border border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Curriculum Achievement Badges
          </CardTitle>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
            {allBadges?.filter((b) => b.isUnlocked).length || 0} of {allBadges?.length || 6} Unlocked
          </span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allBadges && allBadges.length > 0 ? (
              allBadges.map((badge) => (
                <div
                  key={badge.badgeCode}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    badge.isUnlocked
                      ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${
                      badge.isUnlocked
                        ? 'bg-amber-400 text-amber-950 shadow-sm'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {badge.isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className={`font-bold text-sm ${badge.isUnlocked ? 'text-amber-950' : 'text-slate-600'}`}>
                      {badge.title}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {badge.description}
                    </p>
                    {badge.isUnlocked && badge.unlockedAt && (
                      <span className="text-[10px] font-bold text-amber-700 mt-1 inline-block">
                        Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-3 text-center">Loading badges...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================= TOPIC PROGRESS MODULES ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Grade {user?.grade} Georgia Standards Modules
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Click any module to read AI lessons or test your skills
            </p>
          </div>
          <Link to={`/topics?grade=${user?.grade}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-purple-700">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {topicProgress && topicProgress.length > 0 ? (
            topicProgress.map((topic) => (
              <Card
                key={topic._id}
                className="border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="text-xs font-black">
                      {topic.category}
                    </Badge>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                      {topic.standardCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{topic.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Progress</span>
                      <span className="font-bold text-slate-700">{topic.percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${topic.percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${getDifficultyColor(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                      <span>• ~{topic.estimatedMinutes} min</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/topics/${topic._id}`}>
                        <Button variant="secondary" size="sm">
                          Lesson
                        </Button>
                      </Link>
                      <Link to={`/topics/${topic._id}/quiz`}>
                        <Button variant="playful" size="sm" className="gap-1.5">
                          <span>Quiz</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No topics found for this grade yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
