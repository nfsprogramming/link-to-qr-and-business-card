import React from 'react';

import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-2 w-full">
                {label && (
                    <label className="text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <input
                    className={twMerge(
                        "w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg",
                        "text-slate-100 placeholder:text-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent",
                        "transition-all duration-200",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
