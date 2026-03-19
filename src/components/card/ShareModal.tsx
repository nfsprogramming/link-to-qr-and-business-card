
import { Modal } from '../ui/Modal';
import { QRCodeCard } from '../QRCodeCard';
import { type CardData } from '../../types';

interface ShareModalProps {
    card: CardData | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareModal({ card, isOpen, onClose }: ShareModalProps) {
    if (!card) return null;

    // Intelligent Base URL Detection
    const currentOrigin = window.location.origin;
    const isLocal = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
    const vercelUrl = 'https://link-to-qr-and-business-card.vercel.app';

    // Prefer env var, then current origin (if not localhost), then hardcoded fallback
    const rawBaseUrl = import.meta.env.VITE_APP_URL || (!isLocal ? currentOrigin : vercelUrl);
    const baseUrl = rawBaseUrl.replace(/\/$/, '');

    // WITH HASH ROUTER: We need to inject /#/ before the route
    const publicUrl = `${baseUrl}/#/card/${card.id}`;

    const isLocalhost = publicUrl.includes('localhost') || publicUrl.includes('127.0.0.1');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Profile">
            <div className="flex flex-col gap-8 items-center justify-center p-2 w-full max-w-full">
                <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">
                        Scan this code to visit
                    </p>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        {card.fullName}
                    </h3>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-4 bg-sky-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-2 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
                        <QRCodeCard value={publicUrl} />
                    </div>
                </div>

                {isLocalhost && (
                    <div className="flex items-center gap-3 text-amber-400 text-[10px] sm:text-xs text-center bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 max-w-xs uppercase font-bold tracking-widest">
                        <span>⚠️ Localhost mode</span>
                    </div>
                )}

                <div className="w-full space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Profile Link</label>
                    <div className="w-full flex items-center bg-slate-950 border border-white/5 rounded-2xl p-2 gap-2 shadow-inner">
                        <div className="flex-1 text-slate-400 truncate text-xs px-3 font-mono">
                            {publicUrl}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(publicUrl);
                                alert('Link copied to clipboard!');
                            }}
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
