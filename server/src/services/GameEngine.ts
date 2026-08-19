import { Server } from 'socket.io';
import { 
  store, 
  StoredParticipant, 
  StoredQuestion, 
  StoredRoom 
} from '../models/store';
import { 
  AnswerResult, 
  AnswerSubmission, 
  DifferenceRegion, 
  LeaderboardEntry, 
  WinnerSummary,
  QuestionDTO 
} from '../../../shared/types';

export interface ActiveGameSession {
  roomCode: string;
  currentQuestionIndex: number;
  timeRemaining: number;
  timerInterval: NodeJS.Timeout | null;
  isPaused: boolean;
  questionStartTime: number;
  questionActive: boolean;
  questions: StoredQuestion[];
  foundDifferencesByParticipant: Map<string, Set<string>>; // sessionId -> Set of differenceIds found for this question
  tapTimestamps: Map<string, number[]>; // sessionId -> rate-limiting tap timestamps
}

export class GameEngine {
  private static instance: GameEngine;
  private activeGames: Map<string, ActiveGameSession> = new Map();
  private io: Server | null = null;

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public setSocketServer(io: Server) {
    this.io = io;
  }

  // Start game for a room
  public async startGame(roomCode: string): Promise<boolean> {
    const code = roomCode.toUpperCase();
    const room = await store.getRoom(code);
    if (!room) return false;

    // Fetch questions for this room
    let questions: StoredQuestion[] = [];
    if (room.questionIds && room.questionIds.length > 0) {
      for (const qId of room.questionIds) {
        const q = await store.getQuestionById(qId);
        if (q) questions.push(q);
      }
    }
    if (questions.length === 0) {
      questions = await store.getAllQuestions();
    }

    if (questions.length === 0) {
      throw new Error('No questions available to start the game.');
    }

    // Reset participant scores and stats
    const participants = await store.getParticipantsByRoom(code);
    for (const p of participants) {
      p.score = 0;
      p.correctAnswers = 0;
      p.wrongAnswers = 0;
      p.totalTime = 0;
      p.differencesFound = {};
      p.status = 'connected';
      await store.addParticipant(p);
    }

    await store.updateRoom(code, {
      status: 'active',
      currentQuestionIndex: 0,
      startedAt: new Date().toISOString()
    });

    const session: ActiveGameSession = {
      roomCode: code,
      currentQuestionIndex: 0,
      timeRemaining: questions[0].timeLimit || room.settings.timePerQuestion || 30,
      timerInterval: null,
      isPaused: false,
      questionStartTime: Date.now(),
      questionActive: false,
      questions,
      foundDifferencesByParticipant: new Map(),
      tapTimestamps: new Map()
    };

    this.activeGames.set(code, session);
    this.startQuestion(code, 0);

    return true;
  }

  // Start a specific question
  public async startQuestion(roomCode: string, questionIndex: number) {
    const session = this.activeGames.get(roomCode.toUpperCase());
    if (!session) return;

    if (session.timerInterval) {
      clearInterval(session.timerInterval);
      session.timerInterval = null;
    }

    if (questionIndex >= session.questions.length) {
      await this.endGame(roomCode);
      return;
    }

    session.currentQuestionIndex = questionIndex;
    const currentQ = session.questions[questionIndex];
    session.timeRemaining = currentQ.timeLimit || 30;
    session.questionStartTime = Date.now();
    session.questionActive = true;
    session.foundDifferencesByParticipant.clear();
    session.tapTimestamps.clear();

    await store.updateRoom(roomCode, { currentQuestionIndex: questionIndex });

    // Mark all connected participants as answering
    const participants = await store.getParticipantsByRoom(roomCode);
    for (const p of participants) {
      if (p.status !== 'disconnected') {
        p.status = 'answering';
      }
    }

    // Sanitize question payload: STRIP DIFFERENCE REGIONS for participants security!
    const sanitizedQuestion: QuestionDTO = {
      id: currentQ.id,
      title: currentQ.title,
      imageA: currentQ.imageA,
      imageB: currentQ.imageB,
      difficulty: currentQ.difficulty,
      timeLimit: session.timeRemaining,
      points: currentQ.points,
      totalDifferences: currentQ.totalDifferences
    };

    const uppercaseCode = roomCode.toUpperCase();

    // Broadcast question_started
    if (this.io) {
      this.io.to(uppercaseCode).emit('question_started', {
        question: sanitizedQuestion,
        questionIndex: questionIndex + 1,
        totalQuestions: session.questions.length,
        timeLimit: session.timeRemaining
      });
    }

    // Start 1-second server authoritative tick
    session.timerInterval = setInterval(async () => {
      if (session.isPaused) return;

      session.timeRemaining--;
      if (this.io) {
        this.io.to(uppercaseCode).emit('timer_tick', { timeRemaining: Math.max(0, session.timeRemaining) });
      }

      if (session.timeRemaining <= 0) {
        if (session.timerInterval) clearInterval(session.timerInterval);
        session.timerInterval = null;
        await this.endQuestion(uppercaseCode);
      }
    }, 1000);
  }

