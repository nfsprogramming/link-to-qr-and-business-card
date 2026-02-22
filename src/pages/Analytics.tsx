import { useParams } from 'react-router-dom';
import { type CardData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Users, MousePointer2, Globe, Monitor } from 'lucide-react';
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
    const [card, setCard] = useState<CardData | null>(null);
    const [totalViews, setTotalViews] = useState(0);

    useEffect(() => {
        if (id) {
            const savedCard = localStorage.getItem(`card-${id}`);
            if (savedCard) {
                setCard(JSON.parse(savedCard));
                const views = localStorage.getItem(`stats-views-${id}`);
                setTotalViews(views ? parseInt(views) : 124);
            }
        }
    }, [id]);

    if (!card) return null;

    const stats = [
        { label: 'Total Views', value: totalViews, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { label: 'Link Clicks', value: Math.floor(totalViews * 0.4), icon: MousePointer2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Unique Visits', value: Math.floor(totalViews * 0.8), icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Avg. Time', value: '1m 45s', icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="auto-container py-8 animate-fade-in">
            <header className="mb-10">
                <h1 className="fluid-h1 text-white mb-2">
                    Analytics
                </h1>
                <p className="text-slate-500 fluid-text">
                    Performance for {card.fullName}
                </p>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl shadow-lg">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-lg shadow-current/5`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-8">Engagement</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={generateData()}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={3} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-8">Devices</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deviceData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={70} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
