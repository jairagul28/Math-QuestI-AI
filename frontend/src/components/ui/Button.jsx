import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants = {
      primary:
        'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg active:scale-98',
      playful:
        'bg-purple-600 text-white border-b-4 border-purple-800 hover:bg-purple-500 active:border-b-0 active:translate-y-1 shadow-md',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 shadow-sm active:scale-98',
      accent:
        'bg-teal-500 text-white hover:bg-teal-600 border-b-4 border-teal-700 active:border-b-0 active:translate-y-1 shadow-md',
      yellow:
        'bg-amber-400 text-amber-950 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 shadow-md font-bold',
      outline:
        'border-2 border-purple-600 text-purple-700 hover:bg-purple-50 active:scale-98',
      ghost:
        'text-slate-700 hover:bg-slate-100 active:scale-98',
      danger:
        'bg-rose-500 text-white hover:bg-rose-600 border-b-4 border-rose-700 active:border-b-0 active:translate-y-1',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 rounded-xl',
      md: 'text-sm px-5 py-2.5 rounded-xl',
      lg: 'text-base px-6 py-3.5 rounded-2xl font-bold',
      xl: 'text-lg px-8 py-4 rounded-2xl font-bold',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

