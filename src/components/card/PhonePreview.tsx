
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
        <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden select-none">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-50 pointer-events-none" />

            {/* Screen Content - Use a scale if needed to fit? Or scroll */}
            <div className="w-full h-full overflow-y-auto no-scrollbar relative">
                <CardContent data={data} isPreview={true} />
            </div>

            {/* Glossy overlay for phone effect */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] z-40" />
        </div>
    );
}
