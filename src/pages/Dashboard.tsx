
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Edit, Trash2, Smartphone, ExternalLink, Share2, QrCode, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShareModal } from '../components/card/ShareModal';
import { type CardData } from '../types';
import { getUserCardsFromFirebase, deleteCardFromFirebase } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

// Helper function to enrich cards with stats
const enrichCardWithStats = (card: any) => ({
    ...card,
    title: card.fullName || 'Untitled Card',
    views: card.views || 0,
    clicks: Math.floor((card.views || 0) * 0.4), // Mock clicks
    lastActive: 'Just now', // Mock time
});

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

                // Enrich with stats
                const enrichedCards = firebaseCards.map(enrichCardWithStats);

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
            const enrichedCards = firebaseCards.map(enrichCardWithStats);
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
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 sm:mb-12 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg">
                        Manage your digital cards and view analytics.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white px-4 py-3 rounded-xl font-medium transition-all touch-manipulation"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <Link
                        to="/editor"
                        className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-5 sm:px-6 py-3 rounded-xl font-medium shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 touch-manipulation"
                    >
                        <Plus size={20} />
                        Create New Card
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400">Loading your cards...</p>
                </div>
            ) : cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-white/5 animate-fade-in">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Smartphone size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No cards yet</h3>
                    <p className="text-slate-500 max-w-sm text-center mb-8">
                        Create your first digital business card and start sharing your profile instantly.
                    </p>
                    <Link
                        to="/editor"
                        className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-medium"
                    >
                        Get Started <ExternalLink size={16} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-stagger-fade">
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            whileHover={{ y: -5 }}
                            className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-sky-500/30 rounded-2xl p-5 sm:p-6 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-purple-500/10">
                                    {card.title.charAt(0)}
                                </div>
                                <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity items-center">
                                    <button
                                        onClick={() => openShareModal(card)}
                                        className="p-2 h-8 w-8 flex items-center justify-center hover:bg-sky-500/10 rounded-lg text-slate-400 hover:text-sky-400 transition-colors touch-manipulation"
                                        title="Share"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                    <Link
                                        to={`/editor/${card.id}`}
                                        className="p-2 h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors touch-manipulation"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteCard(card.id)}
                                        className="p-2 h-8 w-8 flex items-center justify-center hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors touch-manipulation"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 truncate">
                                {card.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">Last active {card.lastActive}</p>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                        <BarChart3 size={12} /> Views
                                    </div>
                                    <div className="text-lg font-bold text-sky-400">{card.views}</div>
                                </div>
                                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                        <ExternalLink size={12} /> Clicks
                                    </div>
                                    <div className="text-lg font-bold text-emerald-400">{card.clicks}</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    to={`/analytics/${card.id}`}
                                    className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors text-center touch-manipulation"
                                >
                                    Analytics
                                </Link>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => openShareModal(card)}
                                        className="py-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-medium text-sm transition-colors text-center flex items-center justify-center gap-2 touch-manipulation"
                                        title="Show QR Code"
                                    >
                                        <QrCode size={16} />
                                        <span>QR</span>
                                    </button>
                                    <Link
                                        to={`/card/${card.id}`}
                                        className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-sm transition-colors text-center flex items-center justify-center gap-2 touch-manipulation"
                                        title="View Public Card"
                                    >
                                        <ExternalLink size={16} />
                                        <span>View</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <ShareModal
                card={selectedCard}
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
            />
        </div>
    );
}
