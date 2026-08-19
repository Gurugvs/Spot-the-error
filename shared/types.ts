export type GameStatus = 'waiting' | 'active' | 'paused' | 'ended';
export type RoomStatus = 'waiting' | 'active' | 'paused' | 'completed' | 'closed';
export type ParticipantStatus = 'connected' | 'answering' | 'finished' | 'disconnected';

export interface DifferenceRegion {
  id: string;
  name: string; // e.g. "Missing Cloud", "Changed Car Color"
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
  imageTarget?: 'A' | 'B' | 'both'; // defaults to both if participant taps either
}

export interface QuestionDTO {
  id: string;
  title: string;
  imageA: string;
  imageB: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds
  points: number; // points per difference
  totalDifferences: number;
  // NOTE: differenceRegions are kept on server only during live game!
  differenceRegions?: DifferenceRegion[];
}

export interface RoomSettings {
  eventName: string;
  roundName: string;
  maxParticipants: number;
  timePerQuestion: number;
  pointsPerDifference: number;
  negativeMarking: number; // e.g. 0 or 2
  fastestAnswerBonus: number; // e.g. 5
  showLeaderboardDuringGame: boolean;
  showCorrectAnswersAfterQuestion: boolean;
  allowLateJoin: boolean;
  soundEffects: boolean;
}

export interface RoomDTO {
  id: string;
  roomCode: string;
  eventName: string;
  roundName: string;
  status: RoomStatus;
  settings: RoomSettings;
  participantCount: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  createdAt: string;
}

export interface ParticipantDTO {
  id: string;
  roomId: string;
  roomCode?: string;
  name: string;
  participantId: string; // Roll number or ID
  sessionId: string;
  status: ParticipantStatus;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  differencesFoundCount: number;
  totalTime: number; // in seconds
  rank?: number;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface AnswerSubmission {
  roomCode: string;
  sessionId: string;
  questionId: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  clientTimestamp: number;
  targetImage?: 'A' | 'B';
}

export interface AnswerResult {
  correct: boolean;
  differenceId?: string;
  differenceName?: string;
  region?: DifferenceRegion;
  scoreGained: number;
  currentScore: number;
  differencesFoundCount: number;
  totalDifferences: number;
  message?: string;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  rollNumber: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTime: number; // in seconds
  status: ParticipantStatus;
  differencesFoundInCurrentQuestion?: number;
}

export interface GameStateDTO {
  roomCode: string;
  status: GameStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: QuestionDTO | null;
  timeRemaining: number;
  isPaused: boolean;
  startedAt?: string;
  leaderboard?: LeaderboardEntry[];
  foundDifferenceIds?: string[]; // IDs the current participant has already found for current question
}

export interface WinnerSummary {
  winner: LeaderboardEntry;
  runnerUp?: LeaderboardEntry;
  secondRunnerUp?: LeaderboardEntry;
  allRankings: LeaderboardEntry[];
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  completedAt: string;
}

export interface AnalyticsData {
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  averageCompletionTime: number;
  easiestQuestion: { title: string; accuracy: number };
  mostDifficultQuestion: { title: string; accuracy: number };
  scoreDistribution: { scoreRange: string; count: number }[];
  questionAccuracy: { question: string; accuracy: number; avgTime: number }[];
  timelineData: { time: string; averageScore: number }[];
}

// Socket IO Event payload signatures
export interface ServerToClientEvents {
  room_created: (data: { room: RoomDTO }) => void;
  room_state: (data: { room: RoomDTO; participants: ParticipantDTO[]; gameState: GameStateDTO }) => void;
  participant_joined: (data: { participant: ParticipantDTO; totalCount: number }) => void;
  participant_left: (data: { participantId: string; name: string; totalCount: number }) => void;
  participant_status_updated: (data: { participantId: string; status: ParticipantStatus; differencesFound?: number }) => void;
  participant_kicked: (data: { participantId: string; reason?: string }) => void;
  game_started: (data: { gameState: GameStateDTO }) => void;
  question_started: (data: { question: QuestionDTO; questionIndex: number; totalQuestions: number; timeLimit: number }) => void;
  timer_tick: (data: { timeRemaining: number }) => void;
  answer_result: (data: AnswerResult) => void;
  question_ended: (data: { correctRegions: DifferenceRegion[]; leaderboard?: LeaderboardEntry[] }) => void;
  game_paused: () => void;
  game_resumed: (data: { timeRemaining: number }) => void;
  leaderboard_updated: (data: { leaderboard: LeaderboardEntry[] }) => void;
  game_finished: (data: { winnerSummary: WinnerSummary }) => void;
  error_message: (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { settings: RoomSettings; questionIds?: string[] }, callback: (res: { success: boolean; room?: RoomDTO; error?: string }) => void) => void;
  join_room: (data: { roomCode: string; name: string; rollNumber: string; sessionId?: string }, callback: (res: { success: boolean; participant?: ParticipantDTO; gameState?: GameStateDTO; error?: string }) => void) => void;
  start_game: (data: { roomCode: string }) => void;
  pause_game: (data: { roomCode: string }) => void;
  resume_game: (data: { roomCode: string }) => void;
  next_question: (data: { roomCode: string }) => void;
  restart_question: (data: { roomCode: string }) => void;
  end_game: (data: { roomCode: string }) => void;
  submit_answer: (data: AnswerSubmission, callback?: (res: AnswerResult) => void) => void;
  kick_participant: (data: { roomCode: string; participantId: string }) => void;
  add_demo_participants: (data: { roomCode: string; count?: number }) => void;
}
