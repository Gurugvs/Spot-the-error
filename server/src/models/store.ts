import { v4 as uuidv4 } from 'uuid';
import { 
  RoomDTO, 
  ParticipantDTO, 
  QuestionDTO, 
  DifferenceRegion, 
  RoomSettings, 
  LeaderboardEntry,
  WinnerSummary,
  AnalyticsData 
} from '../../../shared/types';
import { isMongoConnected } from '../db';
import { 
  RoomModel, 
  ParticipantModel, 
  QuestionModel, 
  AnswerModel, 
  ResultModel, 
  OrganizerModel 
} from './schema';

export interface StoredQuestion {
  id: string;
  title: string;
  imageA: string;
  imageB: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
  totalDifferences: number;
  differenceRegions: DifferenceRegion[];
  createdAt: string;
}

export interface StoredParticipant {
  id: string;
  roomId: string;
  roomCode: string;
  name: string;
  participantId: string; // Roll number
  sessionId: string;
  status: 'connected' | 'answering' | 'finished' | 'disconnected';
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  differencesFound: Record<string, string[]>; // questionId -> array of differenceIds found
  totalTime: number; // in seconds
  lastActiveTimestamp: number;
  joinedAt: string;
  rank?: number;
}

export interface StoredRoom {
  id: string;
  roomCode: string;
  eventName: string;
  roundName: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'closed';
  settings: RoomSettings;
  questionIds: string[];
  currentQuestionIndex: number;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface StoredAnswer {
  id: string;
  roomCode: string;
  sessionId: string;
  participantId: string;
  questionId: string;
  x: number;
  y: number;
  correct: boolean;
  differenceId?: string;
  timeTaken: number;
  scoreGained: number;
  timestamp: string;
}

// In-Memory Master Store
class MemoryStore {
  questions: Map<string, StoredQuestion> = new Map();
  rooms: Map<string, StoredRoom> = new Map(); // key = roomCode
  participants: Map<string, StoredParticipant> = new Map(); // key = sessionId
  answers: StoredAnswer[] = [];
  results: Map<string, WinnerSummary> = new Map(); // key = roomCode
  organizers: Map<string, { username: string; passwordHash: string }> = new Map();

  // Questions
  async getAllQuestions(): Promise<StoredQuestion[]> {
    if (isMongoConnected) {
      try {
        const docs = await QuestionModel.find().lean();
        if (docs.length > 0) {
          return docs.map(d => ({
            id: d._id.toString(),
            title: d.title,
            imageA: d.imageA,
            imageB: d.imageB,
            difficulty: d.difficulty as any,
            timeLimit: d.timeLimit,
            points: d.points,
            totalDifferences: d.differenceRegions.length,
            differenceRegions: d.differenceRegions as any,
            createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString()
          }));
        }
      } catch (err) {
        console.error('Mongo read questions error', err);
      }
    }
    return Array.from(this.questions.values());
  }

  async getQuestionById(id: string): Promise<StoredQuestion | undefined> {
    if (isMongoConnected) {
      try {
        const doc = await QuestionModel.findById(id).lean();
        if (doc) {
          return {
            id: doc._id.toString(),
            title: doc.title,
            imageA: doc.imageA,
            imageB: doc.imageB,
            difficulty: doc.difficulty as any,
            timeLimit: doc.timeLimit,
            points: doc.points,
            totalDifferences: doc.differenceRegions.length,
            differenceRegions: doc.differenceRegions as any,
            createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString()
          };
        }
      } catch (err) {
        // fallback
      }
    }
    return this.questions.get(id);
  }

  async saveQuestion(q: Omit<StoredQuestion, 'id' | 'createdAt'> & { id?: string }): Promise<StoredQuestion> {
    const id = q.id || uuidv4();
    const stored: StoredQuestion = {
      ...q,
      id,
      totalDifferences: q.differenceRegions.length,
      createdAt: new Date().toISOString()
    };
    this.questions.set(id, stored);

    if (isMongoConnected) {
      try {
        await QuestionModel.findByIdAndUpdate(id, {
          title: stored.title,
          imageA: stored.imageA,
          imageB: stored.imageB,
          difficulty: stored.difficulty,
          timeLimit: stored.timeLimit,
          points: stored.points,
          differenceRegions: stored.differenceRegions
        }, { upsert: true });
      } catch (err) {
        console.error('Mongo save question err', err);
      }
    }

    return stored;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    this.questions.delete(id);
    if (isMongoConnected) {
      try {
        await QuestionModel.findByIdAndDelete(id);
      } catch (err) {
        console.error('Mongo delete question err', err);
      }
    }
    return true;
  }

