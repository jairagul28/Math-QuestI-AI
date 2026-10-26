import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topicsAPI, aiAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import VideoLessonModal from '../components/common/VideoLessonModal';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Target,
  Brain,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Play,
  RotateCw,
  Image as ImageIcon,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { getDifficultyColor } from '../utils/formatters';
import { notifyBadgeUnlocks } from '../utils/gamification';

export const TopicDetailPage = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();

  const [topic, setTopic] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState(null);
  const [lessonError, setLessonError] = useState(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(null);
  const topicRequestRef = useRef(0);
  const lessonRequestRef = useRef(0);

  // Video-style lesson modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Infographic lightbox state
  const [isInfographicZoomed, setIsInfographicZoomed] = useState(false);

  // Expanded state for worked examples
  const [expandedExamples, setExpandedExamples] = useState({});

  const loadLesson = async (topicData, forceRefresh = false) => {
    if (!topicData) return;
    const requestId = ++lessonRequestRef.current;
    try {
      setLoadingLesson(true);
      setLesson(null);
      setLessonError(null);
      const res = await aiAPI.generateLesson({
        grade: topicData.grade,
        topicId: topicData._id,
        topicTitle: topicData.title,
        standardCode: topicData.standardCode,
        standardDescription: topicData.standardDescription,
        forceRefresh,
      });
      if (requestId !== lessonRequestRef.current) return;
      const lessonData = res.data?.data;
      const lessonTopicId = String(lessonData?.topicId?._id || lessonData?.topicId || '');
      if (
        !lessonData
        || lessonData.grade !== topicData.grade
        || lessonTopicId !== String(topicData._id)
        || !Array.isArray(lessonData.videoSlides)
        || lessonData.videoSlides.length !== 5
      ) {
        throw new Error('The lesson response did not match this topic.');
      }
      setLesson(lessonData);
    } catch (err) {
      if (requestId === lessonRequestRef.current) {
        console.error('[TopicDetailPage] Could not load topic video lesson:', err);
        setLessonError('unavailable');
      }
    } finally {
      if (requestId === lessonRequestRef.current) {
        setLoadingLesson(false);
      }
    }
  };

  useEffect(() => {
    const requestId = ++topicRequestRef.current;
    lessonRequestRef.current += 1;
    setTopic(null);
    setLesson(null);
    setError(null);
    setLessonError(null);
    setIsVideoModalOpen(false);
    setLoadingTopic(true);
    setLoadingLesson(false);

    const fetchTopic = async () => {
      try {
        const topicRes = await topicsAPI.getTopicById(id);
        if (requestId !== topicRequestRef.current) return;
        const topicData = topicRes.data.data;
        setTopic(topicData);
        setLoadingTopic(false);
        void loadLesson(topicData);
      } catch (err) {
        if (requestId === topicRequestRef.current) {
          console.error('[TopicDetailPage] Could not load topic:', err);
          setError(err.response?.data?.message || 'Could not load topic.');
        }
      } finally {
        if (requestId === topicRequestRef.current) {
          setLoadingTopic(false);
        }
      }
    };

    fetchTopic();
    return () => {
      topicRequestRef.current += 1;
      lessonRequestRef.current += 1;
    };
  }, [id]);

  const handleRetryLesson = () => loadLesson(topic);

  const handleRegenerateLesson = async () => {
    if (!topic) return;
    await loadLesson(topic, true);
  };

  const handleCompleteLesson = async () => {
    if (!topic || lessonCompleted) return;
    try {
      setCompletingLesson(true);
      const res = await aiAPI.completeLesson({ topicId: topic._id });
      setLessonCompleted(true);
      setCompletionSuccess(res.data);
      notifyBadgeUnlocks(res.data.newlyUnlockedBadges || []);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('[Complete Lesson Error]:', err);
    } finally {
      setCompletingLesson(false);
    }
  };

  const toggleExample = (index) => {
    setExpandedExamples((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loadingTopic) {
    return (
      <div className="py-10 max-w-5xl mx-auto px-4 space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Unable to Load Quest</h2>
        <p className="text-sm text-slate-500">{error || 'The requested topic does not exist.'}</p>
        <Link to="/topics">
          <Button variant="secondary" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </Button>
        </Link>
      </div>
    );
  }

  const isFractionTopic = topic.category === 'Fractions' || topic.slug.includes('fraction');

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Navigation Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/topics?grade=${topic.grade}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Grade {topic.grade} Curriculum
        </Link>

        <div className="flex items-center gap-3">
          {/* Video-style lesson button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsVideoModalOpen(true)}
            className="gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200"
          >
            <Play className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
            <span>Narrated Slide Lesson</span>
          </Button>

          {/* Practice Quiz Link */}
          <Link to={`/topics/${topic._id}/quiz`}>
            <Button variant="playful" size="sm" className="gap-2">
              <Target className="w-4 h-4" />
              <span>Practice Quiz</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Topic Hero Card */}
      <div className="relative bg-white rounded-3xl border-2 border-slate-100 shadow-soft p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={topic.grade === 5 ? 'default' : 'teal'}>
              Grade {topic.grade}
            </Badge>
            <Badge variant="yellow">{topic.category}</Badge>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${getDifficultyColor(topic.difficulty)}`}>
              {topic.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Estimated {topic.estimatedMinutes} mins</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {topic.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {topic.description}
          </p>
        </div>

        {/* Georgia Standard Banner */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Georgia Mathematics Standard: {topic.standardCode}
            </p>
            <p className="text-xs text-teal-800 leading-relaxed">
              {topic.standardDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification if Lesson Completed */}
      {completionSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-bold text-sm">Lesson Milestone Complete!</h4>
              <p className="text-xs text-emerald-700">
                {completionSuccess.message} ({completionSuccess.earnedXP} XP awarded to your profile)
              </p>
            </div>
          </div>
          <Link to={`/topics/${topic._id}/quiz`}>
            <Button variant="playful" size="sm" className="bg-emerald-600 hover:bg-emerald-700 border-emerald-800">
              Start Practice Quiz →
            </Button>
          </Link>
        </div>
      )}

      {/* AI Lesson Body */}
      {loadingLesson ? (
        <Card className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center animate-spin">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Synthesizing Georgia Standards Lesson...</h3>
              <p className="text-xs text-slate-400">Groq AI is assembling step-by-step explanations and math examples.</p>
            </div>
          </div>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-44 w-full" />
        </Card>
      ) : lesson ? (
        <div className="space-y-8">
          {/* Lesson Introduction & Explanation */}
          <Card className="border border-slate-200 shadow-soft">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Concept Exploration</CardTitle>
                  <p className="text-xs text-slate-400">
                    {lesson.isFallback ? 'Verified Georgia Standards Curriculum Module' : 'Groq AI Powered Learning Module'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRegenerateLesson}
                title="Refresh with Groq AI"
                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Introduction Callout */}
              {lesson.introduction && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-teal-50 border border-purple-100">
                  <p className="text-sm font-semibold text-purple-950 leading-relaxed">
                    {lesson.introduction}
                  </p>
                </div>
              )}

              {/* Detailed Explanation */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Step-by-Step Explanation
                </h4>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                  {lesson.explanation}
                </div>
              </div>

              {/* Key Concepts Grid */}
              {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Key Concepts to Remember
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lesson.keyConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{concept}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI-Generated Educational Infographic (Section 4.4) */}
          {(lesson.infographicUrl || isFractionTopic) && (
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50/30 via-white to-purple-50/30 overflow-hidden shadow-soft">
              <CardHeader className="border-b border-teal-100 pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base text-teal-950">
                      Visual Math Infographic: Equivalent Fractions
                    </CardTitle>
                    <p className="text-[11px] text-teal-700">
                      AI-generated visual model for Georgia Standard 5.NR.3
                    </p>
                  </div>
                </div>

                <Badge variant="teal">AI Infographic</Badge>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-teal-200 shadow-md bg-white">
                  <img
                    src={lesson.infographicUrl || '/infographics/equivalent-fractions-infographic.png'}
                    alt="Educational infographic illustrating equivalent fractions 1/2 = 2/4 = 4/8 with visual fraction strips and circle charts"
                    className="w-full max-h-[450px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    onClick={() => setIsInfographicZoomed(true)}
                  />
                  <div
                    onClick={() => setIsInfographicZoomed(true)}
                    className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                      Click to expand full size
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Visual Inspection Check:</strong> The infographic demonstrates that multiplying both numerator and denominator by 2 preserves equal area: 1/2 (one 50% bar) = 2/4 (two 25% bars) = 4/8 (four 12.5% bars).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Worked Examples Section */}
          {lesson.workedExamples && lesson.workedExamples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Step-by-Step Worked Examples</h3>
                  <p className="text-xs text-slate-500">Study each solution carefully before testing your skills</p>
                </div>
              </div>

              <div className="space-y-4">
                {lesson.workedExamples.map((example, idx) => {
                  const isExpanded = expandedExamples[idx] ?? true;
                  return (
                    <Card key={idx} className="border border-slate-200">
                      <div
                        onClick={() => toggleExample(idx)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            #{idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                            {example.question}
                          </h4>
                        </div>
                        <button className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50">
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Solution Steps:
                            </span>
                            <div className="space-y-2">
                              {example.steps.map((step, stepIdx) => (
                                <div key={stepIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                  <span className="font-medium">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                              Verified Answer:
                            </span>
                            <span className="text-sm font-black text-emerald-900 font-mono">
                              {example.answer}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real World Applications & Practice Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lesson.realWorldApplication && (
              <Card className="border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
                    <Zap className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Real-World Mission</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lesson.realWorldApplication}
                </p>
              </Card>
            )}

            {lesson.practiceTips && lesson.practiceTips.length > 0 && (
              <Card className="border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Pro Tips for Quizzes</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {lesson.practiceTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-teal-600 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-black">Ready to Prove Your Mastery?</h3>
              <p className="text-xs text-purple-200">
                Complete this lesson to earn +15 XP, then tackle the adaptive practice quiz!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              {user && !lessonCompleted && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCompleteLesson}
                  isLoading={completingLesson}
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Mark Lesson Done (+15 XP)
                </Button>
              )}

              <Link to={`/topics/${topic._id}/quiz`}>
                <Button variant="yellow" size="lg" className="gap-2 shadow-lg">
                  <Target className="w-5 h-5 text-amber-950" />
                  <span>Start Practice Quiz Now</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : lessonError ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            Video lesson for this topic is temporarily unavailable. Please try again.
          </p>
          <Button variant="playful" size="sm" onClick={handleRetryLesson}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Video Lesson Modal */}
      <VideoLessonModal
        key={id}
        isOpen={isVideoModalOpen && (id === topic._id || id === topic.slug)}
        onClose={() => setIsVideoModalOpen(false)}
        onRetry={handleRetryLesson}
        topic={topic}
        lesson={lesson}
        isLoading={loadingLesson}
      />

      {/* Infographic Zoom Lightbox */}
      {isInfographicZoomed && (
        <div
          onClick={() => setIsInfographicZoomed(false)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden">
            <button
              onClick={() => setIsInfographicZoomed(false)}
              className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-xl"
            >
              ✕
            </button>
            <img
              src={lesson?.infographicUrl || '/infographics/equivalent-fractions-infographic.png'}
              alt="Zoomed educational infographic"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicDetailPage;
