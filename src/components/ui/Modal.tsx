
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { App } from '@capacitor/app';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        let listener: any = null;

        const setupListener = async () => {
            if (isOpen) {
                listener = await App.addListener('backButton', () => {
                    onClose();
                });
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        setupListener();
        window.addEventListener('keydown', handleEsc);

        return () => {
            if (listener) listener.remove();
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[100] transition-opacity"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none p-4" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col max-h-[90vh] m-4 relative overflow-hidden"
                        >
                            {/* Subtle Inner Glow */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 pb-2 border-b border-white/5 relative z-10">
                                <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar relative z-10">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
