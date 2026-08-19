import axios from 'axios';
import { RoomDTO, RoomSettings, QuestionDTO, WinnerSummary, AnalyticsData } from '../../../shared/types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spot_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
};

export const roomApi = {
  createRoom: async (settings: Partial<RoomSettings>, questionIds?: string[]): Promise<RoomDTO> => {
    const res = await api.post('/rooms', { settings, questionIds });
    return res.data.room;
  },
  getRooms: async (): Promise<RoomDTO[]> => {
    const res = await api.get('/rooms');
    return res.data.rooms;
  },
  getRoomByCode: async (roomCode: string): Promise<RoomDTO> => {
    const res = await api.get(`/rooms/${roomCode}`);
    return res.data.room;
  },
  updateRoomStatus: async (roomCode: string, status: string) => {
    const res = await api.patch(`/rooms/${roomCode}/status`, { status });
    return res.data;
  },
  getParticipants: async (roomCode: string) => {
    const res = await api.get(`/rooms/${roomCode}/participants`);
    return res.data.participants;
  },
};

export const questionApi = {
  getQuestions: async (): Promise<QuestionDTO[]> => {
    const res = await api.get('/questions');
    return res.data.questions;
  },
  getQuestion: async (id: string): Promise<QuestionDTO> => {
    const res = await api.get(`/questions/${id}`);
    return res.data.question;
  },
  createQuestion: async (question: Partial<QuestionDTO>): Promise<QuestionDTO> => {
    const res = await api.post('/questions', question);
    return res.data.question;
  },
  updateQuestion: async (id: string, question: Partial<QuestionDTO>): Promise<QuestionDTO> => {
    const res = await api.put(`/questions/${id}`, question);
    return res.data.question;
  },
  deleteQuestion: async (id: string) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
};

export const resultsApi = {
  getAnalytics: async (roomCode: string): Promise<AnalyticsData> => {
    const res = await api.get(`/analytics/${roomCode}`);
    return res.data.analytics;
  },
  getResults: async (roomCode: string) => {
    const res = await api.get(`/results/${roomCode}`);
    return res.data;
  },
  getExportExcelUrl: (roomCode: string) => `/api/export/excel/${roomCode}`,
  getExportCsvUrl: (roomCode: string) => `/api/export/csv/${roomCode}`,
};

export default api;
