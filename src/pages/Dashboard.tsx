
import { Link } from 'react-router-dom';
import { Plus, Trash2, Smartphone, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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

const markCardAsLocallyDeleted = (id: string) => {
    try {
        const deleted = getLocallyDeletedCards();
        if (!deleted.includes(id)) {
            deleted.push(id);
            localStorage.setItem('locally-deleted-cards', JSON.stringify(deleted));
        }
    } catch (e) {
        console.error('Failed to save to locally deleted list', e);
    }
};

export function Dashboard() {
    const [cards, setCards] = useState<any[]>([]);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
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
        const loadedCards = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('card-')) {
                try {
                    const card = JSON.parse(localStorage.getItem(key) || '{}');
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

    const deleteCard = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                // Optimistically update UI first
                setCards(cards.filter(c => c.id !== id));

                // Delete from Firebase
                await deleteCardFromFirebase(id);

                // Delete from localStorage
                localStorage.removeItem(`card-${id}`);
                localStorage.removeItem(`stats-views-${id}`);

                console.log('Card deleted successfully:', id);
            } catch (error: any) {
                console.error('Failed to delete card:', error);

                // Check if it's a permission error or if the document might not exist/belong to user
                const isPermissionError = error?.code === 'permission-denied';

                // If the delete failed on the server (for ANY reason - permission, network, or it doesn't exist there),
                // we should offer the user a way to remove it from their local view.

                const confirmMessage = isPermissionError
                    ? 'Permission denied on server. The card might belong to another account. Do you want to remove it from your dashboard anyway?'
                    : `Failed to delete from cloud (${error?.code || 'Error'}). Do you want to remove this card from your local dashboard?`;

                if (window.confirm(confirmMessage)) {
                    // User chose to force remove locally
                    localStorage.removeItem(`card-${id}`);
                    localStorage.removeItem(`stats-views-${id}`);
                    markCardAsLocallyDeleted(id);
                    console.log('Force removed locally');
                    // We keep the optimistic update (card is already removed from state), so no need to do anything else.
                    return;
                }

                // If user said NO to local delete, we must restore the card to the UI
                await handleRefresh();

                if (!isPermissionError) {
                    alert('Action cancelled. Card was not deleted.');
                }
            }
        }
    };

    return (
        <div className="auto-container">

            <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 pt-6 mb-10 animate-fade-in-up">
                <div>
                    <h1 className="fluid-h1 text-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 fluid-text">
                        {cards.length} {cards.length === 1 ? 'card' : 'cards'} active
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={() => {
                            handleRefresh();
                            triggerHapticSelection();
                        }}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-white/5"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <Link
                        to="/editor"
                        onClick={() => triggerHapticSelection()}
                        className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-sky-500/20 transition-all"
                    >
                        <Plus size={18} />
                        <span>Create Card</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <div className="w-12 h-12 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                </div>
            ) : cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 animate-fade-in">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6">
                        <Smartphone size={28} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No cards yet</h3>
                    <p className="text-slate-500 max-w-sm text-center mb-8 text-sm">
                        Design your digital card and share it anywhere.
                    </p>
                    <Link
                        to="/editor"
                        className="bg-sky-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-400 transition-colors"
                    >
                        Create My First Card
                    </Link>
                </div>
            ) : (
                <div className="auto-grid-tight animate-stagger-fade">
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            className="group bg-slate-900/40 border border-white/5 hover:border-sky-500/50 rounded-2xl p-4 transition-all hover:bg-slate-900/60"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {card.title.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-white truncate">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-500">Active {card.lastActive}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-white/5 p-2 rounded-lg">
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Views</div>
                                    <div className="text-base font-bold text-sky-400">{card.views}</div>
                                </div>
                                <div className="bg-white/5 p-2 rounded-lg">
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Clicks</div>
                                    <div className="text-base font-bold text-emerald-400">{card.clicks}</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/editor/${card.id}`}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-xs font-bold text-center transition-colors"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => openShareModal(card)}
                                    className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 py-2.5 rounded-lg text-xs font-bold border border-sky-500/20 transition-colors"
                                >
                                    Share
                                </button>
                                <button
                                    onClick={() => deleteCard(card.id)}
                                    className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-lg transition-colors border border-red-500/10"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <Link
                                to={`/analytics/${card.id}`}
                                className="mt-2 block w-full py-2 text-center text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                            >
                                View Detailed Stats
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
        </div >
    );
}
