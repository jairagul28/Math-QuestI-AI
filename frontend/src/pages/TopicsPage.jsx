import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  Compass,
  BookOpen,
  ArrowRight,
  Sparkles,
  PieChart,
  Binary,
  Scale,
  Shapes,
  Box,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { getDifficultyColor } from '../utils/formatters';

export const TopicsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGrade = searchParams.get('grade') ? Number(searchParams.get('grade')) : null;

  const [selectedGrade, setSelectedGrade] = useState(initialGrade); // null = all, 5 = grade 5, 6 = grade 6
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (selectedGrade) params.grade = selectedGrade;
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

        const res = await topicsAPI.getTopics(params);
        if (res.data && res.data.data) {
          setTopics(res.data.data);
        }
      } catch (err) {
        console.error('[TopicsPage] Failed to fetch topics:', err);
        setError('Could not load math topics from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedGrade, selectedCategory]);

  const handleGradeFilter = (grade) => {
    setSelectedGrade(grade);
    setSelectedCategory('All');
    if (grade) {
      setSearchParams({ grade: grade.toString() });
    } else {
      setSearchParams({});
    }
  };

  const categories = ['All', 'Fractions', 'Decimals', 'Ratios & Proportions', 'Geometry'];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="teal" className="text-xs uppercase tracking-wider">
          Georgia Mathematics Standards (GSE & K-12)
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Math Quests
        </h1>
        <p className="text-base text-slate-600 font-medium leading-relaxed">
          Select your grade path below. Each topic is mapped to official Georgia state standards with dedicated difficulty ratings and progress tracking.
        </p>
      </div>

      {/* Grade Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => handleGradeFilter(null)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedGrade === null
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Grades
          </button>
          <button
            onClick={() => handleGradeFilter(5)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedGrade === 5
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grade 5 Curriculum
          </button>
          <button
            onClick={() => handleGradeFilter(6)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedGrade === 6
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grade 6 Curriculum
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            // Hide Ratios from Grade 5 view to satisfy "Do not imply every topic applies equally to both grades"
            if (selectedGrade === 5 && cat === 'Ratios & Proportions') return null;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200/80 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">{error}</h3>
          <Button variant="playful" size="sm" onClick={() => setSelectedGrade(null)}>
            Reset Filters
          </Button>
        </div>
      ) : topics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No math topics found</h3>
          <p className="text-xs text-slate-500">Try choosing a different grade or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card
              key={topic._id}
              className="border-2 border-slate-100 hover:border-purple-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <CardContent className="p-6 space-y-5">
                {/* Card Top Header */}
                <div className="flex items-center justify-between">
                  <Badge variant={topic.grade === 5 ? 'default' : 'teal'}>
                    Grade {topic.grade}
                  </Badge>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    Standard {topic.standardCode}
                  </span>
                </div>

                {/* Topic Info */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                    {topic.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                {/* Standards Description Box */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Georgia Standard Focus
                  </span>
                  <p className="text-xs text-slate-700 italic line-clamp-2">
                    "{topic.standardDescription}"
                  </p>
                </div>

                {/* Difficulty & Time */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{topic.estimatedMinutes} mins
                  </span>
                </div>

                {/* Card CTA */}
                <div className="pt-3 border-t border-slate-100">
                  <Link to={`/topics/${topic._id}`} className="block w-full">
                    <Button
                      variant={topic.grade === 5 ? 'playful' : 'accent'}
                      size="md"
                      className="w-full gap-2 justify-center"
                    >
                      <span>Start Learning</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsPage;

