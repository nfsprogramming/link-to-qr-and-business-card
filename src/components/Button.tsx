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
            primary: 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white shadow-lg shadow-sky-500/20',
            secondary: 'bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-100',
            outline: 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-100 bg-transparent',
        };

        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-5 py-2.5 text-base',
            lg: 'px-8 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={twMerge(
                    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : null}
                {children}
            </button>
        );
    }
);
