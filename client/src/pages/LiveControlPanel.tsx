import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  StopCircle, 
  Clock, 
  Users, 
  Trophy, 
  Tv, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import { socketService } from '../services/socket';
import { roomApi, questionApi } from '../services/api';
import { 
  QuestionDTO, 
  LeaderboardEntry, 
  ParticipantDTO, 
  RoomDTO, 
  DifferenceRegion 
} from '../../../shared/types';
import { Leaderboard } from '../components/Leaderboard';
import { LiveActivityMatrix } from '../components/LiveActivityMatrix';

export const LiveControlPanel: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const roomCode = (gameId || '').toUpperCase();

  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDTO | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isQuestionEnded, setIsQuestionEnded] = useState<boolean>(false);
  const [solutionRegions, setSolutionRegions] = useState<DifferenceRegion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participants, setParticipants] = useState<ParticipantDTO[]>([]);
  const [showSolutionOnOrganizerScreen, setShowSolutionOnOrganizerScreen] = useState<boolean>(true);

  useEffect(() => {
    // Initial fetch
    async function loadData() {
      try {
        const r = await roomApi.getRoomByCode(roomCode);
        setRoom(r);
        const pList = await roomApi.getParticipants(roomCode);
        setParticipants(pList);
      } catch (e) {}
    }
    loadData();

    const socket = socketService.getSocket();
    socketService.observeRoom(roomCode).then((res) => {
      if (res?.success) {
        setRoom(res.room);
        setParticipants(res.participants);
        setLeaderboard(res.leaderboard);
      }
    });

    // Socket Event Subscriptions
    socket.on('question_started', (data) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeLimit);
      setIsPaused(false);
      setIsQuestionEnded(false);
      setSolutionRegions([]);
    });

    socket.on('timer_tick', (data) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('question_ended', (data) => {
      setIsQuestionEnded(true);
      if (data.correctRegions) setSolutionRegions(data.correctRegions);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    });

    socket.on('game_paused', () => setIsPaused(true));
    socket.on('game_resumed', (data) => {
      setIsPaused(false);
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('participant_status_updated', (data) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.participantId === data.participantId
            ? { ...p, status: data.status, differencesFoundCount: data.differencesFound ?? p.differencesFoundCount }
            : p
        )
      );
    });

    socket.on('game_finished', () => {
      navigate(`/admin/results/${roomCode}`);
    });

    return () => {
      socket.off('question_started');
      socket.off('timer_tick');
      socket.off('question_ended');
      socket.off('game_paused');
      socket.off('game_resumed');
      socket.off('leaderboard_updated');
      socket.off('participant_status_updated');
      socket.off('game_finished');
    };
  }, [roomCode, navigate]);

  // Organizer Controls
  const handlePauseResume = () => {
    if (isPaused) {
      socketService.resumeGame(roomCode);
    } else {
      socketService.pauseGame(roomCode);
    }
  };

  const handleNextQuestion = () => {
    socketService.nextQuestion(roomCode);
  };

  const handleRestartQuestion = () => {
    if (confirm('Restart current question timer for all participants?')) {
      socketService.restartQuestion(roomCode);
    }
  };

  const handleEndGame = () => {
    if (confirm('End competition now and announce the winners?')) {
      socketService.endGame(roomCode);
      navigate(`/admin/results/${roomCode}`);
    }
  };

  const handleKickParticipant = (participantId: string) => {
    if (confirm(`Kick participant ${participantId}?`)) {
      socketService.kickParticipant(roomCode, participantId);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Conductor Control Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-surface-card rounded-2xl border border-surface-border">
            <span className="text-[10px] uppercase font-bold text-slate-400">ROOM</span>
            <div className="text-xl font-display font-black text-white">{roomCode}</div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
                QUESTION {questionIndex} OF {totalQuestions}
              </span>
              {isPaused && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PAUSED
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-display font-black text-white mt-0.5 truncate max-w-md">
              {currentQuestion?.title || 'Loading active puzzle...'}
            </h1>
          </div>
        </div>

        {/* Big Live Timer & Quick Controls */}
        <div className="flex items-center gap-3">
          {/* Synchronized Countdown Box */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-card border border-surface-border shadow-inner">
            <Clock className={`w-5 h-5 ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-secondary'}`} />
            <div className="text-2xl sm:text-3xl font-display font-black text-white">
              {timeRemaining}s
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={handlePauseResume}
            className={`p-3 rounded-2xl border text-white font-bold transition-all shadow-md ${
              isPaused
                ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500'
                : 'bg-amber-600 border-amber-500 hover:bg-amber-500'
            }`}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={handleNextQuestion}
            className="px-4 py-3 rounded-2xl bg-primary hover:bg-primary-hover border border-primary-light/40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
            title="Next Question"
          >
            <SkipForward className="w-4 h-4" /> Next
          </button>

          <button
            onClick={handleRestartQuestion}
            className="p-3 rounded-2xl bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 transition-all"
            title="Restart Question"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleEndGame}
            className="px-4 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="End Full Game"
          >
            <StopCircle className="w-4 h-4" /> End Game
          </button>

          <Link
            to={`/admin/room/${roomCode}/presentation`}
            target="_blank"
            className="p-3 rounded-2xl bg-surface-card hover:bg-surface-border border border-surface-border text-secondary transition-all"
            title="Open Projector Presentation Window"
          >
            <Tv className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Puzzle View & Live Activity (3 cols), Right Live Leaderboard (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Puzzle Images & Live Participant Activity Matrix */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Question Preview */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-surface-border space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Live Puzzle Broadcast
              </span>
              <button
                onClick={() => setShowSolutionOnOrganizerScreen(!showSolutionOnOrganizerScreen)}
                className="text-[11px] text-secondary hover:underline flex items-center gap-1"
              >
                {showSolutionOnOrganizerScreen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showSolutionOnOrganizerScreen ? 'Hide Solution Boxes' : 'Show Solution Boxes'}
              </button>
            </div>

            {currentQuestion ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-surface-border">
                  <img src={currentQuestion.imageA} alt="Image A" className="w-full h-full object-contain" />
                  <span className="absolute top-2 left-2 text-[10px] font-extrabold bg-black/70 px-2 py-0.5 rounded text-white">
                    Image A
                  </span>
                  {showSolutionOnOrganizerScreen &&
                    solutionRegions.map((r) => (
                      <div
                        key={`ctrl-a-${r.id}`}
                        className="absolute rounded border-2 border-amber-400 bg-amber-400/20"
                        style={{
                          left: `${r.x - r.width / 2}%`,
                          top: `${r.y - r.height / 2}%`,
                          width: `${r.width}%`,
                          height: `${r.height}%`,
                        }}
                      />
                    ))}
                </div>

                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-surface-border">
                  <img src={currentQuestion.imageB} alt="Image B" className="w-full h-full object-contain" />
                  <span className="absolute top-2 left-2 text-[10px] font-extrabold bg-black/70 px-2 py-0.5 rounded text-secondary-light">
                    Image B
                  </span>
                  {showSolutionOnOrganizerScreen &&
                    solutionRegions.map((r) => (
                      <div
                        key={`ctrl-b-${r.id}`}
                        className="absolute rounded border-2 border-amber-400 bg-amber-400/20"
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
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Preparing next question puzzle...
              </div>
            )}
          </div>

          {/* Live Participant Matrix */}
          <div className="glass-panel p-5 rounded-3xl border border-surface-border">
            <LiveActivityMatrix
              participants={participants}
              totalDifferencesInQuestion={currentQuestion?.totalDifferences || 5}
              onKick={handleKickParticipant}
            />
          </div>
        </div>

        {/* Right Side: Real-Time Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-display font-bold text-white">Live Leaderboard</h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-1">
            <Leaderboard entries={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  );
};