  // Validate participant answer submission
  public async handleAnswerSubmission(submission: AnswerSubmission): Promise<AnswerResult> {
    const code = submission.roomCode.toUpperCase();
    const session = this.activeGames.get(code);

    if (!session || !session.questionActive || session.isPaused) {
      return {
        correct: false,
        scoreGained: 0,
        currentScore: 0,
        differencesFoundCount: 0,
        totalDifferences: 0,
        message: 'Question is not currently active.'
      };
    }

    const participant = await store.getParticipantBySession(submission.sessionId);
    if (!participant) {
      return {
        correct: false,
        scoreGained: 0,
        currentScore: 0,
        differencesFoundCount: 0,
        totalDifferences: 0,
        message: 'Participant session not found.'
      };
    }

    // Anti-Cheat: Rate limiting (max 4 taps per second)
    const now = Date.now();
    const recentTaps = session.tapTimestamps.get(submission.sessionId) || [];
    const filteredTaps = recentTaps.filter(t => now - t < 1000);
    if (filteredTaps.length >= 4) {
      return {
        correct: false,
        scoreGained: 0,
        currentScore: participant.score,
        differencesFoundCount: (session.foundDifferencesByParticipant.get(submission.sessionId) || new Set()).size,
        totalDifferences: session.questions[session.currentQuestionIndex].totalDifferences,
        message: 'Too fast! Tap carefully.'
      };
    }
    filteredTaps.push(now);
    session.tapTimestamps.set(submission.sessionId, filteredTaps);

    const currentQ = session.questions[session.currentQuestionIndex];
    if (currentQ.id !== submission.questionId) {
      return {
        correct: false,
        scoreGained: 0,
        currentScore: participant.score,
        differencesFoundCount: (session.foundDifferencesByParticipant.get(submission.sessionId) || new Set()).size,
        totalDifferences: currentQ.totalDifferences,
        message: 'Question mismatch.'
      };
    }

    const room = await store.getRoom(code);
    const settings = room?.settings || {
      pointsPerDifference: 10,
      negativeMarking: 0,
      fastestAnswerBonus: 5
    };

    // Get set of differences found by this participant for this question
    let foundSet = session.foundDifferencesByParticipant.get(submission.sessionId);
    if (!foundSet) {
      foundSet = new Set<string>();
      session.foundDifferencesByParticipant.set(submission.sessionId, foundSet);
    }

    const timeTakenForThisAnswer = Math.max(0.1, (now - session.questionStartTime) / 1000);

    // Hit Detection Algorithm:
    // Check if (submission.x, submission.y) is within any differenceRegion bounding box
    // with a generous 4.5% touch tolerance for small mobile screens.
    const TOLERANCE = 4.5;
    let matchedRegion: DifferenceRegion | null = null;

    for (const region of currentQ.differenceRegions) {
      // Bounding box bounds (centered at x, y or spanning [x - w/2, x + w/2])
      const halfW = (region.width / 2) + TOLERANCE;
      const halfH = (region.height / 2) + TOLERANCE;

      const minX = region.x - halfW;
      const maxX = region.x + halfW;
      const minY = region.y - halfH;
      const maxY = region.y + halfH;

      if (
        submission.x >= minX &&
        submission.x <= maxX &&
        submission.y >= minY &&
        submission.y <= maxY
      ) {
        matchedRegion = region;
        break;
      }
    }

    if (matchedRegion) {
      // Check if already found by this participant
      if (foundSet.has(matchedRegion.id)) {
        return {
          correct: false,
          scoreGained: 0,
          currentScore: participant.score,
          differencesFoundCount: foundSet.size,
          totalDifferences: currentQ.totalDifferences,
          message: 'You already spotted this difference!'
        };
      }

      // Valid new difference found!
      foundSet.add(matchedRegion.id);

      // Calculate score with fastest answer bonus
      let points = currentQ.points || settings.pointsPerDifference || 10;
      if (timeTakenForThisAnswer <= 5 && settings.fastestAnswerBonus > 0) {
        points += settings.fastestAnswerBonus;
      }

      participant.score += points;
      participant.correctAnswers += 1;
      participant.totalTime += timeTakenForThisAnswer;
      participant.lastActiveTimestamp = now;

      // Update participant records
      if (!participant.differencesFound) participant.differencesFound = {};
      if (!participant.differencesFound[currentQ.id]) participant.differencesFound[currentQ.id] = [];
      participant.differencesFound[currentQ.id].push(matchedRegion.id);

      if (foundSet.size >= currentQ.totalDifferences) {
        participant.status = 'finished';
      } else {
        participant.status = 'answering';
      }

      await store.addParticipant(participant);

      // Record answer
      await store.saveAnswer({
        id: `${participant.sessionId}-${currentQ.id}-${matchedRegion.id}`,
        roomCode: code,
        sessionId: participant.sessionId,
        participantId: participant.participantId,
        questionId: currentQ.id,
        x: submission.x,
        y: submission.y,
        correct: true,
        differenceId: matchedRegion.id,
        timeTaken: timeTakenForThisAnswer,
        scoreGained: points,
        timestamp: new Date().toISOString()
      });

      // Broadcast real-time participant progress update to organizer & presentation mode
      if (this.io) {
        this.io.to(code).emit('participant_status_updated', {
          participantId: participant.participantId,
          status: participant.status,
          differencesFound: foundSet.size
        });

        // Broadcast updated leaderboard if enabled
        const leaderboard = await this.getLeaderboard(code);
        this.io.to(code).emit('leaderboard_updated', { leaderboard });
      }

      return {
        correct: true,
        differenceId: matchedRegion.id,
        differenceName: matchedRegion.name,
        region: matchedRegion,
        scoreGained: points,
        currentScore: participant.score,
        differencesFoundCount: foundSet.size,
        totalDifferences: currentQ.totalDifferences,
        message: `Spot on! +${points} pts`
      };
    } else {
      // Wrong Tap
      const penalty = settings.negativeMarking || 0;
      participant.wrongAnswers += 1;
      participant.score = Math.max(0, participant.score - penalty);
      participant.totalTime += timeTakenForThisAnswer;
      participant.lastActiveTimestamp = now;
      await store.addParticipant(participant);

      await store.saveAnswer({
        id: `${participant.sessionId}-${currentQ.id}-wrong-${now}`,
        roomCode: code,
        sessionId: participant.sessionId,
        participantId: participant.participantId,
        questionId: currentQ.id,
        x: submission.x,
        y: submission.y,
        correct: false,
        timeTaken: timeTakenForThisAnswer,
        scoreGained: -penalty,
        timestamp: new Date().toISOString()
      });

      if (this.io) {
        const leaderboard = await this.getLeaderboard(code);
        this.io.to(code).emit('leaderboard_updated', { leaderboard });
      }

      return {
        correct: false,
        scoreGained: -penalty,
        currentScore: participant.score,
        differencesFoundCount: foundSet.size,
        totalDifferences: currentQ.totalDifferences,
        message: penalty > 0 ? `No difference here! -${penalty} pts` : 'No difference here. Try again!'
      };
    }
  }

