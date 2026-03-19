import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        // Classes for different variants
        const variantClasses = {
            primary: 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-[0.98] text-white shadow-xl shadow-sky-500/20 border border-white/10',
            secondary: 'bg-white/5 hover:bg-white/10 active:scale-[0.98] text-white border border-white/5 backdrop-blur-md',
            outline: 'border-2 border-slate-700 hover:border-sky-500/50 text-slate-400 hover:text-white bg-transparent active:scale-[0.98]',
        };

        const sizeClasses = {
            sm: 'px-4 py-2 text-xs font-black uppercase tracking-widest',
            md: 'px-6 py-3 text-sm font-black uppercase tracking-widest',
            lg: 'px-10 py-4 text-base font-black uppercase tracking-widest',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={twMerge(
                    "inline-flex items-center justify-center gap-2 rounded-2xl transition-all duration-300",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100",
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {children}
            </button>
        );
    }
);
