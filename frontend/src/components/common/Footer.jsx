import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Heart, Compass, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white/10 inline-block p-2 rounded-2xl">
              <Logo />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering Grade 5 & 6 students with gamified mathematical mastery and interactive AI learning adventures.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Georgia Mathematics Standards Aligned
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Curriculum</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/topics?grade=5" className="hover:text-purple-400 transition-colors">
                  Grade 5 Standards (5.NR, 5.GSR)
                </Link>
              </li>
              <li>
                <Link to="/topics?grade=6" className="hover:text-purple-400 transition-colors">
                  Grade 6 Standards (6.NR, 6.GSR)
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-purple-400 transition-colors">
                  Fractions & Decimals Quest
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-purple-400 transition-colors">
                  Ratios & Proportions
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-purple-400 transition-colors">
                  Geometry & Space
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-purple-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-purple-400 transition-colors">
                  All Topics
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-purple-400 transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-purple-400 transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Mission */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed with playful pedagogy to spark genuine math confidence, visual problem-solving, and zero-fear learning for elementary and middle school students.
            </p>
            <div className="pt-2">
              <Link to="/register">
                <button className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl shadow transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  Join the Math Quest
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MathQuest AI. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for young mathematicians</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

