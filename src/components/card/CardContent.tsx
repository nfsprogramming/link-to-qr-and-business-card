
import { type CardData } from '../../types';
import { Icon } from '../ui/Icon';
import { motion } from 'framer-motion';

interface CardContentProps {
    data: CardData;
    isPreview?: boolean;
}

export function CardContent({ data, isPreview = false }: CardContentProps) {
    if (isPreview) { } // Suppress unused warning
    const { theme } = data;
    const getContainerStyle = () => {
        switch (theme.style) {
            case 'glass':
                return 'bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white';
            case 'neon':
                return 'bg-slate-950 text-purple-100';
            case 'modern':
                return 'bg-slate-50 text-slate-900';
            default:
                return 'bg-white text-slate-800'; // classic
        }
    };

    const getButtonStyle = () => {
        switch (theme.style) {
            case 'glass':
                return 'bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md';
            case 'neon':
                return 'bg-slate-900 hover:bg-slate-800 border border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all';
            case 'modern':
                return 'bg-white hover:bg-gray-50 text-slate-900 shadow-sm border border-gray-100';
            default:
                return 'bg-gray-100 hover:bg-gray-200 text-gray-800';
        }
    };

    // Dynamic background for Glass/Neon
    const renderBackground = () => {
        if (theme.style === 'glass') {
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>
            );
        }
        if (theme.style === 'neon') {
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={`relative w-full min-h-full flex flex-col items-center px-6 py-12 ${getContainerStyle()}`}
            style={{
                fontFamily: theme.fontFamily,
            }}
        >
            {renderBackground()}

            {/* Content wrapper z-index 10 to sit above background */}
            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">

                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className={`w-32 h-32 rounded-full overflow-hidden mb-6 border-4 shadow-xl ${theme.style === 'neon' ? 'border-purple-500 shadow-purple-500/50' : 'border-white/20'
                        }`}
                >
                    <img
                        src={data.avatarUrl}
                        alt={data.fullName}
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Info */}
                <div className="text-center mb-10 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{data.fullName}</h1>
                    <p className={`text-base font-medium mb-4 uppercase tracking-wider ${theme.style === 'neon' ? 'text-purple-300' : 'opacity-80'}`}>
                        {data.jobTitle}
                    </p>
                    <p className="text-sm opacity-70 max-w-[280px] mx-auto leading-relaxed">
                        {data.bio}
                    </p>
                </div>

                {/* Links */}
                <div className="w-full flex flex-col gap-4 animate-stagger-fade">
                    {data.links.filter(l => l.active).map((link, i) => {
                        const isUrl = link.url.startsWith('http') || link.url.startsWith('https');
                        const isMail = link.url.startsWith('mailto:');
                        const isTel = link.url.startsWith('tel:');
                        const isLink = isUrl || isMail || isTel;

                        // Function to handle smart action
                        const handleClick = (e: React.MouseEvent) => {
                            if (!isLink) {
                                e.preventDefault();
                                navigator.clipboard.writeText(link.url);
                                alert('Copied to clipboard: ' + link.url);
                            }
                        };

                        return (
                            <motion.a
                                key={link.id}
                                href={isLink ? link.url : '#'}
                                onClick={handleClick}
                                target={isUrl ? "_blank" : undefined}
                                rel={isUrl ? "noopener noreferrer" : undefined}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full p-4 rounded-xl flex items-center gap-4 group cursor-pointer ${getButtonStyle()}`}
                            >
                                <div className={`p-2.5 rounded-lg ${theme.style === 'neon' ? 'bg-purple-500/20 text-purple-300' : 'bg-black/5'}`}>
                                    <Icon name={link.icon} size={22} />
                                </div>
                                <span className="font-semibold text-base flex-1">{link.title}</span>
                                {!isLink && (
                                    <span className="text-xs opacity-50 uppercase font-bold tracking-wider">Copy</span>
                                )}
                            </motion.a>
                        );
                    })}
                </div>

                {/* Footer */}
                <footer className="mt-16 opacity-40 text-xs font-medium flex flex-col items-center gap-2">
                    <div className="w-8 h-1 bg-current rounded-full opacity-20 mb-2" />
                    <p>Powered by <span className="font-bold">SmartShare</span></p>
                </footer>

            </div>
        </div>
    );
}
