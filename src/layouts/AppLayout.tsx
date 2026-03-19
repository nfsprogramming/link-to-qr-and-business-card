
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Zap, ScanLine, LogOut, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { triggerHapticSelection } from '../utils/capacitor';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Quick QR', path: '/quick-qr', icon: Zap },
        { name: 'Scanner', path: '/scan', icon: ScanLine },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30 overflow-x-hidden flex flex-col">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>


            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-3xl border-b border-white/5 shadow-2xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
                <div className="auto-container h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Page Back Button (Visible on mobile for internal pages) */}
                        {location.pathname !== '/' && location.pathname !== '/login' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors touch-manipulation"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        )}

                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-1 rounded-lg bg-white/10 group-hover:scale-105 transition-all border border-white/5">
                                <img src="/favicon.png" alt="Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">
                                NFS Programming
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative py-5 text-sm font-semibold transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon size={16} />
                                        {item.name}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-underline"
                                            className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-sky-500 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors py-5"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </nav>

                    {/* Mobile Logout (Header) */}
                    <button
                        onClick={handleLogout}
                        className="md:hidden p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Redundant mobile menu removed for bottom nav cleanliness */}

            {/* Main Content */}
            <main
                className="relative flex-1 flex flex-col"
                style={{
                    paddingTop: 'clamp(8rem, 8rem + env(safe-area-inset-top), 12rem)',
                    paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))'
                }}
            >
                {children}
            </main>

            {/* Footer - Only visible on desktop or large screens */}
            <footer className="hidden md:block border-t border-white/5 py-10 text-center relative z-10 bg-slate-950 mt-auto">
                <div className="auto-container">
                    <p className="text-slate-500 fluid-text">
                        © {new Date().getFullYear()} <span className="text-slate-300 font-bold">NFS Programming</span>. Built for the future.
                    </p>
                </div>
            </footer>

            {/* Bottom Nav - Native App Style for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/60 backdrop-blur-3xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-3 h-20">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => triggerHapticSelection()}
                                className="flex flex-col items-center justify-center gap-1 group relative touch-manipulation"
                            >
                                <div className={`p-1 rounded-lg transition-all duration-300 ${isActive ? 'text-sky-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-sky-400' : 'text-slate-500'}`}>
                                    {item.name.split(' ')[0]}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-indicator"
                                        className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-sky-500 rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