  // End active question and display solution regions
  public async endQuestion(roomCode: string) {
    const session = this.activeGames.get(roomCode.toUpperCase());
    if (!session) return;

    session.questionActive = false;
    if (session.timerInterval) {
      clearInterval(session.timerInterval);
      session.timerInterval = null;
    }

    const currentQ = session.questions[session.currentQuestionIndex];
    const leaderboard = await this.getLeaderboard(roomCode);

    // Send question_ended with correct regions for organizers and participants
    if (this.io) {
      this.io.to(roomCode).emit('question_ended', {
        correctRegions: currentQ.differenceRegions,
        leaderboard
      });
    }
  }

  // Next question
  public async nextQuestion(roomCode: string) {
    const session = this.activeGames.get(roomCode.toUpperCase());
    if (!session) return;
    await this.startQuestion(roomCode, session.currentQuestionIndex + 1);
  }

  // Restart current question
  public async restartQuestion(roomCode: string) {
    const session = this.activeGames.get(roomCode.toUpperCase());
    if (!session) return;
    await this.startQuestion(roomCode, session.currentQuestionIndex);
  }

  // Pause game
  public pauseGame(roomCode: string) {
    const session = this.activeGames.get(roomCode.toUpperCase());
    if (!session) return;
    session.isPaused = true;
    if (this.io) {
      this.io.to(roomCode).emit('game_paused');
    }
  }

