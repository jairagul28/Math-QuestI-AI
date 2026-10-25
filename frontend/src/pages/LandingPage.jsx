import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
  Sparkles,
  Award,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  Compass,
  Trophy,
  Brain,
  Layers,
  GraduationCap,
  Star,
  BookOpen,
  PieChart,
  Scale,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 bg-gradient-to-b from-purple-50/70 via-white to-slate-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-200/20 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Text */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 border border-purple-200/70 text-purple-800 text-xs sm:text-sm font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600 animate-spin" />
                <span>Next-Gen Gamified Learning for Grades 5 & 6</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Make Math an <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">Adventure!</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Unlock mathematical superpowers with MathQuest AI. Master fractions, decimals, ratios, and geometry through playful story quests aligned with Georgia Mathematics Standards.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
                  <Button variant="playful" size="xl" className="w-full sm:w-auto gap-3 text-lg">
                    <Sparkles className="w-5 h-5" />
                    {isAuthenticated ? 'Go to Mission Control' : 'Start Learning Free'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/topics" className="w-full sm:w-auto">
                  <Button variant="secondary" size="xl" className="w-full sm:w-auto gap-2">
                    <Compass className="w-5 h-5 text-teal-600" />
                    Browse Curriculum
                  </Button>
                </Link>
              </div>

              {/* Highlights Pill Row */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Georgia Standards GSE/K-12</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Interactive Groq AI Tutor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>Gamified XP & Badges</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating XP Badge */}
                <div className="absolute -top-6 -left-6 bg-white border-2 border-amber-300 rounded-2xl p-3 shadow-xl flex items-center gap-3 z-20 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-amber-950 font-black">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Quest Cleared</p>
                    <p className="text-sm font-black text-amber-600">+100 XP Earned</p>
                  </div>
                </div>

                {/* Floating AI tutor badge */}
                <div className="absolute -bottom-6 -right-4 bg-white border-2 border-teal-300 rounded-2xl p-3 shadow-xl flex items-center gap-3 z-20 animate-float [animation-delay:1.5s]">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Groq AI Helper</p>
                    <p className="text-sm font-black text-teal-700">Adaptive Hints Ready</p>
                  </div>
                </div>

                {/* Main Quest Showcase Card */}
                <div className="bg-white rounded-3xl border-2 border-purple-200/80 shadow-2xl p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="teal">Grade 5 & 6 Standards</Badge>
                    <span className="text-xs font-bold text-slate-400">Mission #01</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">
                      The Great Fraction Castle 🏰
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard 5.NR.3: Adding fractions with unlike denominators.
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-2">
                    <p className="text-xs font-bold text-purple-900">Example Quest Problem:</p>
                    <p className="text-base font-bold text-purple-950">
                      What is <span className="underline decoration-purple-400">1/3 + 2/5</span>?
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 p-2 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5" />
                      Tip: Find the Least Common Multiple (LCM) of 3 and 5!
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Level 1 Mastery</span>
                      <span className="text-purple-600">80% Ready</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-teal-400 h-full rounded-full w-4/5" />
                    </div>
                  </div>

                  <Link to="/register" className="block pt-2">
                    <Button variant="playful" size="md" className="w-full">
                      Join the Adventure
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GRADE 5 & GRADE 6 FEATURE CARDS ================= */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="default" className="text-xs uppercase tracking-wider">
              Tailored Curriculum Paths
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Grade 5 & Grade 6 Learning Paths
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Carefully differentiated math journeys strictly aligned with the Georgia Mathematics Standards (GSE/K-12).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Grade 5 Card */}
            <Card className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700">
                    ELEMENTARY LEVEL
                  </span>
                  <Badge variant="yellow">Georgia 5.NR & 5.GSR</Badge>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Grade 5: The Math Kingdom</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Build rock-solid foundations in fraction models, decimals to thousandths, and spatial volume calculations.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Fractions with Unlike Denominators</p>
                      <p className="text-xs text-slate-500">Master least common denominators and visual models (5.NR.3)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Decimal Place Value & Operations</p>
                      <p className="text-xs text-slate-500">Read, compare, and compute decimals to thousandths (5.NR.1 & 5.NR.2)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Volume & 2D Shape Properties</p>
                      <p className="text-xs text-slate-500">Explore unit cubes, rectangular prisms, and polygon hierarchy (5.GSR.8)</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to="/topics?grade=5" className="w-full">
                    <Button variant="playful" size="md" className="w-full gap-2">
                      <BookOpen className="w-4 h-4" />
                      Explore Grade 5 Quests
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Grade 6 Card */}
            <Card className="border-2 border-teal-100 hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800">
                    MIDDLE SCHOOL LAUNCHPAD
                  </span>
                  <Badge variant="blue">Georgia 6.NR & 6.GSR</Badge>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Grade 6: The Ratio Frontier</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Advance to middle school mathematics: ratio reasoning, dividing fractions by fractions, and multi-digit decimal mastery.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Ratios, Rates & Proportions</p>
                      <p className="text-xs text-slate-500">Unit rate reasoning, tape diagrams, and percentage problem solving (6.NR.4)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Dividing Fractions by Fractions</p>
                      <p className="text-xs text-slate-500">Reciprocal strategies and visual dividing representations (6.NR.1)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Area of Polygons & 3D Nets</p>
                      <p className="text-xs text-slate-500">Deconstruct polygons into triangles and fold nets for surface area (6.GSR.5)</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to="/topics?grade=6" className="w-full">
                    <Button variant="accent" size="md" className="w-full gap-2">
                      <Scale className="w-4 h-4" />
                      Explore Grade 6 Quests
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="teal">Simple 3-Step Journey</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              How MathQuest AI Works
            </h2>
            <p className="text-base text-slate-600 font-medium">
              We turn abstract mathematical concepts into engaging visual missions that stick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-2xl mx-auto shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Choose Your Grade Quest</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Select your grade (5 or 6) and pick a topic standard—from unlike denominators to ratio unit rates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-2xl mx-auto shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Learn with AI Visuals</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Groq AI generates child-friendly step-by-step explanations, real-world analogies, and interactive visual aids.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-2xl mx-auto shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Earn XP & Level Up</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete adaptive quizzes, earn mathematical badges, and watch your confidence and mastery skyrocket!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI LEARNING & ADAPTIVE QUIZ SECTION ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="blue">Powered by Groq High-Speed AI</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Personalized AI Tutoring That Never Gets Tired
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Every student learns at their own pace. MathQuest AI breaks down intimidating math formulas into friendly bite-sized pieces with customizable difficulty levels and instant feedback.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Dynamic Explanations</h4>
                    <p className="text-sm text-slate-500">
                      No generic textbook jargon. Lessons adapt to young minds using pizza slices, space missions, and treasure hunts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Adaptive Quiz System</h4>
                    <p className="text-sm text-slate-500">
                      Diagnostic questions automatically tune in real-time, giving encouraging hints when a student gets stuck.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-purple-100 via-indigo-50 to-teal-100 p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-inner">
              <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-purple-700">Groq AI Adaptive Prompt</span>
                  <Badge variant="teal">Phase 2 AI Pipeline</Badge>
                </div>
                <div className="text-sm text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  "Hey Explorer! If 2/3 of a treasure chest is filled with gold coins, how many 1/6 portions can you divide it into?"
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-3 rounded-xl border border-slate-200 text-center hover:bg-purple-50 cursor-pointer">
                    A) 2 portions
                  </div>
                  <div className="p-3 rounded-xl border-2 border-teal-500 bg-teal-50 text-teal-900 text-center font-bold">
                    B) 4 portions ✓
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 text-center hover:bg-purple-50 cursor-pointer">
                    C) 6 portions
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 text-center hover:bg-purple-50 cursor-pointer">
                    D) 3 portions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= XP AND REWARDS SECTION ================= */}
      <section id="gamification" className="py-20 bg-gradient-to-b from-slate-50 to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <Badge variant="yellow">Gamified Motivation</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Turn Practice into Play with XP & Rewards
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Every lesson, quiz attempt, and solved problem yields XP points that level up your student character.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 fill-amber-500 text-amber-500" />
              </div>
              <h4 className="font-bold text-slate-800">Earn XP Points</h4>
              <p className="text-xs text-slate-500">Collect XP on each completed practice mission.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7 text-purple-600" />
              </div>
              <h4 className="font-bold text-slate-800">Level Progression</h4>
              <p className="text-xs text-slate-500">Climb from Novice Number Cadet to Master Mathematician.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <Award className="w-7 h-7 text-teal-600" />
              </div>
              <h4 className="font-bold text-slate-800">Curriculum Badges</h4>
              <p className="text-xs text-slate-500">Unlock Georgia Standard achievement badges on milestone completions.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <Zap className="w-7 h-7 text-sky-600" />
              </div>
              <h4 className="font-bold text-slate-800">Streak Motivation</h4>
              <p className="text-xs text-slate-500">Build daily learning momentum with consistent practice habits.</p>
            </div>
          </div>

          <div className="pt-6">
            <Link to="/register">
              <Button variant="playful" size="xl" className="gap-3 text-lg">
                <Sparkles className="w-5 h-5" />
                Start Your First Quest Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
