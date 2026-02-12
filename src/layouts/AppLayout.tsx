
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Zap, Menu, X, ScanLine, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30 overflow-x-hidden">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white group-hover:scale-105 transition-transform duration-300">
                            <Sparkles size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            SmartShare
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={16} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-underline"
                                            className="absolute bottom-[-21px] left-0 right-0 h-[2px] bg-sky-500"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl md:hidden pt-20 px-4"
                    >
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 p-4 rounded-xl text-lg font-medium touch-manipulation ${location.pathname === item.path
                                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                        : 'text-slate-400 hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-3 p-4 rounded-xl text-lg font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors touch-manipulation"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="relative z-10 pt-24 pb-12 min-h-[calc(100vh-80px)]">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm relative z-10 bg-slate-950">
                <p>© {new Date().getFullYear()} SmartShare. Built for the future.</p>
            </footer>
        </div>
    );
}
