
import { useState } from 'react';
import { QRCodeCard } from '../components/QRCodeCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Link2 } from 'lucide-react';


export function QuickQR() {
    const [url, setUrl] = useState('');
    const [qrValue, setQrValue] = useState('https://example.com');

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            setQrValue(url);
        }
    };

    return (
        <div className="auto-container py-12 animate-fade-in relative">
            {/* Premium background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-sky-500/10 rounded-full blur-[140px] animate-pulse-slow" />
                <div className="absolute bottom-[10%] left-[-5%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
                <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="mb-14 relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-6 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    Instant Generation
                </div>
                <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                    Quick QR
                </h1>
                <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                    Transform any URL into a high-performance, scan-ready QR code in seconds. Optimized for mobile and print.
                </p>
            </header>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-center relative z-10">

                {/* Input Section */}
                <div className="lg:col-span-3 bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/20">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3">
                            Link Configuration
                        </h2>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            Paste your destination URL. We'll verify the format and optimize the QR density for maximum scannability.
                        </p>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-10">
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
                            <Input
                                placeholder="https://your-website.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                label="Destination URL"
                                className="relative bg-slate-900/80 border-white/5 py-4 text-lg focus:ring-0 focus:border-sky-500/50"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={!url.trim()} 
                            className="w-full py-5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-sky-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-3 border border-white/10"
                        >
                            <span>Generate Neural QR</span>
                            <Link2 size={24} />
                        </Button>
                    </form>
                    
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <span>High Correction Level (H)</span>
                        <span className="text-sky-500">Auto-Optimized</span>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center w-full">
                    <div className="relative group w-full flex flex-col items-center">
                        {/* Dramatic glow */}
                        <div className="absolute inset-0 bg-sky-500/30 blur-[150px] rounded-full scale-90 group-hover:scale-100 transition-all duration-1000 opacity-40" />
                        
                        {/* Display Frame */}
                        <div className="relative p-6 rounded-[3.5rem] bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-float">
                            <div className="bg-slate-950 p-2 rounded-[2.5rem] border border-white/5">
                                <QRCodeCard value={qrValue} />
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center gap-3">
                            <p className="text-sky-400 text-sm font-black uppercase tracking-[0.4em] animate-pulse">
                                Active Preview
                            </p>
                            <div className="w-12 h-1 bg-sky-500/30 rounded-full" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
