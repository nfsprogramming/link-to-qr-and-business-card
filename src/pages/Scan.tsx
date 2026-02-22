
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
        <div className="auto-container py-8 animate-fade-in">
            <header className="mb-10">
                <h1 className="fluid-h1 text-white mb-2">
                    Scanner
                </h1>
                <p className="text-slate-500 fluid-text">
                    Scan any QR code using your camera.
                </p>
            </header>

            <div className="w-full max-w-md mx-auto">
                <div className="bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl overflow-hidden relative">
                    {!scanResult ? (
                        <>
                            <div id="reader" className="w-full overflow-hidden rounded-xl bg-black min-h-[300px] border border-white/5" />
                            {error && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-6 py-4">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                                <ScanLine size={32} />
                            </div>

                            <div className="text-center w-full">
                                <h3 className="text-xl font-bold text-white mb-4">Scan Result</h3>
                                <div className="p-4 bg-slate-950 rounded-xl border border-white/5 break-all text-slate-400 font-mono text-sm leading-relaxed">
                                    {scanResult}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(scanResult);
                                    }}
                                    className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Copy size={18} />
                                    Copy
                                </button>
                                {scanResult.startsWith('http') && (
                                    <a
                                        href={scanResult}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={18} />
                                        Open
                                    </a>
                                )}
                            </div>

                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold transition-colors mt-2"
                            >
                                <RefreshCw size={14} />
                                Scan Another
                            </button>
                        </div>
                    )}
                </div>

                {!scanResult && (
                    <div className="mt-8 p-4 bg-slate-900/20 rounded-xl border border-white/5 text-center">
                        <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                            Requires camera permissions. Works best on modern mobile browsers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
