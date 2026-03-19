
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Check, Copy } from 'lucide-react';
import { downloadQRCode } from '../utils/download';
import { Button } from './Button';

interface QRCodeCardProps {
    value: string;
    size?: number;
    fgColor?: string;
    bgColor?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
    value,
    fgColor = '#000000',
    bgColor = '#ffffff',
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    const handleDownload = () => {
        // The utility expects an ID. We will give the wrapper div an ID.
        downloadQRCode('qr-code-wrapper', `qr-code-${Date.now()}`, 'png');
    };

    return (
        <div className="flex flex-col items-center gap-8 p-6 bg-slate-950/40 backdrop-blur-2xl border border-white/5 shadow-[0_25px_50px_rgba(0,0,0,0.5)] w-full max-w-[320px] animate-fade-in rounded-[3rem] box-border relative overflow-hidden group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {/* QR Wrapper Container - Deep shadow & better padding */}
            <div className="flex items-center justify-center w-full relative z-10 scale-105 group-hover:scale-110 transition-transform duration-700">
                <div
                    id="qr-code-wrapper"
                    className="p-5 bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(255,255,255,0.1)] ring-1 ring-white flex items-center justify-center shrink-0 border-4 border-slate-950"
                >
                    <QRCodeSVG
                        value={value}
                        size={180}
                        fgColor={fgColor}
                        bgColor={bgColor}
                        level="H" 
                        includeMargin={false}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-3 relative z-10 px-2 mt-2">
                <Button
                    variant="secondary"
                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10"
                    onClick={handleCopy}
                >
                    {copied ? <Check size={16} strokeWidth={3} className="text-emerald-400" /> : <Copy size={16} strokeWidth={3} />}
                    <span>{copied ? 'Link Saved' : 'Copy Hub Link'}</span>
                </Button>

                <Button
                    variant="primary"
                    className="w-full py-4 rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
                    onClick={handleDownload}
                >
                    <Download size={16} strokeWidth={3} />
                    <span>Download PNG</span>
                </Button>
            </div>

            {/* Value Display (truncated) */}
            <div className="relative z-10 w-full px-4 text-center">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] truncate opacity-40 group-hover:opacity-100 transition-opacity">
                    {value.replace('https://', '')}
                </p>
            </div>
        </div>
    );
};
