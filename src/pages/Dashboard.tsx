
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Edit, Trash2, Smartphone, ExternalLink, Share2, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShareModal } from '../components/card/ShareModal';
import { type CardData } from '../types';

export function Dashboard() {
    const [cards, setCards] = useState<any[]>([]);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

    useEffect(() => {
        const loadedCards = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('card-')) {
                try {
                    const card = JSON.parse(localStorage.getItem(key) || '{}');
                    // enrich with stats
                    const viewsStr = localStorage.getItem(`stats-views-${card.id}`) || '0';
                    const views = parseInt(viewsStr);

                    loadedCards.push({
                        ...card,
                        title: card.fullName || 'Untitled Card',
                        views: views,
                        clicks: Math.floor(views * 0.4), // Mock clicks
                        lastActive: 'Just now', // Mock time
                    });
                } catch (e) {
                    console.error('Failed to parse card', key);
                }
            }
        }
        setCards(loadedCards);
    }, []);

    const deleteCard = (id: string) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            localStorage.removeItem(`card-${id}`);
            // Also clean up stats
            localStorage.removeItem(`stats-views-${id}`);
            setCards(cards.filter(c => c.id !== id));
        }
    };

    const openShareModal = (card: CardData) => {
        setSelectedCard(card);
        setShareModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Manage your digital cards and view analytics.
                    </p>
                </div>
                <Link
                    to="/editor"
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Create New Card
                </Link>
            </div>

            {cards.length === 0 ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-fade">
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            whileHover={{ y: -5 }}
                            className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-sky-500/30 rounded-2xl p-6 transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/10">
                                    {card.title.charAt(0)}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openShareModal(card)}
                                        className="p-2 hover:bg-sky-500/10 rounded-lg text-slate-400 hover:text-sky-400 transition-colors"
                                        title="Share"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                    <Link
                                        to={`/editor/${card.id}`}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteCard(card.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2 truncate">
                                {card.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Last active {card.lastActive}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
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

                            <div className="flex gap-3">
                                <Link
                                    to={`/analytics/${card.id}`}
                                    className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors text-center"
                                >
                                    Analytics
                                </Link>
                                <div className="flex-1 flex gap-2">
                                    <button
                                        onClick={() => openShareModal(card)}
                                        className="flex-1 py-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-medium text-sm transition-colors text-center flex items-center justify-center"
                                        title="Show QR Code"
                                    >
                                        <QrCode size={18} />
                                    </button>
                                    <Link
                                        to={`/card/${card.id}`}
                                        className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-sm transition-colors text-center flex items-center justify-center"
                                        title="View Public Card"
                                    >
                                        <ExternalLink size={18} />
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
