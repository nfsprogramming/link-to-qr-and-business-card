
import { useParams, useNavigate } from 'react-router-dom';
import { type CardData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MousePointer2, Smartphone, Monitor, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock data generator for charts
const generateData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        name: day,
        views: Math.floor(Math.random() * 50) + 10,
        clicks: Math.floor(Math.random() * 20) + 5,
    }));
};

const deviceData = [
    { name: 'Mobile', value: 65, color: '#0ea5e9' }, // sky-500
    { name: 'Desktop', value: 25, color: '#6366f1' }, // indigo-500
    { name: 'Tablet', value: 10, color: '#a855f7' }, // purple-500
];

export function Analytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState<CardData | null>(null);
    const [totalViews, setTotalViews] = useState(0);

    useEffect(() => {
        if (id) {
            const savedCard = localStorage.getItem(`card-${id}`);
            if (savedCard) {
                setCard(JSON.parse(savedCard));
                // Get real view count if available
                const views = localStorage.getItem(`stats-views-${id}`);
                setTotalViews(views ? parseInt(views) : 124); // fallback to mock if 0
            }
        }
    }, [id]);

    if (!card) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <header className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Analytics for {card.fullName}</h1>
                        <p className="text-slate-400">Track engagement and audience insights.</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 border border-slate-700">
                        Last 7 Days
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger-fade">
                {[
                    { label: 'Total Views', value: totalViews, change: '+12%', icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                    { label: 'Link Clicks', value: Math.floor(totalViews * 0.4), change: '+5%', icon: MousePointer2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Unique Visitors', value: Math.floor(totalViews * 0.8), change: '+8%', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Avg. Time', value: '1m 45s', change: '-2%', icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>

                {/* Main Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-6">Engagement Overview</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={generateData()}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-6">Device Breakdown</h3>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deviceData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={60} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Smartphone size={14} className="text-sky-500" /> Mobile
                        </div>
                        <div className="flex items-center gap-2">
                            <Monitor size={14} className="text-indigo-500" /> Desktop
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
