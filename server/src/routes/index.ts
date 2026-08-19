import { Router } from 'express';
import { login, authMiddleware } from '../controllers/authController';
import { 
  createRoom, 
  getRooms, 
  getRoomByCode, 
  updateRoomStatus, 
  getRoomParticipants 
} from '../controllers/roomController';
import { 
  getQuestions, 
  getQuestion, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '../controllers/questionController';
import { 
  getAnalytics, 
  getGameResults, 
  exportExcel, 
  exportCSV 
} from '../controllers/analyticsController';

const router = Router();

// Auth
router.post('/auth/login', login);

// Rooms
router.post('/rooms', createRoom);
router.get('/rooms', getRooms);
router.get('/rooms/:roomCode', getRoomByCode);
router.patch('/rooms/:roomCode/status', updateRoomStatus);
router.get('/rooms/:roomCode/participants', getRoomParticipants);

// Questions
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestion);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Results & Analytics
router.get('/analytics/:roomCode', getAnalytics);
router.get('/results/:roomCode', getGameResults);
router.get('/export/excel/:roomCode', exportExcel);
router.get('/export/csv/:roomCode', exportCSV);

export default router;