  // Resume game
  public resumeGame(roomCode: string) {
    const session = this.activeGames.get(roomCode.toUpperCase());
    if (!session) return;
    session.isPaused = false;
    if (this.io) {
      this.io.to(roomCode).emit('game_resumed', { timeRemaining: session.timeRemaining });
    }
  }

  // End full game & compute 4-tier tie-breaker rankings
  public async endGame(roomCode: string): Promise<WinnerSummary | null> {
    const code = roomCode.toUpperCase();
    const session = this.activeGames.get(code);

    if (session?.timerInterval) {
      clearInterval(session.timerInterval);
      session.timerInterval = null;
    }

    await store.updateRoom(code, {
      status: 'completed',
      endedAt: new Date().toISOString()
    });

    const leaderboard = await this.getLeaderboard(code);
    if (leaderboard.length === 0) return null;

    const totalParticipants = leaderboard.length;
    const scores = leaderboard.map(l => l.score);
    const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalParticipants) * 10) / 10;
    const highestScore = Math.max(...scores, 0);

    const winnerSummary: WinnerSummary = {
      winner: leaderboard[0],
      runnerUp: leaderboard.length > 1 ? leaderboard[1] : undefined,
      secondRunnerUp: leaderboard.length > 2 ? leaderboard[2] : undefined,
      allRankings: leaderboard,
      totalParticipants,
      averageScore,
      highestScore,
      completedAt: new Date().toISOString()
    };

    await store.saveWinnerSummary(code, winnerSummary);

    if (this.io) {
      this.io.to(code).emit('game_finished', { winnerSummary });
    }

    this.activeGames.delete(code);
    return winnerSummary;
  }

  // Authoritative Leaderboard Ranking with 4-Tier Tie-Breaker Algorithm
  public async getLeaderboard(roomCode: string): Promise<LeaderboardEntry[]> {
    const participants = await store.getParticipantsByRoom(roomCode);
    const session = this.activeGames.get(roomCode.toUpperCase());

    // Sort participants according to competition tie-breaker rules:
    // 1. Primary: Highest Score
    // 2. 1st Tie-Breaker: Lowest Total Time
    // 3. 2nd Tie-Breaker: Most Correct Answers
    // 4. 3rd Tie-Breaker: Earliest Submission Timestamp
    const sorted = [...participants].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;
      if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
      return (a.lastActiveTimestamp || 0) - (b.lastActiveTimestamp || 0);
    });

    return sorted.map((p, idx) => {
      const foundCount = session
        ? (session.foundDifferencesByParticipant.get(p.sessionId) || new Set()).size
        : 0;

      return {
        rank: idx + 1,
        participantId: p.participantId,
        name: p.name,
        rollNumber: p.participantId,
        score: p.score,
        correctAnswers: p.correctAnswers,
        wrongAnswers: p.wrongAnswers,
        totalTime: Math.round(p.totalTime * 10) / 10,
        status: p.status,
        differencesFoundInCurrentQuestion: foundCount
      };
    });
  }

  // Disconnection recovery: return current snapshot for participant
  public async getParticipantGameState(sessionId: string) {
    const participant = await store.getParticipantBySession(sessionId);
    if (!participant) return null;

    const room = await store.getRoom(participant.roomCode);
    if (!room) return null;

    const session = this.activeGames.get(participant.roomCode);
    let currentQuestion: QuestionDTO | null = null;
    let foundIds: string[] = [];

    if (session && session.questions && session.questions[session.currentQuestionIndex]) {
      const q = session.questions[session.currentQuestionIndex];
      currentQuestion = {
        id: q.id,
        title: q.title,
        imageA: q.imageA,
        imageB: q.imageB,
        difficulty: q.difficulty,
        timeLimit: session.timeRemaining,
        points: q.points,
        totalDifferences: q.totalDifferences
      };

      const set = session.foundDifferencesByParticipant.get(sessionId);
      if (set) foundIds = Array.from(set);
    }

    return {
      room,
      participant,
      gameState: {
        roomCode: room.roomCode,
        status: room.status as any,
        currentQuestionIndex: session ? session.currentQuestionIndex + 1 : 0,
        totalQuestions: session ? session.questions.length : (room.questionIds.length || 3),
        currentQuestion,
        timeRemaining: session ? session.timeRemaining : 0,
        isPaused: session ? session.isPaused : false,
        foundDifferenceIds: foundIds
      }
    };
  }
}

export const gameEngine = GameEngine.getInstance();
