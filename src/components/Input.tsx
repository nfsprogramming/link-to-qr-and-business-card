import React from 'react';

import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-3 w-full group/input">
                {label && (
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within/input:text-sky-400 transition-colors ml-1">
                        {label}
                    </label>
                )}
                <input
                    className={twMerge(
                        "w-full px-5 py-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl",
                        "text-white placeholder:text-slate-600 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50",
                        "transition-all duration-300 shadow-inner",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
