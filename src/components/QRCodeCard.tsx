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
    size = 256,
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
        <div className="flex flex-col items-center gap-6 p-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl w-full max-w-sm mx-auto animate-fade-in">

            {/* QR Code Display Area */}
            <div
                id="qr-code-wrapper"
                className="p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center transition-transform hover:scale-[1.02] duration-300 overflow-hidden"
            >
                <QRCodeSVG
                    value={value}
                    size={size}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="H" // High error correction
                    includeMargin={false}
                />
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleCopy}
                    title="Copy Link"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied' : 'Copy Link'}
                </Button>

                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleDownload}
                    title="Download PNG"
                >
                    <Download size={18} />
                    Download
                </Button>
            </div>

            {/* Value Display (truncated) */}
            <p className="text-xs text-slate-400 font-mono text-center break-all w-full px-2 truncate">
                {value}
            </p>

        </div>
    );
};