  // Rooms
  async createRoom(room: StoredRoom): Promise<StoredRoom> {
    this.rooms.set(room.roomCode.toUpperCase(), room);
    if (isMongoConnected) {
      try {
        await RoomModel.create({
          roomCode: room.roomCode.toUpperCase(),
          eventName: room.eventName,
          roundName: room.roundName,
          status: room.status,
          settings: room.settings,
          questionIds: room.questionIds,
          currentQuestionIndex: room.currentQuestionIndex,
          createdBy: room.createdBy,
          createdAt: new Date(room.createdAt)
        });
      } catch (err) {
        console.error('Mongo create room err', err);
      }
    }
    return room;
  }

  async getRoom(roomCode: string): Promise<StoredRoom | undefined> {
    const code = roomCode.toUpperCase();
    if (this.rooms.has(code)) return this.rooms.get(code);

    if (isMongoConnected) {
      try {
        const doc = await RoomModel.findOne({ roomCode: code }).lean();
        if (doc) {
          const r: StoredRoom = {
            id: doc._id.toString(),
            roomCode: doc.roomCode,
            eventName: doc.eventName,
            roundName: doc.roundName,
            status: doc.status as any,
            settings: doc.settings as any,
            questionIds: doc.questionIds || [],
            currentQuestionIndex: doc.currentQuestionIndex || 0,
            createdBy: doc.createdBy,
            createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
            startedAt: doc.startedAt ? doc.startedAt.toISOString() : undefined,
            endedAt: doc.endedAt ? doc.endedAt.toISOString() : undefined
          };
          this.rooms.set(code, r);
          return r;
        }
      } catch (err) {
        // fallback
      }
    }
    return undefined;
  }

  async updateRoom(roomCode: string, updates: Partial<StoredRoom>): Promise<StoredRoom | undefined> {
    const code = roomCode.toUpperCase();
    const existing = await this.getRoom(code);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.rooms.set(code, updated);

    if (isMongoConnected) {
      try {
        await RoomModel.findOneAndUpdate({ roomCode: code }, updates);
      } catch (err) {
        console.error('Mongo update room err', err);
      }
    }
    return updated;
  }

  async getAllRooms(): Promise<StoredRoom[]> {
    return Array.from(this.rooms.values());
  }

  // Participants
  async addParticipant(p: StoredParticipant): Promise<StoredParticipant> {
    this.participants.set(p.sessionId, p);
    if (isMongoConnected) {
      try {
        await ParticipantModel.findOneAndUpdate(
          { sessionId: p.sessionId },
          {
            roomId: p.roomId,
            roomCode: p.roomCode,
            name: p.name,
            participantId: p.participantId,
            sessionId: p.sessionId,
            status: p.status,
            score: p.score,
            correctAnswers: p.correctAnswers,
            wrongAnswers: p.wrongAnswers,
            totalTime: p.totalTime,
            joinedAt: new Date(p.joinedAt),
            lastConnectedAt: new Date()
          },
          { upsert: true }
        );
      } catch (err) {
        console.error('Mongo add participant err', err);
      }
    }
    return p;
  }

  async getParticipantBySession(sessionId: string): Promise<StoredParticipant | undefined> {
    return this.participants.get(sessionId);
  }

  async getParticipantsByRoom(roomCode: string): Promise<StoredParticipant[]> {
    const code = roomCode.toUpperCase();
    return Array.from(this.participants.values()).filter(p => p.roomCode === code);
  }

  async removeParticipant(sessionId: string): Promise<boolean> {
    this.participants.delete(sessionId);
    if (isMongoConnected) {
      try {
        await ParticipantModel.findOneAndDelete({ sessionId });
      } catch (err) {}
    }
    return true;
  }

  // Answers
  async saveAnswer(ans: StoredAnswer): Promise<void> {
    this.answers.push(ans);
    if (isMongoConnected) {
      try {
        await AnswerModel.create({
          roomCode: ans.roomCode,
          participantId: ans.participantId,
          sessionId: ans.sessionId,
          questionId: ans.questionId,
          x: ans.x,
          y: ans.y,
          correct: ans.correct,
          differenceId: ans.differenceId,
          timeTaken: ans.timeTaken,
          scoreGained: ans.scoreGained,
          timestamp: new Date(ans.timestamp)
        });
      } catch (err) {}
    }
  }

  async getAnswersByRoom(roomCode: string): Promise<StoredAnswer[]> {
    const code = roomCode.toUpperCase();
    return this.answers.filter(a => a.roomCode === code);
  }

  // Winner & Results
  async saveWinnerSummary(roomCode: string, summary: WinnerSummary): Promise<void> {
    const code = roomCode.toUpperCase();
    this.results.set(code, summary);
  }

  async getWinnerSummary(roomCode: string): Promise<WinnerSummary | undefined> {
    const code = roomCode.toUpperCase();
    return this.results.get(code);
  }
}

export const store = new MemoryStore();
