
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CardContent } from '../components/card/CardContent';
import { type CardData } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

import { getCardFromFirebase, updateCardViews } from '../utils/firebase';

export function PublicCard() {
    const { id } = useParams();
    const [data, setData] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCard = async () => {
            if (!id) return;
            try {
                const card = await getCardFromFirebase(id);
                if (card) {
                    setData(card as CardData);
                    // Track View in Background
                    updateCardViews(id);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-500">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Card Not Found</h1>
                <p className="max-w-md mb-8">
                    The digital card you are looking for does not exist or has been removed.
                </p>
                <Link to="/" className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium transition-colors">
                    Create Your Own Card
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <CardContent data={data} />
        </div>
    );
}

