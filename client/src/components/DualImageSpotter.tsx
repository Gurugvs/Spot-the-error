import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { DifferenceRegion, AnswerResult } from '../../../shared/types';

interface DualImageSpotterProps {
  imageA: string;
  imageB: string;
  onTap: (x: number, y: number, target: 'A' | 'B') => Promise<AnswerResult | null>;
  foundRegions?: DifferenceRegion[];
  solutionRegions?: DifferenceRegion[];
  disabled?: boolean;
  isQuestionEnded?: boolean;
}

interface TapRipple {
  id: number;
  x: number; // percentage
  y: number; // percentage
  target: 'A' | 'B';
  type: 'correct' | 'wrong' | 'pending';
}

export const DualImageSpotter: React.FC<DualImageSpotterProps> = ({
  imageA,
  imageB,
  onTap,
  foundRegions = [],
  solutionRegions = [],
  disabled = false,
  isQuestionEnded = false,
}) => {
  const containerRefA = useRef<HTMLDivElement>(null);
  const containerRefB = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<TapRipple[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mobileActiveTab, setMobileActiveTab] = useState<'both' | 'A' | 'B'>('both');

  // Unified Pointer Handler (Touch, Mouse, Stylus)
  const handlePointerDown = async (
    e: React.PointerEvent<HTMLDivElement>,
    target: 'A' | 'B'
  ) => {
    if (disabled || isQuestionEnded) return;

    // Only handle primary button / primary touch point
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const container = target === 'A' ? containerRefA.current : containerRefB.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Calculate percentage relative to the exact container box
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    console.log(`🎯 [Spot Tap] Target: ${target}, x: ${x.toFixed(1)}%, y: ${y.toFixed(1)}%`);

    const rippleId = Date.now() + Math.random();
    setRipples(prev => [...prev, { id: rippleId, x, y, target, type: 'pending' }]);

    const result = await onTap(x, y, target);

    setRipples(prev =>
      prev.map(r => (r.id === rippleId ? { ...r, type: result?.correct ? 'correct' : 'wrong' } : r))
    );

    // Fade ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 1200);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(1, Math.min(2.2, prev + delta)));
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Mobile Tab Switcher for ultra-compact phones */}
      <div className="flex sm:hidden items-center justify-between w-full mb-2 px-1">
        <div className="flex bg-surface-card p-1 rounded-lg border border-surface-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileActiveTab('both')}
            className={`px-3 py-1 rounded-md transition-all ${
              mobileActiveTab === 'both' ? 'bg-primary text-white' : 'text-slate-400'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('A')}
            className={`px-3 py-1 rounded-md transition-all ${
              mobileActiveTab === 'A' ? 'bg-primary text-white' : 'text-slate-400'
            }`}
          >
            Image A
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('B')}
            className={`px-3 py-1 rounded-md transition-all ${
              mobileActiveTab === 'B' ? 'bg-primary text-white' : 'text-slate-400'
            }`}
          >
            Image B
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleZoom(0.2)}
            disabled={zoomLevel >= 2.2}
            className="p-1.5 rounded-md bg-surface-card border border-surface-border text-slate-300 disabled:opacity-50"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.2)}
            disabled={zoomLevel <= 1}
            className="p-1.5 rounded-md bg-surface-card border border-surface-border text-slate-300 disabled:opacity-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-md bg-surface-card border border-surface-border text-slate-300"
              title="Reset Zoom"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Image Display */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-w-6xl">
        {/* IMAGE A */}
        {(mobileActiveTab === 'both' || mobileActiveTab === 'A') && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5 px-2">
              <span className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                IMAGE A (ORIGINAL)
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Tap difference anywhere
              </span>
            </div>

            <div
              ref={containerRefA}
              onPointerDown={(e) => handlePointerDown(e, 'A')}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-crosshair no-zoom select-none bg-surface shadow-2xl ${
                disabled ? 'opacity-70 pointer-events-none' : 'border-surface-border hover:border-primary/50'
              }`}
              style={{
                aspectRatio: '4 / 3',
                touchAction: 'none'
              }}
            >
              <img
                src={imageA}
                alt="Puzzle Image A"
                className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
                draggable={false}
              />

              {/* Found Difference Highlight Markers */}
              {foundRegions.map((region) => (
                <div
                  key={`found-a-${region.id}`}
                  className="absolute pointer-events-none rounded-lg border-2 border-emerald-400 bg-emerald-500/25 shadow-lg shadow-emerald-500/50 animate-pulse flex items-center justify-center"
                  style={{
                    left: `${region.x - region.width / 2}%`,
                    top: `${region.y - region.height / 2}%`,
                    width: `${region.width}%`,
                    height: `${region.height}%`,
                  }}
                >
                  <div className="absolute -top-3 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    ✓ Found
                  </div>
                </div>
              ))}

              {/* Revealed Solution Regions (On Question Ended) */}
              {isQuestionEnded &&
                solutionRegions.map((region) => (
                  <div
                    key={`sol-a-${region.id}`}
                    className="absolute pointer-events-none rounded-lg border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center shadow-lg"
                    style={{
                      left: `${region.x - region.width / 2}%`,
                      top: `${region.y - region.height / 2}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                    }}
                  >
                    <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-1 py-0.5 rounded">
                      {region.name}
                    </span>
                  </div>
                ))}

              {/* Ripple Click Feedback */}
              {ripples
                .filter(r => r.target === 'A')
                .map(r => (
                  <div
                    key={r.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full animate-ping-once ${
                      r.type === 'correct'
                        ? 'w-12 h-12 bg-emerald-500/60 border-2 border-emerald-400'
                        : r.type === 'wrong'
                        ? 'w-10 h-10 bg-red-500/60 border-2 border-red-400'
                        : 'w-8 h-8 bg-cyan-400/60 border border-cyan-300'
                    }`}
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* IMAGE B */}
        {(mobileActiveTab === 'both' || mobileActiveTab === 'B') && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5 px-2">
              <span className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
                IMAGE B (MODIFIED)
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Find the changes
              </span>
            </div>

            <div
              ref={containerRefB}
              onPointerDown={(e) => handlePointerDown(e, 'B')}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-crosshair no-zoom select-none bg-surface shadow-2xl ${
                disabled ? 'opacity-70 pointer-events-none' : 'border-surface-border hover:border-secondary/50'
              }`}
              style={{
                aspectRatio: '4 / 3',
                touchAction: 'none'
              }}
            >
              <img
                src={imageB}
                alt="Puzzle Image B"
                className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
                draggable={false}
              />

              {/* Found Difference Highlight Markers */}
              {foundRegions.map((region) => (
                <div
                  key={`found-b-${region.id}`}
                  className="absolute pointer-events-none rounded-lg border-2 border-emerald-400 bg-emerald-500/25 shadow-lg shadow-emerald-500/50 animate-pulse flex items-center justify-center"
                  style={{
                    left: `${region.x - region.width / 2}%`,
                    top: `${region.y - region.height / 2}%`,
                    width: `${region.width}%`,
                    height: `${region.height}%`,
                  }}
                >
                  <div className="absolute -top-3 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    ✓ Found
                  </div>
                </div>
              ))}

              {/* Revealed Solution Regions */}
              {isQuestionEnded &&
                solutionRegions.map((region) => (
                  <div
                    key={`sol-b-${region.id}`}
                    className="absolute pointer-events-none rounded-lg border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center shadow-lg"
                    style={{
                      left: `${region.x - region.width / 2}%`,
                      top: `${region.y - region.height / 2}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                    }}
                  >
                    <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-1 py-0.5 rounded">
                      {region.name}
                    </span>
                  </div>
                ))}

              {/* Ripple Click Feedback */}
              {ripples
                .filter(r => r.target === 'B')
                .map(r => (
                  <div
                    key={r.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full animate-ping-once ${
                      r.type === 'correct'
                        ? 'w-12 h-12 bg-emerald-500/60 border-2 border-emerald-400'
                        : r.type === 'wrong'
                        ? 'w-10 h-10 bg-red-500/60 border-2 border-red-400'
                        : 'w-8 h-8 bg-cyan-400/60 border border-cyan-300'
                    }`}
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
