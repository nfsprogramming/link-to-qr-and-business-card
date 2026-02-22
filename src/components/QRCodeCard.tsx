
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
        <div className="flex flex-col items-center gap-5 p-5 bg-slate-900 shadow-2xl w-full max-w-[260px] animate-fade-in rounded-3xl border border-white/5 box-border">
            {/* QR Wrapper Container - Forces absolute centering */}
            <div className="flex items-center justify-center w-full">
                <div
                    id="qr-code-wrapper"
                    className="p-3 bg-white rounded-2xl shadow-inner ring-1 ring-white/10 flex items-center justify-center shrink-0"
                >
                    <QRCodeSVG
                        value={value}
                        size={180}
                        fgColor={fgColor}
                        bgColor={bgColor}
                        level="H" // High error correction
                        includeMargin={false}
                    />
                </div>
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
                    {copied ? 'Copied' : 'Copy'}
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
            <p className="text-xs text-slate-500 font-mono text-center break-all w-full px-2 truncate opacity-50">
                {value}
            </p>
        </div>
    );
};
