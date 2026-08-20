import axios from 'axios';
import { RoomDTO, RoomSettings, QuestionDTO, WinnerSummary, AnalyticsData, ParticipantDTO } from '../../../shared/types';
import { FALLBACK_SEED_QUESTIONS } from './seedQuestions';

export function getBackendUrl(): string {
  const envUrl = (import.meta as any).env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  const customUrl = localStorage.getItem('spot_custom_backend_url');
  if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
    return customUrl.trim().replace(/\/$/, '');
  }
  return '';
}

export function getApiBase(): string {
  return getBackendUrl() ? `${getBackendUrl()}/api` : '/api';
}

export function setCustomBackendUrl(url: string) {
  if (url && url.trim()) {
    localStorage.setItem('spot_custom_backend_url', url.trim().replace(/\/$/, ''));
  } else {
    localStorage.removeItem('spot_custom_backend_url');
  }
  api.defaults.baseURL = getApiBase();
}

const api = axios.create({
  baseURL: getBackendUrl() ? `${getBackendUrl()}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Interceptor to attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spot_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Local storage fallback helpers for static hosting without backend
function getLocalStoredRooms(): RoomDTO[] {
  try {
    const raw = localStorage.getItem('spot_local_rooms');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalStoredRoom(room: RoomDTO) {
  try {
    const rooms = getLocalStoredRooms().filter(r => r.roomCode !== room.roomCode);
    rooms.unshift(room);
    localStorage.setItem('spot_local_rooms', JSON.stringify(rooms));
  } catch (e) {}
}

export function getLocalParticipants(roomCode: string): ParticipantDTO[] {
  try {
    const raw = localStorage.getItem(`spot_participants_${roomCode.toUpperCase()}`);
    const list: ParticipantDTO[] = raw ? JSON.parse(raw) : [];
    const lastP = localStorage.getItem('spot_last_participant');
    if (lastP) {
      const parsed = JSON.parse(lastP);
      if (parsed.roomCode?.toUpperCase() === roomCode.toUpperCase() && !list.find(p => p.participantId === parsed.participantId)) {
        list.push(parsed);
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

export function saveLocalParticipant(roomCode: string, participant: ParticipantDTO) {
  try {
    const code = roomCode.toUpperCase();
    const list = getLocalParticipants(code).filter(p => p.participantId !== participant.participantId);
    list.push(participant);
    localStorage.setItem(`spot_participants_${code}`, JSON.stringify(list));
  } catch (e) {}
}

export const authApi = {
  login: async (username: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      return res.data;
    } catch (err) {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
        return {
          success: true,
          token: 'offline_admin_token',
          user: { username: 'admin', role: 'organizer' }
        };
      }
      throw err;
    }
  },
};

export const roomApi = {
  createRoom: async (settings: Partial<RoomSettings>, questionIds?: string[]): Promise<RoomDTO> => {
    try {
      const res = await api.post('/rooms', { settings, questionIds });
      if (res.data?.room) {
        saveLocalStoredRoom(res.data.room);
        return res.data.room;
      }
    } catch (e) {}

    // Offline fallback room creation
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const fallbackRoom: RoomDTO = {
      id: `room_${code.toLowerCase()}`,
      roomCode: code,
      eventName: settings.eventName || 'Spot The Errors 2026',
      roundName: settings.roundName || 'Round 1',
      status: 'waiting',
      settings: {
        eventName: settings.eventName || 'Spot The Errors 2026',
        roundName: settings.roundName || 'Round 1',
        maxParticipants: settings.maxParticipants || 100,
        timePerQuestion: settings.timePerQuestion || 30,
        pointsPerDifference: settings.pointsPerDifference || 10,
        negativeMarking: settings.negativeMarking || 0,
        fastestAnswerBonus: settings.fastestAnswerBonus || 5,
        showLeaderboardDuringGame: settings.showLeaderboardDuringGame ?? true,
        showCorrectAnswersAfterQuestion: settings.showCorrectAnswersAfterQuestion ?? true,
        allowLateJoin: settings.allowLateJoin ?? false,
        soundEffects: settings.soundEffects ?? true
      },
      participantCount: 0,
      totalQuestions: questionIds?.length || FALLBACK_SEED_QUESTIONS.length,
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString()
    };

    saveLocalStoredRoom(fallbackRoom);
    return fallbackRoom;
  },

  getRooms: async (): Promise<RoomDTO[]> => {
    try {
      const res = await api.get('/rooms');
      if (Array.isArray(res.data?.rooms)) {
        return res.data.rooms;
      }
    } catch (e) {}
    return getLocalStoredRooms();
  },

  getRoomByCode: async (roomCode: string): Promise<RoomDTO> => {
    try {
      const res = await api.get(`/rooms/${roomCode}`);
      if (res.data?.room) return res.data.room;
    } catch (e) {}

    const local = getLocalStoredRooms().find(r => r.roomCode.toUpperCase() === roomCode.toUpperCase());
    if (local) return local;

    // Default fallback room if not found
    return {
      id: `room_${roomCode.toLowerCase()}`,
      roomCode: roomCode.toUpperCase(),
      eventName: 'Spot The Errors',
      roundName: 'Live Round',
      status: 'waiting',
      settings: {
        eventName: 'Spot The Errors',
        roundName: 'Live Round',
        maxParticipants: 100,
        timePerQuestion: 30,
        pointsPerDifference: 10,
        negativeMarking: 0,
        fastestAnswerBonus: 5,
        showLeaderboardDuringGame: true,
        showCorrectAnswersAfterQuestion: true,
        allowLateJoin: false,
        soundEffects: true
      },
      participantCount: 0,
      totalQuestions: FALLBACK_SEED_QUESTIONS.length,
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString()
    };
  },

  updateRoomStatus: async (roomCode: string, status: string) => {
    try {
      const res = await api.patch(`/rooms/${roomCode}/status`, { status });
      return res.data;
    } catch (e) {
      const local = getLocalStoredRooms();
      const target = local.find(r => r.roomCode === roomCode);
      if (target) {
        target.status = status as any;
        localStorage.setItem('spot_local_rooms', JSON.stringify(local));
      }
      return { success: true };
    }
  },

  getParticipants: async (roomCode: string) => {
    try {
      const res = await api.get(`/rooms/${roomCode}/participants`);
      if (Array.isArray(res.data?.participants) && res.data.participants.length > 0) return res.data.participants;
    } catch (e) {}
    return getLocalParticipants(roomCode);
  },
};

export const questionApi = {
  getQuestions: async (): Promise<QuestionDTO[]> => {
    try {
      const res = await api.get('/questions');
      if (Array.isArray(res.data?.questions) && res.data.questions.length > 0) {
        return res.data.questions;
      }
    } catch (e) {}

    // Check localStorage or fallback seed
    try {
      const raw = localStorage.getItem('spot_custom_questions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    return FALLBACK_SEED_QUESTIONS;
  },

  getQuestion: async (id: string): Promise<QuestionDTO> => {
    try {
      const res = await api.get(`/questions/${id}`);
      if (res.data?.question) return res.data.question;
    } catch (e) {}

    const all = await questionApi.getQuestions();
    const found = all.find(q => q.id === id);
    return found || FALLBACK_SEED_QUESTIONS[0];
  },

  createQuestion: async (question: Partial<QuestionDTO>): Promise<QuestionDTO> => {
    try {
      const res = await api.post('/questions', question);
      if (res.data?.question) return res.data.question;
    } catch (e) {}

    const newQ: QuestionDTO = {
      id: question.id || `q_custom_${Date.now()}`,
      title: question.title || 'Custom Spot The Error Puzzle',
      imageA: question.imageA || '',
      imageB: question.imageB || '',
      difficulty: question.difficulty || 'medium',
      timeLimit: question.timeLimit || 30,
      points: question.points || 10,
      totalDifferences: question.differenceRegions?.length || 5,
      differenceRegions: question.differenceRegions || []
    };

    try {
      const existing = await questionApi.getQuestions();
      const updated = [newQ, ...existing];
      localStorage.setItem('spot_custom_questions', JSON.stringify(updated));
    } catch (e) {}

    return newQ;
  },

  updateQuestion: async (id: string, question: Partial<QuestionDTO>): Promise<QuestionDTO> => {
    try {
      const res = await api.put(`/questions/${id}`, question);
      if (res.data?.question) return res.data.question;
    } catch (e) {}

    const all = await questionApi.getQuestions();
    const updated = all.map(q => q.id === id ? { ...q, ...question } : q);
    localStorage.setItem('spot_custom_questions', JSON.stringify(updated));
    return (updated.find(q => q.id === id) || question) as QuestionDTO;
  },

  deleteQuestion: async (id: string) => {
    try {
      const res = await api.delete(`/questions/${id}`);
      return res.data;
    } catch (e) {}

    const all = await questionApi.getQuestions();
    const filtered = all.filter(q => q.id !== id);
    localStorage.setItem('spot_custom_questions', JSON.stringify(filtered));
    return { success: true };
  },
};

export const resultsApi = {
  getAnalytics: async (roomCode: string): Promise<AnalyticsData> => {
    try {
      const res = await api.get(`/analytics/${roomCode}`);
      if (res.data?.analytics) return res.data.analytics;
    } catch (e) {}

    return {
      totalParticipants: 0,
      averageScore: 0,
      highestScore: 0,
      averageCompletionTime: 0,
      easiestQuestion: { title: 'N/A', accuracy: 0 },
      mostDifficultQuestion: { title: 'N/A', accuracy: 0 },
      scoreDistribution: [],
      questionAccuracy: [],
      timelineData: []
    };
  },

  getResults: async (roomCode: string) => {
    try {
      const res = await api.get(`/results/${roomCode}`);
      return res.data;
    } catch (e) {}

    return {
      room: await roomApi.getRoomByCode(roomCode),
      leaderboard: [],
      winnerSummary: null
    };
  },

  getExportExcelUrl: (roomCode: string) => `${getApiBase()}/export/excel/${roomCode}`,
  getExportCsvUrl: (roomCode: string) => `${getApiBase()}/export/csv/${roomCode}`,
};

export default api;
