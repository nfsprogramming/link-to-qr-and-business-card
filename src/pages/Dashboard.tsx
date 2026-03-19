
import { Link } from 'react-router-dom';
import { Plus, Trash2, Smartphone, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { ShareModal } from '../components/card/ShareModal';
import { type CardData } from '../types';
import { getUserCardsFromFirebase, deleteCardFromFirebase } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { triggerHapticSelection } from '../utils/capacitor';

// Helper function to enrich cards with stats
const enrichCardWithStats = (card: any) => ({
    ...card,
    title: card.fullName || 'Untitled Card',
    views: card.views || 0,
    clicks: Math.floor((card.views || 0) * 0.4), // Mock clicks
    lastActive: 'Just now', // Mock time
});

// Helper functions for persisting force-deleted cards locally
const getLocallyDeletedCards = (): string[] => {
    try {
        const deleted = localStorage.getItem('locally-deleted-cards');
        return deleted ? JSON.parse(deleted) : [];
    } catch {
        return [];
    }
};


export function Dashboard() {
    const [cards, setCards] = useState<any[]>([]);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadCards = async () => {
            if (!user) {
                setCards([]);
                setLoading(false);
                return;
            }

            try {
                // Load cards from Firebase
                const firebaseCards = await getUserCardsFromFirebase();

                // Get list of cards the user has force-deleted locally
                const locallyDeleted = getLocallyDeletedCards();

                // Enrich with stats and filter out locally deleted ones
                const enrichedCards = firebaseCards
                    .filter((card: any) => !locallyDeleted.includes(card.id))
                    .map(enrichCardWithStats);

                setCards(enrichedCards);

                // Also sync to localStorage for offline access
                enrichedCards.forEach(card => {
                    localStorage.setItem(`card-${card.id}`, JSON.stringify(card));
                });
            } catch (error) {
                console.error('Failed to load cards:', error);
                // Fallback to localStorage if Firebase fails
                loadFromLocalStorage();
            } finally {
                setLoading(false);
            }
        };

        loadCards();
    }, [user]);

    const loadFromLocalStorage = () => {
        const loadedCards: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('card-')) {
                try {
                    const card = JSON.parse(localStorage.getItem(key) || '{}');

                    // Only load if it belongs to current user or has no owner yet
                    if (card.userId && card.userId !== user?.uid) continue;

                    const viewsStr = localStorage.getItem(`stats-views-${card.id}`) || '0';
                    const views = parseInt(viewsStr);

                    loadedCards.push({
                        ...card,
                        title: card.fullName || 'Untitled Card',
                        views: views,
                        clicks: Math.floor(views * 0.4),
                        lastActive: 'Just now',
                    });
                } catch (e) {
                    console.error('Failed to parse card', key);
                }
            }
        }
        setCards(loadedCards);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const firebaseCards = await getUserCardsFromFirebase();
            const locallyDeleted = getLocallyDeletedCards();

            const enrichedCards = firebaseCards
                .filter((card: any) => !locallyDeleted.includes(card.id))
                .map(enrichCardWithStats);

            setCards(enrichedCards);
        } catch (error) {
            console.error('Failed to refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const openShareModal = (card: CardData) => {
        setSelectedCard(card);
        setShareModalOpen(true);
        triggerHapticSelection();
    };

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setCardToDelete(id);
        setDeleteModalOpen(true);
        triggerHapticSelection();
    };

    const handleDelete = async () => {
        if (!cardToDelete || !user) return;

        const id = cardToDelete;
        setIsDeleting(true);

        const previousCards = [...cards];

        try {
            // Optimistically update UI
            setCards(prev => prev.filter(c => c.id !== id));
            setDeleteModalOpen(false);
            setCardToDelete(null);

            // Delete from Firebase (Cloud) with a 10s timeout
            const deletePromise = deleteCardFromFirebase(id);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout: Firebase is taking too long to respond')), 10000)
            );

            await Promise.race([deletePromise, timeoutPromise]);

            // Clean up all local traces
            localStorage.removeItem(`card-${id}`);
            localStorage.removeItem(`stats-views-${id}`);

            const locallyDeleted = getLocallyDeletedCards();
            if (locallyDeleted.includes(id)) {
                localStorage.setItem('locally-deleted-cards', JSON.stringify(locallyDeleted.filter(d => d !== id)));
            }

        } catch (error: any) {
            console.error('[Delete] Firebase deletion FAILED:', error);

            // Rollback UI since server delete failed
            setCards(previousCards);

            let errorMessage = 'Failed to delete from cloud. ';
            if (error?.code === 'permission-denied') {
                errorMessage += 'You do not have permission to delete this card.';
            } else if (error?.code === 'network-request-failed') {
                errorMessage += 'Please check your internet connection.';
            } else {
                errorMessage += `Error: ${error?.message || 'Unknown error'}`;
            }

            alert(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="auto-container">

            <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 pt-10 mb-14 animate-fade-in-up relative z-10">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                            {cards.length} {cards.length === 1 ? 'card' : 'cards'} active • Real-time
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={() => {
                            handleRefresh();
                            triggerHapticSelection();
                        }}
                        disabled={refreshing}
                        className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border border-white/5 backdrop-blur-xl active:scale-95"
                    >
                        <RefreshCw size={16} className={`${refreshing ? 'animate-spin text-sky-400' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span>Refresh Node</span>
                    </button>
                    <Link
                        to="/editor"
                        onClick={() => triggerHapticSelection()}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-6 py-2.5 rounded-2xl text-sm font-black shadow-2xl shadow-sky-500/30 transition-all border border-white/10 active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Create Digital Card</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                        <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-8 text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Data...</p>
                </div>
            ) : cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-white/5 animate-fade-in shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white/5">
                        <Smartphone size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Your Digital Hub is Empty</h3>
                    <p className="text-slate-500 max-w-sm text-center mb-10 text-base leading-relaxed font-medium">
                        Start your digital transformation. Design a cards that leaves a lasting impression.
                    </p>
                    <Link
                        to="/editor"
                        className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl active:scale-95 border border-white"
                    >
                        Create My First Card
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-stagger-fade">
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-white/20 rounded-[2.5rem] p-6 transition-all hover:bg-slate-900/60 shadow-2xl"
                        >
                            {/* Card Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-indigo-500/0 group-hover:from-sky-500/5 group-hover:to-indigo-500/5 transition-all rounded-[2.5rem]" />

                            <div className="relative flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-500/20 group-hover:scale-110 transition-transform duration-500">
                                    {card.title.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-black text-white truncate tracking-tight mb-1">
                                        {card.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{card.lastActive}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden group/stat">
                                    <div className="absolute inset-0 bg-sky-500/0 group-hover/stat:bg-sky-500/5 transition-colors" />
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Total Views</div>
                                    <div className="text-2xl font-black text-white">{card.views}</div>
                                </div>
                                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden group/stat">
                                    <div className="absolute inset-0 bg-emerald-500/0 group-hover/stat:bg-emerald-500/5 transition-colors" />
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Engagements</div>
                                    <div className="text-2xl font-black text-white">{card.clicks}</div>
                                </div>
                            </div>

                            <div className="relative flex gap-2">
                                <Link
                                    to={`/editor/${card.id}`}
                                    className="flex-1 bg-white text-slate-950 py-3 rounded-xl text-xs font-black text-center transition-all hover:bg-slate-100 active:scale-95 shadow-lg"
                                >
                                    EDIT DESIGN
                                </Link>
                                <button
                                    onClick={() => openShareModal(card)}
                                    className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 py-3 rounded-xl text-xs font-black border border-white/5 transition-all active:scale-95 backdrop-blur-md"
                                >
                                    SHARE
                                </button>
                                <button
                                    onClick={(e) => confirmDelete(e, card.id)}
                                    className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl transition-all border border-red-500/10 active:scale-95 backdrop-blur-md"
                                >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                            </div>

                            <Link
                                to={`/analytics/${card.id}`}
                                className="relative mt-4 block w-full py-2.5 text-center text-[10px] font-black text-slate-500 hover:text-sky-400 transition-all uppercase tracking-[0.3em] border border-transparent hover:border-white/5 rounded-xl"
                            >
                                Intelligence View
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}


            {/* Mobile Floating Action Button */}
            <Link
                to="/editor"
                onClick={() => triggerHapticSelection()}
                className="md:hidden fixed bottom-24 right-6 z-40 w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/40 border-4 border-slate-950 active:scale-90 transition-transform animate-fade-in"
                style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom) + 1.5rem)' }}
            >
                <Plus size={32} />
            </Link>

            <ShareModal
                card={selectedCard}
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
            />

            {/* Premium Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModalOpen(false);
                        setCardToDelete(null);
                    }
                }}
                title="Confirm Deletion"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Delete this card?</h3>
                    <p className="text-slate-400 text-sm mb-8 px-4 leading-relaxed">
                        This will permanently remove the card and all its data from the cloud. This action cannot be undone.
                    </p>
                    <div className="flex flex-col gap-3 px-2">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                'Delete Permanently'
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setCardToDelete(null);
                            }}
                            disabled={isDeleting}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
