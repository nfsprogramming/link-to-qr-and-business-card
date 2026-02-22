
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none p-4" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl pointer-events-auto flex flex-col max-h-[80vh] m-4"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
