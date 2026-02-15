
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

    // Use environment variable for base URL (works in Android app)
    // Use environment variable for base URL (works in Android app)
    // Remove trailing slash if present to avoid double slashes
    const rawBaseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const baseUrl = rawBaseUrl.replace(/\/$/, '');
    const publicUrl = `${baseUrl}/card/${card.id}`;

    const isLocalhost = publicUrl.includes('localhost') || publicUrl.includes('127.0.0.1');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Card">
            <div className="flex flex-col gap-6 items-center">
                <p className="text-slate-400 text-center text-sm">
                    Scan this QR code to visit <span className="text-white font-medium">{card.fullName}</span>'s profile.
                </p>

                <QRCodeCard value={publicUrl} />

                {isLocalhost && (
                    <div className="text-amber-400 text-xs text-center bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 max-w-xs">
                        ⚠️ You are on localhost. This QR code will not work on other devices (like your phone) unless they are on the same network and use your IP address.
                    </div>
                )}

                <div className="w-full flex items-center bg-slate-950 border border-slate-800 rounded-lg p-3 gap-2">
                    <div className="flex-1 text-slate-400 truncate text-sm px-2 font-mono">
                        {publicUrl}
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(publicUrl);
                            alert('Link copied to clipboard!');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </Modal>
    );
}
