
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
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const publicUrl = `${baseUrl}/card/${card.id}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Card">
            <div className="flex flex-col gap-6 items-center">
                <p className="text-slate-400 text-center text-sm">
                    Scan this QR code to visit <span className="text-white font-medium">{card.fullName}</span>'s profile.
                </p>

                <QRCodeCard value={publicUrl} />

                <div className="w-full flex items-center bg-slate-950 border border-slate-800 rounded-lg p-3 gap-2">
                    <div className="flex-1 text-slate-400 truncate text-sm px-2">
                        {publicUrl}
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(publicUrl)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </Modal>
    );
}
