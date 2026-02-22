
import { type CardData } from '../../types';
import { CardContent } from './CardContent';

interface PhonePreviewProps {
    data: CardData;
}

export function PhonePreview({ data }: PhonePreviewProps) {
    // We need to pass the styles down or replicate the container logic.
    // Actually CardContent handles styles internally for the content.
    // We just need the frame.


    return (
        <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden select-none ring-4 ring-slate-800/50">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-3xl z-50 pointer-events-none flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-sky-500/50 rounded-full blur-[1px] absolute right-4" />
            </div>

            {/* Screen Content */}
            <div className="w-full h-full overflow-y-auto no-scrollbar relative bg-slate-950">
                <CardContent data={data} isPreview={true} />
            </div>

            {/* Hardware buttons */}
            <div className="absolute top-24 -left-2 w-0.5 h-12 bg-slate-700 rounded-r-lg z-50" />
            <div className="absolute top-40 -left-2 w-0.5 h-12 bg-slate-700 rounded-r-lg z-50" />
            <div className="absolute top-32 -right-2 w-0.5 h-20 bg-slate-700 rounded-l-lg z-50" />

            {/* Glossy overlay for phone effect */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] bg-gradient-to-tr from-white/5 to-transparent z-40" />
        </div>
    );
}
