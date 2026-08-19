import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Maximize2, ExternalLink } from 'lucide-react';

interface QRModalProps {
  roomCode: string;
  eventName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ roomCode, eventName, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl = `${window.location.origin}/join?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel-glow text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-surface-card border border-surface-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-secondary">
            {eventName || 'SPOT THE ERRORS'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
            SCAN TO JOIN
          </h2>
        </div>

        {/* High Contrast QR Container */}
        <div className="p-5 bg-white rounded-2xl inline-block shadow-2xl shadow-primary/20">
          <QRCodeSVG value={joinUrl} size={240} level="H" includeMargin={false} />
        </div>

        {/* Big Room Code Display */}
        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">ROOM CODE</span>
          <div className="text-4xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-secondary">
            {roomCode}
          </div>
        </div>

        {/* Copy & Direct Link Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-sm font-bold text-slate-200 border border-surface-border flex items-center justify-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Link Copied!' : 'Copy Join Link'}
          </button>
        </div>
      </div>
    </div>
  );
};
