import React from 'react';
import { User, CheckCircle, Wifi, WifiOff, X, Sparkles } from 'lucide-react';
import { ParticipantDTO, ParticipantStatus } from '../../../shared/types';

interface LiveActivityMatrixProps {
  participants: ParticipantDTO[];
  totalDifferencesInQuestion?: number;
  onKick?: (participantId: string) => void;
}

export const LiveActivityMatrix: React.FC<LiveActivityMatrixProps> = ({
  participants,
  totalDifferencesInQuestion = 5,
  onKick,
}) => {
  const getStatusBadge = (status: ParticipantStatus) => {
    switch (status) {
      case 'answering':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Answering
          </span>
        );
      case 'finished':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            All Found
          </span>
        );
      case 'disconnected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <WifiOff className="w-3 h-3" />
            Offline
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            <Wifi className="w-3 h-3" />
            Connected
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <User className="w-4 h-4 text-secondary" />
          Live Participant Matrix ({participants.length} Active)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {participants.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-500">
            No participants joined yet.
          </div>
        ) : (
          participants.map((p) => {
            const found = p.differencesFoundCount || 0;
            const pct = Math.min(100, Math.round((found / totalDifferencesInQuestion) * 100));

            return (
              <div
                key={p.id || p.participantId}
                className="group relative p-3 rounded-xl bg-surface-card border border-surface-border hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="truncate">
                    <span className="block font-bold text-xs text-white truncate" title={p.name}>
                      {p.name}
                    </span>
                    <span className="text-[10px] text-primary-light font-semibold">Team</span>
                  </div>

                  {onKick && (
                    <button
                      onClick={() => onKick(p.participantId)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-opacity"
                      title="Kick Participant"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Spotted: <strong className="text-white">{found}</strong>/{totalDifferencesInQuestion}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
