import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socket';
import { soundManager } from '../audio/soundManager';
import { 
  RoomDTO, 
  ParticipantDTO, 
  QuestionDTO, 
  DifferenceRegion, 
  LeaderboardEntry, 
  WinnerSummary,
  AnswerResult 
} from '../../../shared/types';

interface GameContextType {
  room: RoomDTO | null;
  participant: ParticipantDTO | null;
  currentQuestion: QuestionDTO | null;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  isPaused: boolean;
  score: number;
  foundDifferenceIds: string[];
  foundRegions: DifferenceRegion[];
  lastAnswerResult: AnswerResult | null;
  leaderboard: LeaderboardEntry[];
  winnerSummary: WinnerSummary | null;
  isGameActive: boolean;
  isQuestionEnded: boolean;
  revealedSolutionRegions: DifferenceRegion[];
  submitAnswer: (x: number, y: number, targetImage?: 'A' | 'B') => Promise<AnswerResult | null>;
  setRoom: (r: RoomDTO | null) => void;
  setParticipant: (p: ParticipantDTO | null) => void;
  syncGameState: (roomCode?: string) => Promise<any>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [participant, setParticipant] = useState<ParticipantDTO | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDTO | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [foundDifferenceIds, setFoundDifferenceIds] = useState<string[]>([]);
  const [foundRegions, setFoundRegions] = useState<DifferenceRegion[]>([]);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winnerSummary, setWinnerSummary] = useState<WinnerSummary | null>(null);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isQuestionEnded, setIsQuestionEnded] = useState<boolean>(false);
  const [revealedSolutionRegions, setRevealedSolutionRegions] = useState<DifferenceRegion[]>([]);

  // Ref to always hold latest participant without causing socket effect re-runs
  const participantRef = useRef<ParticipantDTO | null>(null);
  participantRef.current = participant;

  // On mount, restore participant from localStorage if present
  useEffect(() => {
    const savedParticipant = localStorage.getItem('spot_last_participant');
    if (savedParticipant) {
      try {
        const parsed = JSON.parse(savedParticipant);
        setParticipant(parsed);
        setScore(parsed.score || 0);
      } catch (e) {}
    }
  }, []);

  // Request game snapshot from server
  const syncGameState = async (targetRoomCode?: string) => {
    const rCode = targetRoomCode || room?.roomCode || participant?.roomCode || localStorage.getItem('spot_last_room');
    if (!rCode) return null;

    const sId = participantRef.current?.sessionId || localStorage.getItem(`spot_session_${rCode}`);
    const data = await socketService.getGameState(rCode, sId || undefined);

    if (data?.gameState) {
      const gs = data.gameState;
      if (gs.currentQuestion) {
        setCurrentQuestion(gs.currentQuestion);
        setQuestionIndex(gs.currentQuestionIndex);
        setTotalQuestions(gs.totalQuestions);
        setTimeRemaining(gs.timeRemaining);
        setIsPaused(gs.isPaused);
        setIsGameActive(gs.status === 'active');
        if (gs.foundDifferenceIds) {
          setFoundDifferenceIds(gs.foundDifferenceIds);
        }
      }
    }
    if (data?.room) {
      setRoom(data.room);
    }
    if (data?.participant) {
      setParticipant(data.participant);
      setScore(data.participant.score || 0);
    }
    return data;
  };

  useEffect(() => {
    const socket = socketService.getSocket();

    // 1. Question Started
    socket.on('question_started', (data) => {
      console.log('🎮 [Socket] Question started:', data.question.title);
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeLimit);
      setIsPaused(false);
      setIsGameActive(true);
      setIsQuestionEnded(false);
      setFoundDifferenceIds([]);
      setFoundRegions([]);
      setRevealedSolutionRegions([]);
      setLastAnswerResult(null);

      soundManager.playGameStart();
    });

    // 2. Timer Tick
    socket.on('timer_tick', (data) => {
      setTimeRemaining(data.timeRemaining);
      if (data.timeRemaining <= 10 && data.timeRemaining > 0) {
        soundManager.playTick();
      }
    });

    // 3. Question Ended
    socket.on('question_ended', (data) => {
      console.log('🏁 [Socket] Question ended');
      setIsQuestionEnded(true);
      if (data.correctRegions) {
        setRevealedSolutionRegions(data.correctRegions);
      }
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });

    // 4. Pause & Resume
    socket.on('game_paused', () => setIsPaused(true));
    socket.on('game_resumed', (data) => {
      setIsPaused(false);
      setTimeRemaining(data.timeRemaining);
    });

    // 5. Leaderboard Update
    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
      const currentP = participantRef.current;
      if (currentP) {
        const me = data.leaderboard.find(e => e.participantId === currentP.participantId);
        if (me) {
          setScore(me.score);
        }
      }
    });

    // 6. Game Finished
    socket.on('game_finished', (data) => {
      console.log('🏆 [Socket] Game finished, winner:', data.winnerSummary.winner.name);
      setWinnerSummary(data.winnerSummary);
      setIsGameActive(false);
      soundManager.playWinnerFanfare();
    });

    return () => {
      socket.off('question_started');
      socket.off('timer_tick');
      socket.off('question_ended');
      socket.off('game_paused');
      socket.off('game_resumed');
      socket.off('leaderboard_updated');
      socket.off('game_finished');
    };
  }, []);

  // Submit Answer
  const submitAnswer = async (x: number, y: number, targetImage: 'A' | 'B' = 'A'): Promise<AnswerResult | null> => {
    const activeRoomCode = room?.roomCode || participant?.roomCode || localStorage.getItem('spot_last_room') || '';
    const activeSessionId = participant?.sessionId || localStorage.getItem(`spot_session_${activeRoomCode}`) || '';

    if (!activeRoomCode || !activeSessionId || !currentQuestion || isQuestionEnded || isPaused) {
      console.warn('submitAnswer ignored:', {
        activeRoomCode,
        activeSessionId,
        hasQuestion: !!currentQuestion,
        isQuestionEnded,
        isPaused
      });
      return null;
    }

    console.log(`[SubmitAnswer] Room: ${activeRoomCode}, Q: ${currentQuestion.id}, x: ${x.toFixed(1)}%, y: ${y.toFixed(1)}%`);

    const result = await socketService.submitAnswer({
      roomCode: activeRoomCode,
      sessionId: activeSessionId,
      questionId: currentQuestion.id,
      x,
      y,
      clientTimestamp: Date.now(),
      targetImage
    });

    setLastAnswerResult(result);

    if (result.correct) {
      soundManager.playCorrect();
      setScore(result.currentScore);
      if (result.differenceId && !foundDifferenceIds.includes(result.differenceId)) {
        setFoundDifferenceIds(prev => [...prev, result.differenceId!]);
      }
      if (result.region) {
        setFoundRegions(prev => {
          const exists = prev.find(r => r.id === result.region!.id);
          if (exists) return prev;
          return [...prev, result.region!];
        });
      }
    } else {
      soundManager.playWrong();
      setScore(result.currentScore);
    }

    return result;
  };

  return (
    <GameContext.Provider
      value={{
        room,
        participant,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeRemaining,
        isPaused,
        score,
        foundDifferenceIds,
        foundRegions,
        lastAnswerResult,
        leaderboard,
        winnerSummary,
        isGameActive,
        isQuestionEnded,
        revealedSolutionRegions,
        submitAnswer,
        setRoom,
        setParticipant,
        syncGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
