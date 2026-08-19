import React from 'react';
import { Trophy, Medal, Flame, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LeaderboardEntry } from '../../../shared/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightParticipantId?: string;
  showDetails?: boolean;
  maxEntries?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  highlightParticipantId,
  showDetails = true,
  maxEntries,
}) => {
  const displayList = maxEntries ? entries.slice(0, maxEntries) : entries;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-yellow-500/30 text-sm">
            🥇 1
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black flex items-center justify-center shadow-md text-sm">
            🥈 2
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black flex items-center justify-center shadow-md text-sm">
            🥉 3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-surface-border text-slate-300 font-bold flex items-center justify-center text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {displayList.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          No participant scores yet. The leaderboard updates live as participants submit differences!
        </div>
      ) : (
        displayList.map((entry) => {
          const isMe = highlightParticipantId === entry.participantId;
          return (
            <div
              key={entry.participantId}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                isMe
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.01]'
                  : entry.rank === 1
                  ? 'border-yellow-500/40 bg-yellow-500/10'
                  : 'border-surface-border bg-surface-card hover:border-slate-600'
              }`}
            >
              {/* Left Rank & Participant Info */}
              <div className="flex items-center gap-3">
                {getRankBadge(entry.rank)}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{entry.name}</span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">
                        YOUR TEAM
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Stats (Optional) */}
              {showDetails && (
                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {entry.correctAnswers}
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle className="w-3.5 h-3.5" />
                    {entry.wrongAnswers}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {entry.totalTime}s
                  </span>
                </div>
              )}

              {/* Right Score */}
              <div className="text-right">
                <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary">
                  {entry.score} <span className="text-xs text-slate-400 font-bold">PTS</span>
                </div>
                {entry.differencesFoundInCurrentQuestion !== undefined && entry.differencesFoundInCurrentQuestion > 0 && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <Flame className="w-3 h-3 fill-emerald-400" />
                    {entry.differencesFoundInCurrentQuestion} spotted
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
