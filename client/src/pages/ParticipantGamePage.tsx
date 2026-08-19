import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Award, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Pause, 
  Eye, 
  RefreshCw 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { socketService } from '../services/socket';
import { DualImageSpotter } from '../components/DualImageSpotter';
import { AnswerResult } from '../../../shared/types';

export const ParticipantGamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const roomCode = (gameId || '').toUpperCase();

  const {
    participant,
    currentQuestion,
    questionIndex,
    totalQuestions,
    timeRemaining,
    isPaused,
    score,
    foundRegions,
    foundDifferenceIds,
    lastAnswerResult,
    isQuestionEnded,
    revealedSolutionRegions,
    submitAnswer,
    setParticipant,
    setRoom,
    syncGameState,
  } = useGame();

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // 1. Initial State Sync & Room Channel Join
    async function init() {
      let currentP = participant;
      if (!currentP) {
        const saved = localStorage.getItem('spot_last_participant');
        if (saved) {
          try {
            currentP = JSON.parse(saved);
            setParticipant(currentP);
          } catch (e) {}
        }
      }

      if (currentP) {
        await socketService.joinRoom(roomCode, currentP.name, currentP.participantId, currentP.sessionId);
      }

      // Fetch active question snapshot immediately
      await syncGameState(roomCode);
    }

    init();

    const socket = socketService.getSocket();
    socket.on('game_finished', () => {
      navigate('/participant/result');
    });

    return () => {
      socket.off('game_finished');
    };
  }, [roomCode, navigate, setParticipant, syncGameState]);

  // Fallback: If still loading question after 1s, retry sync
  useEffect(() => {
    if (!currentQuestion) {
      const timer = setTimeout(() => {
        syncGameState(roomCode);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, roomCode, syncGameState]);

  const handleTap = async (x: number, y: number, target: 'A' | 'B'): Promise<AnswerResult | null> => {
    if (isPaused || isQuestionEnded) return null;

    const res = await submitAnswer(x, y, target);
    if (res) {
      if (res.correct) {
        setToastMessage({ text: res.message || 'Spot On! Difference Found!', type: 'success' });
      } else {
        setToastMessage({ text: res.message || 'No difference here!', type: 'error' });
      }

      setTimeout(() => setToastMessage(null), 2000);
    }
    return res;
  };

  const totalDiffs = currentQuestion?.totalDifferences || 5;
  const diffsFoundCount = foundDifferenceIds.length;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col items-center space-y-4">
      {/* Top Mobile Status Header */}
      <div className="w-full glass-panel p-3 sm:p-4 rounded-2xl border border-surface-border flex items-center justify-between gap-2 shadow-lg">
        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center font-black text-xs border border-primary/30">
            Q{questionIndex}
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Question</span>
            <div className="text-xs font-bold text-white">
              {questionIndex} of {totalQuestions}
            </div>
          </div>
        </div>

        {/* Big Animated Synchronized Timer */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-surface-card border border-surface-border">
          <Clock className={`w-4 h-4 ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-secondary'}`} />
          <span className={`font-display font-black text-lg sm:text-xl ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
            {timeRemaining}s
          </span>
        </div>

        {/* Differences Spotted Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{diffsFoundCount}/{totalDiffs} Found</span>
        </div>

        {/* Score */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:block">Score</span>
          <div className="text-base sm:text-lg font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary">
            {score} <span className="text-[10px] text-slate-400">PTS</span>
          </div>
        </div>
      </div>

      {/* Paused Overlay Alert */}
      {isPaused && (
        <div className="w-full p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
          <Pause className="w-4 h-4" />
          Game paused by organizer. Stand by...
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-20 z-50 px-4 py-2 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500 text-slate-950 border border-emerald-300'
              : 'bg-red-500 text-white border border-red-300'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toastMessage.text}
        </div>
      )}

      {/* QUESTION ENDED BANNER */}
      {isQuestionEnded && (
        <div className="w-full p-3 rounded-2xl bg-secondary/20 border border-secondary/40 text-secondary-light text-xs font-bold text-center space-y-1">
          <div>Time is up! Solutions revealed in amber boxes.</div>
          <span className="text-[10px] text-slate-400">Next question starting shortly...</span>
        </div>
      )}

      {/* MAIN DUAL IMAGE SPOTTER */}
      {currentQuestion ? (
        <DualImageSpotter
          imageA={currentQuestion.imageA}
          imageB={currentQuestion.imageB}
          onTap={handleTap}
          foundRegions={foundRegions}
          solutionRegions={revealedSolutionRegions}
          disabled={isPaused}
          isQuestionEnded={isQuestionEnded}
        />
      ) : (
        <div className="py-24 text-center text-slate-500 text-xs space-y-3">
          <Sparkles className="w-8 h-8 mx-auto opacity-40 animate-spin text-primary" />
          <p className="font-semibold text-slate-300">Loading active competition puzzle...</p>
          <button
            onClick={() => syncGameState(roomCode)}
            className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border text-xs font-bold text-secondary border border-surface-border inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Puzzle
          </button>
        </div>
      )}
    </div>
  );
};
