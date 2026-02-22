
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
        <div className="auto-container py-8 animate-fade-in">
            {/* Header */}
            <header className="mb-10">
                <h1 className="fluid-h1 text-white mb-2">
                    Quick QR
                </h1>
                <p className="text-slate-500 fluid-text">
                    Create instant QR codes for any link.
                </p>
            </header>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-8 items-start">

                {/* Input Section */}
                <div className="lg:col-span-3 bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Link2 className="text-sky-500" size={20} />
                            Link Details
                        </h2>
                        <p className="text-sm text-slate-500">
                            Enter the URL you'd like to code.
                        </p>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            label="Target URL"
                        />
                        <Button type="submit" disabled={!url.trim()} className="w-full">
                            Generate QR Code
                        </Button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center w-full min-h-[300px]">
                    <div className="relative group w-full flex justify-center">
                        <div className="absolute inset-0 bg-sky-500/10 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                        <div className="relative border border-white/5 p-3 rounded-[2rem] bg-slate-900/50 backdrop-blur-sm w-fit mx-auto">
                            <QRCodeCard value={qrValue} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
