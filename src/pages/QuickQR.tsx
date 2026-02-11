
import { useState } from 'react';
import { QRCodeCard } from '../components/QRCodeCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Link2 } from 'lucide-react';

// Simplified version of the old App.tsx without the full page layout since it's now inside AppLayout
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
        <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center gap-12 max-w-4xl">

            {/* Header */}
            <header className="text-center space-y-4 animate-fade-in">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Quick QR Generator
                </h1>
                <p className="text-slate-400 text-lg max-w-lg mx-auto">
                    Instantly create QR codes for any link.
                </p>
            </header>

            {/* Main Content */}
            <div className="w-full grid md:grid-cols-2 gap-8 items-start animate-slide-up">

                {/* Input Section */}
                <div className="flex flex-col gap-6 p-6 md:p-8 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl h-full">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                            <Link2 className="text-sky-500" />
                            Enter your link
                        </h2>
                        <p className="text-sm text-slate-400">
                            Paste any URL below to generate your QR code immediately.
                        </p>
                    </div>

                    <form onSubmit={handleGenerate} className="flex flex-col gap-4 mt-auto">
                        <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            autoFocus
                            label="Destination URL"
                        />
                        <Button type="submit" size="lg" disabled={!url.trim()}>
                            Generate QR Code
                        </Button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="flex justify-center">
                    <QRCodeCard value={qrValue} />
                </div>

            </div>
        </div>
    );
}
