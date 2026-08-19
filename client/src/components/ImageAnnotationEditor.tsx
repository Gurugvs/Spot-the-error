import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Trash2, 
  Undo2, 
  Redo2, 
  Save, 
  Plus, 
  Upload, 
  Check, 
  Eye, 
  MousePointer, 
  Sparkles,
  Layers
} from 'lucide-react';
import { DifferenceRegion, QuestionDTO } from '../../../shared/types';
import { DualImageSpotter } from './DualImageSpotter';

interface ImageAnnotationEditorProps {
  initialQuestion?: Partial<QuestionDTO>;
  onSave: (question: Partial<QuestionDTO>) => Promise<void>;
  onCancel?: () => void;
}

export const ImageAnnotationEditor: React.FC<ImageAnnotationEditorProps> = ({
  initialQuestion,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialQuestion?.title || 'New Spot The Difference Puzzle');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialQuestion?.difficulty || 'medium');
  const [timeLimit, setTimeLimit] = useState<number>(initialQuestion?.timeLimit || 30);
  const [points, setPoints] = useState<number>(initialQuestion?.points || 10);
  const [imageA, setImageA] = useState<string>(initialQuestion?.imageA || '');
  const [imageB, setImageB] = useState<string>(initialQuestion?.imageB || '');
  
  const [regions, setRegions] = useState<DifferenceRegion[]>(initialQuestion?.differenceRegions || []);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [history, setHistory] = useState<DifferenceRegion[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrawRect, setCurrentDrawRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const pushHistory = (newRegions: DifferenceRegion[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newRegions);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setRegions(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setRegions(history[historyIndex + 1]);
    }
  };

  // Convert client coordinates to percentage inside image container
  const getPercentageCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (previewMode || !imageA) return;
    const coords = getPercentageCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    setCurrentDrawRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    const current = getPercentageCoords(e);

    const minX = Math.min(drawStart.x, current.x);
    const minY = Math.min(drawStart.y, current.y);
    const w = Math.abs(current.x - drawStart.x);
    const h = Math.abs(current.y - drawStart.y);

    setCurrentDrawRect({ x: minX, y: minY, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDrawRect) return;
    setIsDrawing(false);

    // Only create region if size is meaningful (> 2% width & height)
    if (currentDrawRect.w >= 2 && currentDrawRect.h >= 2) {
      const centerX = Math.round((currentDrawRect.x + currentDrawRect.w / 2) * 10) / 10;
      const centerY = Math.round((currentDrawRect.y + currentDrawRect.h / 2) * 10) / 10;
      const newRegion: DifferenceRegion = {
        id: `diff-${Date.now()}-${regions.length + 1}`,
        name: `Difference ${regions.length + 1}`,
        x: centerX,
        y: centerY,
        width: Math.round(currentDrawRect.w * 10) / 10,
        height: Math.round(currentDrawRect.h * 10) / 10,
        imageTarget: 'both',
      };

      const updated = [...regions, newRegion];
      setRegions(updated);
      setSelectedRegionId(newRegion.id);
      pushHistory(updated);
    }

    setCurrentDrawRect(null);
    setDrawStart(null);
  };

  const handleDeleteSelected = () => {
    if (!selectedRegionId) return;
    const updated = regions.filter(r => r.id !== selectedRegionId);
    setRegions(updated);
    setSelectedRegionId(null);
    pushHistory(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'A') setImageA(result);
      else setImageB(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuestion = async () => {
    if (!title.trim() || !imageA || !imageB) {
      alert('Please provide a title, Image A, and Image B.');
      return;
    }
    if (regions.length === 0) {
      alert('Please annotate at least one difference region on the images.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title,
        difficulty,
        timeLimit,
        points,
        imageA,
        imageB,
        differenceRegions: regions,
        totalDifferences: regions.length,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Configuration Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-surface-border space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Image Annotation & Difference Region Editor
            </h2>
            <p className="text-xs text-slate-400">
              Draw rectangular bounding boxes over differences. Coordinates are automatically normalized to percentages (0-100%).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                previewMode
                  ? 'bg-secondary text-slate-950 shadow-lg shadow-secondary/30'
                  : 'bg-surface-card hover:bg-surface-border text-slate-200 border border-surface-border'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Exit Interactive Preview' : 'Interactive Preview'}
            </button>

            <button
              onClick={handleSaveQuestion}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-bold text-white shadow-lg shadow-primary/30 hover:brightness-110 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Puzzle...' : 'Save Puzzle'}
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-border text-sm font-medium text-slate-400 hover:text-white border border-surface-border transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Puzzle Metadata Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-surface-border/50">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Puzzle Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
              placeholder="e.g. Campus Clock Tower"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="easy">Easy (5 Differences)</option>
              <option value="medium">Medium (5 Differences)</option>
              <option value="hard">Hard (5+ Differences)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Time Limit (Seconds)</label>
            <input
              type="number"
              min={10}
              max={180}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Points per Difference</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Interactive Editor or Preview Mode */}
      {previewMode ? (
        <div className="glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Testing Puzzle as a Participant ({regions.length} Differences Configured)
            </span>
            <span className="text-xs text-slate-400">Click anywhere to test hit detection feedback</span>
          </div>

          <DualImageSpotter
            imageA={imageA}
            imageB={imageB}
            onTap={async (x, y) => {
              const TOLERANCE = 4.5;
              const hit = regions.find(
                r =>
                  x >= r.x - r.width / 2 - TOLERANCE &&
                  x <= r.x + r.width / 2 + TOLERANCE &&
                  y >= r.y - r.height / 2 - TOLERANCE &&
                  y <= r.y + r.height / 2 + TOLERANCE
              );
              return {
                correct: !!hit,
                differenceId: hit?.id,
                region: hit,
                scoreGained: hit ? points : 0,
                currentScore: hit ? points : 0,
                differencesFoundCount: hit ? 1 : 0,
                totalDifferences: regions.length,
                message: hit ? `Detected: ${hit.name}` : 'No difference hit',
              };
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Annotation Canvas Area (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between bg-surface-card px-4 py-2.5 rounded-xl border border-surface-border gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode:</span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary-light border border-primary/30 rounded-lg text-xs font-bold">
                  <Square className="w-3.5 h-3.5" /> Draw Rectangle
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white disabled:opacity-40"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white disabled:opacity-40"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={!selectedRegionId}
                  className="p-1.5 rounded-lg bg-surface border border-surface-border text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                  title="Delete Selected Region"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas Pair Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Image A Slot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>IMAGE A (ORIGINAL)</span>
                  <label className="cursor-pointer text-primary-light hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload Custom A
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'A')}
                    />
                  </label>
                </div>

                <div
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative overflow-hidden rounded-xl border-2 border-surface-border bg-surface aspect-[4/3] cursor-crosshair select-none"
                >
                  {imageA ? (
                    <img src={imageA} alt="Image A" className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center text-xs">
                      <Upload className="w-8 h-8 mb-2 opacity-50" />
                      Upload Image A or select a pre-made puzzle to begin drawing differences.
                    </div>
                  )}

                  {/* Rendered Difference Regions */}
                  {regions.map((region, idx) => {
                    const isSelected = selectedRegionId === region.id;
                    return (
                      <div
                        key={region.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRegionId(region.id);
                        }}
                        className={`absolute rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/30 shadow-lg shadow-cyan-500/50'
                            : 'border-primary bg-primary/20 hover:bg-primary/30'
                        }`}
                        style={{
                          left: `${region.x - region.width / 2}%`,
                          top: `${region.y - region.height / 2}%`,
                          width: `${region.width}%`,
                          height: `${region.height}%`,
                        }}
                      >
                        <span className="text-[10px] font-extrabold bg-slate-950/80 text-white px-1.5 py-0.5 rounded border border-white/20">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}

                  {/* Current Active Drawing Rectangle */}
                  {isDrawing && currentDrawRect && (
                    <div
                      className="absolute border-2 border-dashed border-emerald-400 bg-emerald-500/20 rounded pointer-events-none"
                      style={{
                        left: `${currentDrawRect.x}%`,
                        top: `${currentDrawRect.y}%`,
                        width: `${currentDrawRect.w}%`,
                        height: `${currentDrawRect.h}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Image B Slot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>IMAGE B (MODIFIED)</span>
                  <label className="cursor-pointer text-secondary-light hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload Custom B
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'B')}
                    />
                  </label>
                </div>

                <div className="relative overflow-hidden rounded-xl border-2 border-surface-border bg-surface aspect-[4/3] select-none">
                  {imageB ? (
                    <img src={imageB} alt="Image B" className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center text-xs">
                      <Upload className="w-8 h-8 mb-2 opacity-50" />
                      Upload Image B (modified version with subtle differences).
                    </div>
                  )}

                  {/* Synced Regions displayed on Image B */}
                  {regions.map((region, idx) => (
                    <div
                      key={`b-${region.id}`}
                      className="absolute rounded-lg border-2 border-secondary/80 bg-secondary/20 pointer-events-none flex items-center justify-center"
                      style={{
                        left: `${region.x - region.width / 2}%`,
                        top: `${region.y - region.height / 2}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,
                      }}
                    >
                      <span className="text-[10px] font-extrabold bg-slate-950/80 text-secondary-light px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Region List & Details Sidebar (1 col) */}
          <div className="glass-panel p-4 rounded-2xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Square className="w-4 h-4 text-primary" />
                Annotated Differences ({regions.length})
              </span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {regions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No differences marked yet.
                  <br />
                  Click and drag on Image A to add bounding boxes.
                </div>
              ) : (
                regions.map((r, idx) => {
                  const isSelected = selectedRegionId === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRegionId(r.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40'
                          : 'border-surface-border bg-surface-card hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">#{idx + 1} Difference</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegionId(r.id);
                            handleDeleteSelected();
                          }}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => {
                          const updated = regions.map(reg => (reg.id === r.id ? { ...reg, name: e.target.value } : reg));
                          setRegions(updated);
                        }}
                        className="w-full bg-surface border border-surface-border rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-primary"
                        placeholder="Label difference (e.g. Clock hand)"
                      />

                      <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-400">
                        <span>X: {r.x}% | Y: {r.y}%</span>
                        <span>W: {r.width}% | H: {r.height}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
