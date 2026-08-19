import { io, Socket } from 'socket.io-client';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  AnswerSubmission, 
  AnswerResult, 
  RoomDTO, 
  ParticipantDTO, 
  GameStateDTO 
} from '../../../shared/types';
import { FALLBACK_SEED_QUESTIONS } from './seedQuestions';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  public connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!this.socket) {
      const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || undefined;
      // Connect to specified backend URL or current host origin
      this.socket = io(BACKEND_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket] Connected to server, ID:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ [Socket] Disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚠️ [Socket] Connection error (using offline fallback if on static host):', err.message);
      });
    }
    return this.socket;
  }

  public getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public joinRoom(
    roomCode: string,
    name: string,
    rollNumber: string,
    sessionId?: string
  ): Promise<{ success: boolean; participant?: ParticipantDTO; gameState?: GameStateDTO; error?: string }> {
    const s = this.getSocket();
    const cleanCode = roomCode.trim().toUpperCase();

    return new Promise((resolve) => {
      let resolved = false;

      // 2.5s Timeout fallback for static hosts without a live backend
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const assignedSession = sessionId || `session_${Date.now()}`;
          const fallbackParticipant: ParticipantDTO = {
            id: `p_${Date.now()}`,
            roomId: cleanCode,
            roomCode: cleanCode,
            name,
            participantId: rollNumber || name,
            sessionId: assignedSession,
            status: 'connected',
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            differencesFoundCount: 0,
            totalTime: 0,
            joinedAt: new Date().toISOString()
          };

          try {
            const raw = localStorage.getItem(`spot_participants_${cleanCode}`);
            const list: ParticipantDTO[] = raw ? JSON.parse(raw) : [];
            if (!list.find(p => p.participantId === fallbackParticipant.participantId)) {
              list.push(fallbackParticipant);
              localStorage.setItem(`spot_participants_${cleanCode}`, JSON.stringify(list));
            }
          } catch (e) {}

          const firstQ = FALLBACK_SEED_QUESTIONS[0];
          resolve({
            success: true,
            participant: fallbackParticipant,
            gameState: {
              roomCode: cleanCode,
              status: 'waiting',
              currentQuestionIndex: 1,
              totalQuestions: FALLBACK_SEED_QUESTIONS.length,
              currentQuestion: {
                id: firstQ.id,
                title: firstQ.title,
                imageA: firstQ.imageA,
                imageB: firstQ.imageB,
                difficulty: firstQ.difficulty,
                timeLimit: firstQ.timeLimit,
                points: firstQ.points,
                totalDifferences: firstQ.totalDifferences
              },
              timeRemaining: firstQ.timeLimit || 30,
              isPaused: false,
              foundDifferenceIds: []
            }
          });
        }
      }, 2500);

      s.emit('join_room', { roomCode: cleanCode, name, rollNumber, sessionId }, (res) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(res);
        }
      });
    });
  }

  public observeRoom(roomCode: string): Promise<any> {
    const s = this.getSocket();
    const cleanCode = roomCode.trim().toUpperCase();

    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            success: true,
            room: {
              id: `room_${cleanCode.toLowerCase()}`,
              roomCode: cleanCode,
              eventName: 'Spot The Errors',
              roundName: 'Round 1',
              status: 'waiting',
              participantCount: 1,
              totalQuestions: FALLBACK_SEED_QUESTIONS.length,
              currentQuestionIndex: 0,
              createdAt: new Date().toISOString()
            },
            participants: [],
            leaderboard: []
          });
        }
      }, 2500);

      s.emit('observe_room' as any, { roomCode: cleanCode }, (res: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(res);
        }
      });
    });
  }

  public getGameState(roomCode: string, sessionId?: string): Promise<any> {
    const s = this.getSocket();
    const cleanCode = roomCode.trim().toUpperCase();

    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const firstQ = FALLBACK_SEED_QUESTIONS[0];
          resolve({
            gameState: {
              roomCode: cleanCode,
              status: 'active',
              currentQuestionIndex: 1,
              totalQuestions: FALLBACK_SEED_QUESTIONS.length,
              currentQuestion: {
                id: firstQ.id,
                title: firstQ.title,
                imageA: firstQ.imageA,
                imageB: firstQ.imageB,
                difficulty: firstQ.difficulty,
                timeLimit: firstQ.timeLimit,
                points: firstQ.points,
                totalDifferences: firstQ.totalDifferences
              },
              timeRemaining: firstQ.timeLimit || 30,
              isPaused: false,
              foundDifferenceIds: []
            }
          });
        }
      }, 2000);

      s.emit('get_game_state' as any, { roomCode: cleanCode, sessionId }, (res: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(res);
        }
      });
    });
  }

  public submitAnswer(submission: AnswerSubmission): Promise<AnswerResult> {
    const s = this.getSocket();

    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;

          // Local offline hit-testing fallback
          const targetQ = FALLBACK_SEED_QUESTIONS.find(q => q.id === submission.questionId) || FALLBACK_SEED_QUESTIONS[0];
          const TOLERANCE = 5.0;
          let matched = null;

          for (const region of (targetQ.differenceRegions || [])) {
            const minX = region.x - region.width / 2 - TOLERANCE;
            const maxX = region.x + region.width / 2 + TOLERANCE;
            const minY = region.y - region.height / 2 - TOLERANCE;
            const maxY = region.y + region.height / 2 + TOLERANCE;

            if (submission.x >= minX && submission.x <= maxX && submission.y >= minY && submission.y <= maxY) {
              matched = region;
              break;
            }
          }

          if (matched) {
            resolve({
              correct: true,
              differenceId: matched.id,
              differenceName: matched.name,
              region: matched,
              scoreGained: 10,
              currentScore: 10,
              differencesFoundCount: 1,
              totalDifferences: targetQ.totalDifferences,
              message: `Spot on! +10 pts`
            });
          } else {
            resolve({
              correct: false,
              scoreGained: 0,
              currentScore: 0,
              differencesFoundCount: 0,
              totalDifferences: targetQ.totalDifferences,
              message: `No difference here!`
            });
          }
        }
      }, 2000);

      s.emit('submit_answer', submission, (res) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(res);
        }
      });
    });
  }

  public startGame(roomCode: string) {
    this.getSocket().emit('start_game', { roomCode });
  }

  public pauseGame(roomCode: string) {
    this.getSocket().emit('pause_game', { roomCode });
  }

  public resumeGame(roomCode: string) {
    this.getSocket().emit('resume_game', { roomCode });
  }

  public nextQuestion(roomCode: string) {
    this.getSocket().emit('next_question', { roomCode });
  }

  public restartQuestion(roomCode: string) {
    this.getSocket().emit('restart_question', { roomCode });
  }

  public endGame(roomCode: string) {
    this.getSocket().emit('end_game', { roomCode });
  }

  public kickParticipant(roomCode: string, participantId: string) {
    this.getSocket().emit('kick_participant', { roomCode, participantId });
  }

  public addDemoParticipants(roomCode: string, count: number = 10) {
    this.getSocket().emit('add_demo_participants', { roomCode, count });
  }
}

export const socketService = new SocketService();
