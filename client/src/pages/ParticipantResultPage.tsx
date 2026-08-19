import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Home 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Leaderboard } from '../components/Leaderboard';
import { ConfettiCelebration } from '../components/ConfettiCelebration';

export const ParticipantResultPage: React.FC = () => {
  const { participant, winnerSummary, leaderboard, score } = useGame();

  const myRankEntry = leaderboard.find(e => e.participantId === participant?.participantId);
  const rank = myRankEntry?.rank || 1;
  const isChampion = rank === 1;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-center">
      {isChampion && <ConfettiCelebration durationMs={10000} />}

      {/* Hero Victory Card */}
      <div className="glass-panel-glow p-8 sm:p-10 rounded-3xl border border-primary/40 space-y-6 shadow-2xl relative">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-secondary">
            COMPETITION CONCLUDED
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
            {isChampion ? '🏆 CHAMPION! YOU WON! 🏆' : 'Great Effort! Game Complete!'}
          </h1>
          <p className="text-xs text-slate-400">
            Team: <strong className="text-white">{participant?.name || 'Team'}</strong>
          </p>
        </div>

        {/* Big Rank Badge */}
        <div className="inline-flex items-center justify-center p-6 rounded-full bg-surface-card border-2 border-primary shadow-xl">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">YOUR RANK</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-secondary">
              #{rank}
            </div>
          </div>
        </div>

        {/* Score & Hit Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
            <div className="text-xl sm:text-2xl font-black text-yellow-400 mt-0.5">
              {score} PTS
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Correct Hits</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {myRankEntry?.correctAnswers || 0}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Wrong Taps</span>
            <div className="text-xl sm:text-2xl font-black text-red-400 mt-0.5">
              {myRankEntry?.wrongAnswers || 0}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Time</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5">
              {myRankEntry?.totalTime || 0}s
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-2">
          <Link
            to="/join"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-card hover:bg-surface-border text-sm font-bold text-slate-200 border border-surface-border transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Join Another Game
          </Link>
        </div>
      </div>

      {/* Final Leaderboard */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border text-left space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-border/60 pb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-base font-display font-bold text-white">Full Event Leaderboard</h2>
        </div>
        <Leaderboard entries={leaderboard} highlightParticipantId={participant?.participantId} />
      </div>
    </div>
  );
};
