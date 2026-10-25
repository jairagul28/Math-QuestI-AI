import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Logo = ({ size = 'md', className }) => {
  const isLarge = size === 'lg';

  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5 group select-none', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-400 text-white shadow-md group-hover:scale-105 transition-transform duration-200',
        isLarge ? 'w-12 h-12 rounded-3xl' : 'w-10 h-10'
      )}>
        <span className={cn('font-black font-fredoka', isLarge ? 'text-2xl' : 'text-xl')}>π</span>
        <Sparkles className={cn('absolute -top-1 -right-1 text-amber-300 fill-amber-300 animate-pulse', isLarge ? 'w-5 h-5' : 'w-4 h-4')} />
      </div>
      <div className="flex flex-col">
        <span className={cn(
          'font-extrabold tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors',
          isLarge ? 'text-2xl' : 'text-xl'
        )}>
          Math<span className="text-purple-600">Quest</span>{' '}
          <span className="bg-gradient-to-r from-teal-500 to-sky-500 bg-clip-text text-transparent font-black">AI</span>
        </span>
        {isLarge && (
          <span className="text-xs font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
            Grades 5 & 6
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;

