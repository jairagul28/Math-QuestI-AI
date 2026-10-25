import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import XPProgressChip from '../common/XPProgressChip';
import { AVATAR_EMOJI, ACCESSORY_EMOJI } from '../../utils/rewardCatalog';
import { useAvatarRewards } from '../../hooks/useAvatarRewards';
import {
  LayoutDashboard,
  Compass,
  Trophy,
  Award,
  LogOut,
  Sparkles,
  BookOpen,
  Menu,
  X,
  User,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const avatarRewards = useAvatarRewards();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      label: 'Mission Control',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: `Grade ${user?.grade || 5} Quests`,
      path: `/topics?grade=${user?.grade || 5}`,
      icon: Compass,
    },
    {
      label: 'All Topics',
      path: '/topics',
      icon: BookOpen,
    },
    {
      label: 'Daily Challenges',
      path: '/dashboard/challenges',
      icon: Sparkles,
    },
    {
      label: 'Trophy Room',
      path: '/dashboard/rewards',
      icon: Trophy,
    },
    {
      label: 'Avatar Workshop',
      path: '/dashboard/avatars',
      icon: User,
    },
    {
      label: 'Leaderboard',
      path: '/dashboard/leaderboard',
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <XPProgressChip
            totalXP={user?.totalXP || 0}
            compact
            avatarId={avatarRewards?.equippedAvatar}
            accessoryId={avatarRewards?.equippedAccessory}
          />
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Mini Profile */}
        <div className="p-5 mx-4 my-4 rounded-3xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-teal-50 border border-purple-100/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
              <span aria-label="Equipped avatar" className="relative text-2xl">
                {AVATAR_EMOJI[avatarRewards?.equippedAvatar] || AVATAR_EMOJI.fox}
                {ACCESSORY_EMOJI[avatarRewards?.equippedAccessory] && (
                  <span className="absolute -right-3 -top-2 text-xs">{ACCESSORY_EMOJI[avatarRewards.equippedAccessory]}</span>
                )}
              </span>
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-slate-900 truncate">{user?.name || 'Student'}</h4>
              <p className="text-xs font-semibold text-purple-700">Level {user?.level || 1} Explorer</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Grade {user?.grade}</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {user?.totalXP || 0} XP
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Learning Pathways
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all',
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 font-bold text-sm hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Welcome, {user?.name || 'Mathematician'}! 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Ready for today's Georgia Standards math challenge?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="teal">Georgia Mathematics Standards</Badge>
            <XPProgressChip
              totalXP={user?.totalXP || 0}
              avatarId={avatarRewards?.equippedAvatar}
              accessoryId={avatarRewards?.equippedAccessory}
            />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
