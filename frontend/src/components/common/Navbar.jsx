import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import XPProgressChip from './XPProgressChip';
import ThemeToggle from './ThemeToggle';
import { useAvatarRewards } from '../../hooks/useAvatarRewards';
import { Menu, X, LogOut, LayoutDashboard, Compass, Sparkles, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const avatarRewards = useAvatarRewards();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      setTimeout(() => {
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const elem = document.getElementById(id);
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors cursor-pointer"
            >
              Curriculum & Grades
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('gamification')}
              className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors cursor-pointer"
            >
              XP & Rewards
            </button>
            <Link
              to="/topics"
              className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-teal-500" />
              Explore Topics
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <XPProgressChip
                  totalXP={user?.totalXP || 0}
                  avatarId={avatarRewards?.equippedAvatar}
                  accessoryId={avatarRewards?.equippedAccessory}
                />
                <Badge variant="teal" className="py-1.5 px-3">
                  Grade {user?.grade}
                </Badge>
                <Link to="/dashboard">
                  <Button variant="playful" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="playful" size="md" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Learning
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <XPProgressChip
                totalXP={user?.totalXP || 0}
                compact
                avatarId={avatarRewards?.equippedAvatar}
                accessoryId={avatarRewards?.equippedAccessory}
              />
            )}
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
            <button
              onClick={() => scrollToSection('features')}
              className="text-left font-bold text-slate-700 hover:text-purple-600 py-2 px-3 rounded-xl hover:bg-purple-50 transition-colors"
            >
              Curriculum & Grades
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left font-bold text-slate-700 hover:text-purple-600 py-2 px-3 rounded-xl hover:bg-purple-50 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('gamification')}
              className="text-left font-bold text-slate-700 hover:text-purple-600 py-2 px-3 rounded-xl hover:bg-purple-50 transition-colors"
            >
              XP & Rewards
            </button>
            <Link
              to="/topics"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-purple-600 py-2 px-3 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <Compass className="w-4 h-4 text-teal-500" />
              Explore Topics
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block"
                >
                  <Button variant="playful" size="md" className="w-full gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Student Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleLogout}
                  className="w-full text-rose-600 hover:bg-rose-50 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out ({user?.name})
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full block">
                  <Button variant="secondary" size="md" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full block">
                  <Button variant="playful" size="md" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Learning Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
