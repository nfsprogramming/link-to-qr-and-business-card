
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { ScanLine, ExternalLink, Copy, AlertCircle } from 'lucide-react';

export function Scan() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Only initialize scanner if not already done
        if (!scannerRef.current) {
            // html5-qrcode requires a DOM element ID
            // We use a small timeout to ensure the DOM is ready
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
                        /* verbose= */ false
                        );

                        scanner.render(onScanSuccess, onScanFailure);
                        scannerRef.current = scanner;
                    } catch (e) {
                        setError("Camera access failed or not supported in this environment.");
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
                    // ignore cleanup errors
                }
                scannerRef.current = null;
            }
        };
    }, []);

    const onScanSuccess = (decodedText: string) => {
        setScanResult(decodedText);
        // Optionally stop scanning after success
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
    };

    const onScanFailure = (_error: any) => {
        // handle scan failure, usually better to ignore and keep scanning
        // console.warn(`Code scan error = ${error}`);
    };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        window.location.reload(); // Simple way to reset scanner for now
    };

    return (
        <div className="container mx-auto px-4 py-6 flex flex-col items-center max-w-lg min-h-screen">
            <header className="text-center mb-6 animate-fade-in-up w-full">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent mb-3">
                    QR Scanner
                </h1>
                <p className="text-slate-400 text-sm md:text-base">
                    Point your camera at a QR code to scan.
                </p>
            </header>

            <div className="w-full bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden animate-fade-in">

                {!scanResult ? (
                    <>
                        <div id="reader" className="w-full overflow-hidden rounded-xl bg-black min-h-[280px] md:min-h-[320px]" />
                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                                <AlertCircle size={20} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-6 py-6 md:py-8 animate-fade-in">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                            <ScanLine size={32} />
                        </div>

                        <div className="text-center w-full">
                            <h3 className="text-lg font-semibold text-white mb-3">Scan Successful!</h3>
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 break-all text-slate-300 font-mono text-sm">
                                {scanResult}
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => navigator.clipboard.writeText(scanResult)}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
                            >
                                <Copy size={18} />
                                Copy
                            </button>
                            {scanResult.startsWith('http') && (
                                <a
                                    href={scanResult}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
                                >
                                    <ExternalLink size={18} />
                                    Open
                                </a>
                            )}
                        </div>

                        <button
                            onClick={handleReset}
                            className="text-slate-500 hover:text-white text-sm mt-2 underline decoration-slate-700 underline-offset-4 touch-manipulation"
                        >
                            Scan Another Code
                        </button>
                    </div>
                )}

            </div>

            {!scanResult && (
                <p className="mt-6 text-slate-500 text-xs md:text-sm text-center max-w-xs px-4">
                    Make sure you grant camera permissions. Works best on mobile devices.
                </p>
            )}
        </div>
    );
}
