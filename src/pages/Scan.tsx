
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { ScanLine, ExternalLink, Copy, AlertCircle, RefreshCw } from 'lucide-react';

export function Scan() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (!scannerRef.current) {
            const timer = setTimeout(() => {
                const element = document.getElementById('reader');
                if (element) {
                    try {
                        const scanner = new Html5QrcodeScanner(
                            "reader",
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                                aspectRatio: 1.0,
                                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                            },
                            false
                        );

                        scanner.render(onScanSuccess, onScanFailure);
                        scannerRef.current = scanner;
                    } catch (e) {
                        setError("Camera access failed or not supported.");
                        console.error(e);
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(console.error);
                } catch (e) {
                    // ignore
                }
                scannerRef.current = null;
            }
        };
    }, []);

    const onScanSuccess = (decodedText: string) => {
        setScanResult(decodedText);
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
    };

    const onScanFailure = () => { };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        window.location.reload();
    };

    return (
        <div className="auto-container py-12 animate-fade-in relative">
            <header className="mb-14 text-center lg:text-left">
                <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
                    Scanner
                </h1>
                <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
                    Instantly capture and decode any QR code using your device's high-speed lens.
                </p>
            </header>

            <div className="w-full max-w-xl mx-auto">
                <div className="bg-slate-950/60 backdrop-blur-2xl border border-white/10 p-4 md:p-6 rounded-[3rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                    {!scanResult ? (
                        <>
                            <div className="relative group">
                                <div id="reader" className="w-full overflow-hidden rounded-[2.5rem] bg-black min-h-[400px] border border-white/5" />
                                <div className="absolute inset-0 border-2 border-white/10 rounded-[2.5rem] pointer-events-none group-hover:border-sky-500/20 transition-colors" />
                                
                                {/* Scanning Overlay */}
                                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-sky-500/50 blur-[2px] animate-scan-line pointer-events-none" />
                            </div>
                            {error && (
                                <div className="mt-8 p-5 bg-red-500/10 border border-red-500/10 rounded-3xl flex items-center gap-4 text-red-400 animate-shake">
                                    <AlertCircle size={24} />
                                    <span className="text-sm font-black uppercase tracking-widest">{error}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-10 py-6 px-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                <div className="relative w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-xl">
                                    <ScanLine size={48} strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="text-center w-full">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Payload Decoded</p>
                                <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 break-all text-white font-mono text-sm leading-relaxed shadow-inner">
                                    {scanResult}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(scanResult);
                                        alert('Copied to system clipboard!');
                                    }}
                                    className="py-5 bg-white text-slate-950 rounded-2xl font-black text-sm transition-all hover:bg-slate-100 active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
                                >
                                    <Copy size={18} strokeWidth={3} />
                                    <span>COPY URL</span>
                                </button>
                                {scanResult.startsWith('http') && (
                                    <a
                                        href={scanResult}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-5 bg-sky-500 text-white rounded-2xl font-black text-sm transition-all hover:bg-sky-400 active:scale-95 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
                                    >
                                        <ExternalLink size={18} strokeWidth={3} />
                                        <span>OPEN LINK</span>
                                    </a>
                                )}
                            </div>

                            <button
                                onClick={handleReset}
                                className="flex items-center gap-3 text-slate-500 hover:text-white text-xs font-black transition-all mt-4 uppercase tracking-widest active:scale-95"
                            >
                                <RefreshCw size={16} />
                                <span>RE-INITIALIZE SCANNER</span>
                            </button>
                        </div>
                    )}
                </div>

                {!scanResult && (
                    <div className="mt-12 p-6 bg-slate-950/20 rounded-3xl border border-white/5 text-center backdrop-blur-md">
                        <p className="text-slate-500 text-[11px] uppercase font-black tracking-[0.2em] leading-relaxed">
                            Requires camera permissions • Optimized for high-density codes
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
