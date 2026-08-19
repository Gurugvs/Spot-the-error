import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Trophy, 
  Clock, 
  Maximize, 
  Minimize, 
  Users, 
  Eye, 
  Sparkles, 
  Flame 
} from 'lucide-react';
import { socketService } from '../services/socket';
import { roomApi } from '../services/api';
import { 
  QuestionDTO, 
  LeaderboardEntry, 
  ParticipantDTO, 
  WinnerSummary, 
  DifferenceRegion 
} from '../../../shared/types';
import { Leaderboard } from '../components/Leaderboard';
import { ConfettiCelebration } from '../components/ConfettiCelebration';

export const PresentationMode: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const roomCode = (roomId || '').toUpperCase();

  const [eventName, setEventName] = useState<string>('SPOT THE ERRORS');
  const [roundName, setRoundName] = useState<string>('Live Competition');
  const [gameState, setGameState] = useState<'lobby' | 'active' | 'question_ended' | 'finished'>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDTO | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [solutionRegions, setSolutionRegions] = useState<DifferenceRegion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [winnerSummary, setWinnerSummary] = useState<WinnerSummary | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const joinUrl = `${window.location.origin}/join?room=${roomCode}`;

  useEffect(() => {
    async function init() {
      try {
        const r = await roomApi.getRoomByCode(roomCode);
        if (r) {
          setEventName(r.eventName);
          setRoundName(r.roundName);
        }
      } catch (e) {}
    }
    init();

    const socket = socketService.getSocket();
    socketService.observeRoom(roomCode).then((res) => {
      if (res?.success) {
        setParticipantCount(res.participants?.length || 0);
        setLeaderboard(res.leaderboard || []);
        if (res.room.status === 'active') setGameState('active');
        if (res.room.status === 'completed') setGameState('finished');
      }
    });

    socket.on('participant_joined', (data) => {
      setParticipantCount(data.totalCount);
    });

    socket.on('participant_left', (data) => {
      setParticipantCount(data.totalCount);
    });

    socket.on('question_started', (data) => {
      setGameState('active');
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeLimit);
      setSolutionRegions([]);
    });

    socket.on('timer_tick', (data) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('question_ended', (data) => {
      setGameState('question_ended');
      if (data.correctRegions) setSolutionRegions(data.correctRegions);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    });

    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('game_finished', (data) => {
      setGameState('finished');
      setWinnerSummary(data.winnerSummary);
    });

    return () => {
      socket.off('participant_joined');
      socket.off('participant_left');
      socket.off('question_started');
      socket.off('timer_tick');
      socket.off('question_ended');
      socket.off('leaderboard_updated');
      socket.off('game_finished');
    };
  }, [roomCode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-white p-6 sm:p-10 flex flex-col justify-between select-none">
      {/* Top Projector Header */}
      <header className="flex items-center justify-between border-b border-surface-border/60 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-secondary">
              {eventName} • {roundName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
              SPOT THE ERRORS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Room Code Badge */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">ROOM CODE</span>
            <div className="text-2xl font-display font-black tracking-widest text-secondary">
              {roomCode}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* STAGE 1: LOBBY QR PROJECTOR VIEW */}
      {gameState === 'lobby' && (
        <main className="flex-1 flex flex-col items-center justify-center py-10 space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <span className="text-sm font-extrabold uppercase tracking-widest text-primary-light">
              JOIN THE COMPETITION NOW
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-black text-white">
              SCAN WITH YOUR MOBILE PHONE
            </h2>
          </div>

          <div className="p-8 bg-white rounded-3xl shadow-2xl shadow-primary/40 animate-pulse-glow">
            <QRCodeSVG value={joinUrl} size={300} level="H" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl sm:text-7xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-secondary glow-text-primary">
              {roomCode}
            </div>
            <p className="text-slate-300 text-lg">
              Visit <strong className="text-secondary font-mono">{window.location.host}/join</strong> and enter code
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-card border border-surface-border text-lg font-bold">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Players Connected: <strong className="text-emerald-400 text-2xl">{participantCount}</strong></span>
          </div>
        </main>
      )}

      {/* STAGE 2: ACTIVE QUESTION PROJECTOR VIEW */}
      {(gameState === 'active' || gameState === 'question_ended') && currentQuestion && (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 py-6 items-start">
          {/* Main Dual Images (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold uppercase tracking-wider text-primary-light px-3 py-1 rounded-xl bg-primary/20 border border-primary/30">
                QUESTION {questionIndex} OF {totalQuestions}
              </span>

              {/* Huge Timer */}
              <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-surface-card border border-surface-border shadow-xl">
                <Clock className={`w-6 h-6 ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-secondary'}`} />
                <span className="text-3xl sm:text-4xl font-display font-black text-white">
                  {timeRemaining}s
                </span>
              </div>
            </div>

            {/* Dual Images on Projector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface border-2 border-surface-border shadow-2xl">
                <img src={currentQuestion.imageA} alt="Image A" className="w-full h-full object-contain" />
                <span className="absolute top-3 left-3 text-xs font-black bg-slate-950/80 px-3 py-1 rounded-lg text-white">
                  IMAGE A
                </span>
                {gameState === 'question_ended' &&
                  solutionRegions.map((r) => (
                    <div
                      key={`proj-a-${r.id}`}
                      className="absolute rounded-lg border-2 border-amber-400 bg-amber-400/25 animate-pulse"
                      style={{
                        left: `${r.x - r.width / 2}%`,
                        top: `${r.y - r.height / 2}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`,
                      }}
                    />
                  ))}
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface border-2 border-surface-border shadow-2xl">
                <img src={currentQuestion.imageB} alt="Image B" className="w-full h-full object-contain" />
                <span className="absolute top-3 left-3 text-xs font-black bg-slate-950/80 px-3 py-1 rounded-lg text-secondary-light">
                  IMAGE B
                </span>
                {gameState === 'question_ended' &&
                  solutionRegions.map((r) => (
                    <div
                      key={`proj-b-${r.id}`}
                      className="absolute rounded-lg border-2 border-amber-400 bg-amber-400/25 animate-pulse"
                      style={{
                        left: `${r.x - r.width / 2}%`,
                        top: `${r.y - r.height / 2}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`,
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Right Live Leaderboard Stream (1 col) */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-3xl border border-surface-border space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-border/60 pb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-base font-display font-bold text-white">Live Ranks</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto pr-1">
              <Leaderboard entries={leaderboard} maxEntries={7} showDetails={false} />
            </div>
          </div>
        </main>
      )}

      {/* STAGE 3: GRAND FINALE CHAMPION PODIUM */}
      {gameState === 'finished' && winnerSummary && (
        <main className="flex-1 flex flex-col items-center justify-center py-8 space-y-8 animate-fade-in text-center">
          <ConfettiCelebration durationMs={12000} />

          <div className="space-y-2">
            <span className="text-sm uppercase font-extrabold tracking-widest text-secondary">
              COMPETITION COMPLETE
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 glow-text-primary">
              🏆 GRAND CHAMPION 🏆
            </h2>
          </div>

          {/* Winner Gold Card */}
          <div className="glass-panel-glow p-8 sm:p-10 rounded-3xl border-2 border-yellow-500/50 max-w-xl w-full text-center space-y-4 shadow-2xl shadow-yellow-500/20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center mx-auto text-4xl shadow-xl shadow-yellow-500/30">
              🥇
            </div>

            <div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-white">
                {winnerSummary.winner.name}
              </h3>
              <p className="text-sm text-secondary font-semibold mt-0.5">
                Winning Team
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-surface-border">
              <div className="p-3 bg-surface rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Score</span>
                <div className="text-2xl font-black text-yellow-400">{winnerSummary.winner.score}</div>
              </div>
              <div className="p-3 bg-surface rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</span>
                <div className="text-2xl font-black text-emerald-400">{winnerSummary.winner.correctAnswers} Hits</div>
              </div>
              <div className="p-3 bg-surface rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Time</span>
                <div className="text-2xl font-black text-cyan-400">{winnerSummary.winner.totalTime}s</div>
              </div>
            </div>
          </div>

          {/* Runner Up & 2nd Runner Up Podium Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
            {winnerSummary.runnerUp && (
              <div className="glass-panel p-5 rounded-2xl border border-slate-400/40 flex items-center gap-4">
                <div className="text-3xl">🥈</div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">1st Runner Up</span>
                  <div className="text-lg font-bold text-white">{winnerSummary.runnerUp.name}</div>
                  <div className="text-xs text-slate-300 font-semibold">{winnerSummary.runnerUp.score} PTS</div>
                </div>
              </div>
            )}

            {winnerSummary.secondRunnerUp && (
              <div className="glass-panel p-5 rounded-2xl border border-amber-700/40 flex items-center gap-4">
                <div className="text-3xl">🥉</div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">2nd Runner Up</span>
                  <div className="text-lg font-bold text-white">{winnerSummary.secondRunnerUp.name}</div>
                  <div className="text-xs text-slate-300 font-semibold">{winnerSummary.secondRunnerUp.score} PTS</div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Projector Footer */}
      <footer className="text-center text-xs text-slate-500 pt-4 border-t border-surface-border/40">
        SPOT THE ERRORS • Brahmastra 26' built by CSE • Published by Chettinad College of Engineering and Technology
      </footer>
    </div>
  );
};
