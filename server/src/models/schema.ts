import mongoose, { Schema, Document } from 'mongoose';
import { DifferenceRegion, RoomSettings, RoomStatus, ParticipantStatus, GameStatus } from '../../../shared/types';

// Organizer Schema
export interface IOrganizer extends Document {
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export const OrganizerSchema = new Schema<IOrganizer>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'organizer' },
  createdAt: { type: Date, default: Date.now },
});

export const OrganizerModel = mongoose.model<IOrganizer>('Organizer', OrganizerSchema);

// Question Schema
export interface IQuestion {
  _id?: string;
  title: string;
  imageA: string;
  imageB: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
  differenceRegions: DifferenceRegion[];
  createdAt: Date;
}

export const QuestionSchema = new Schema<IQuestion>({
  _id: { type: String },
  title: { type: String, required: true },
  imageA: { type: String, required: true },
  imageB: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  timeLimit: { type: Number, default: 30 },
  points: { type: Number, default: 10 },
  differenceRegions: [{
    id: String,
    name: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    imageTarget: { type: String, default: 'both' }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const QuestionModel = mongoose.model<IQuestion>('Question', QuestionSchema);

// Room Schema
export interface IRoom extends Document {
  roomCode: string;
  eventName: string;
  roundName: string;
  status: RoomStatus;
  settings: RoomSettings;
  questionIds: string[];
  currentQuestionIndex: number;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export const RoomSchema = new Schema<IRoom>({
  roomCode: { type: String, required: true, unique: true, uppercase: true },
  eventName: { type: String, required: true },
  roundName: { type: String, default: 'Round 1' },
  status: { type: String, enum: ['waiting', 'active', 'paused', 'completed', 'closed'], default: 'waiting' },
  settings: {
    eventName: String,
    roundName: String,
    maxParticipants: { type: Number, default: 100 },
    timePerQuestion: { type: Number, default: 30 },
    pointsPerDifference: { type: Number, default: 10 },
    negativeMarking: { type: Number, default: 0 },
    fastestAnswerBonus: { type: Number, default: 5 },
    showLeaderboardDuringGame: { type: Boolean, default: true },
    showCorrectAnswersAfterQuestion: { type: Boolean, default: true },
    allowLateJoin: { type: Boolean, default: false },
    soundEffects: { type: Boolean, default: true },
  },
  questionIds: [{ type: String }],
  currentQuestionIndex: { type: Number, default: 0 },
  createdBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  endedAt: Date,
});

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);

// Participant Schema
export interface IParticipant extends Document {
  roomId: string;
  roomCode: string;
  name: string;
  participantId: string;
  sessionId: string;
  status: ParticipantStatus;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTime: number;
  joinedAt: Date;
  lastConnectedAt: Date;
}

export const ParticipantSchema = new Schema<IParticipant>({
  roomId: { type: String, required: true },
  roomCode: { type: String, required: true },
  name: { type: String, required: true },
  participantId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['connected', 'answering', 'finished', 'disconnected'], default: 'connected' },
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  lastConnectedAt: { type: Date, default: Date.now },
});

export const ParticipantModel = mongoose.model<IParticipant>('Participant', ParticipantSchema);

// Answer Schema
export interface IAnswer extends Document {
  roomCode: string;
  participantId: string;
  sessionId: string;
  questionId: string;
  x: number;
  y: number;
  correct: boolean;
  differenceId?: string;
  timeTaken: number;
  scoreGained: number;
  timestamp: Date;
}

export const AnswerSchema = new Schema<IAnswer>({
  roomCode: { type: String, required: true },
  participantId: { type: String, required: true },
  sessionId: { type: String, required: true },
  questionId: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  correct: { type: Boolean, required: true },
  differenceId: String,
  timeTaken: { type: Number, default: 0 },
  scoreGained: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

export const AnswerModel = mongoose.model<IAnswer>('Answer', AnswerSchema);

// Result Schema
export interface IResult extends Document {
  roomCode: string;
  participantId: string;
  name: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTime: number;
  rank: number;
  createdAt: Date;
}

export const ResultSchema = new Schema<IResult>({
  roomCode: { type: String, required: true },
  participantId: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  totalTime: { type: Number, required: true },
  rank: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ResultModel = mongoose.model<IResult>('Result', ResultSchema);
