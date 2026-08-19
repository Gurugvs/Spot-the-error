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

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  public connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!this.socket) {
      // Connect to current host origin or proxy
      this.socket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket] Connected to server, ID:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ [Socket] Disconnected:', reason);
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
    return new Promise((resolve) => {
      s.emit('join_room', { roomCode, name, rollNumber, sessionId }, (res) => {
        resolve(res);
      });
    });
  }

  public observeRoom(roomCode: string): Promise<any> {
    const s = this.getSocket();
    return new Promise((resolve) => {
      s.emit('observe_room' as any, { roomCode }, (res: any) => {
        resolve(res);
      });
    });
  }

  public getGameState(roomCode: string, sessionId?: string): Promise<any> {
    const s = this.getSocket();
    return new Promise((resolve) => {
      s.emit('get_game_state' as any, { roomCode, sessionId }, (res: any) => {
        resolve(res);
      });
    });
  }

  public submitAnswer(submission: AnswerSubmission): Promise<AnswerResult> {
    const s = this.getSocket();
    return new Promise((resolve) => {
      s.emit('submit_answer', submission, (res) => {
        resolve(res);
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
