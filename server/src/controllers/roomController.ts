import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store, StoredRoom } from '../models/store';
import { RoomSettings, RoomDTO } from '../../../shared/types';
import { gameEngine } from '../services/GameEngine';

// Generate 6-char alphanumeric room code (avoiding confusing chars like 0/O, 1/I)
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createRoom(req: Request, res: Response) {
  try {
    const { settings, questionIds } = req.body;
    let roomCode = generateRoomCode();

    // Ensure uniqueness
    while (await store.getRoom(roomCode)) {
      roomCode = generateRoomCode();
    }

    const defaultSettings: RoomSettings = {
      eventName: settings?.eventName || 'Spot The Errors 2026',
      roundName: settings?.roundName || 'Prelims Round 1',
      maxParticipants: Number(settings?.maxParticipants) || 100,
      timePerQuestion: Number(settings?.timePerQuestion) || 30,
      pointsPerDifference: Number(settings?.pointsPerDifference) || 10,
      negativeMarking: Number(settings?.negativeMarking) || 0,
      fastestAnswerBonus: Number(settings?.fastestAnswerBonus) || 5,
      showLeaderboardDuringGame: settings?.showLeaderboardDuringGame !== false,
      showCorrectAnswersAfterQuestion: settings?.showCorrectAnswersAfterQuestion !== false,
      allowLateJoin: settings?.allowLateJoin === true,
      soundEffects: settings?.soundEffects !== false,
    };

    // Grab available question IDs if not supplied
    let qIds = questionIds;
    if (!qIds || qIds.length === 0) {
      const allQ = await store.getAllQuestions();
      qIds = allQ.map(q => q.id);
    }

    const room: StoredRoom = {
      id: uuidv4(),
      roomCode,
      eventName: defaultSettings.eventName,
      roundName: defaultSettings.roundName,
      status: 'waiting',
      settings: defaultSettings,
      questionIds: qIds,
      currentQuestionIndex: 0,
      createdBy: 'organizer',
      createdAt: new Date().toISOString()
    };

    await store.createRoom(room);

    const dto: RoomDTO = {
      id: room.id,
      roomCode: room.roomCode,
      eventName: room.eventName,
      roundName: room.roundName,
      status: room.status,
      settings: room.settings,
      participantCount: 0,
      totalQuestions: room.questionIds.length,
      currentQuestionIndex: 0,
      createdAt: room.createdAt
    };

    return res.status(201).json({ success: true, room: dto });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create room.' });
  }
}

export async function getRooms(req: Request, res: Response) {
  try {
    const rooms = await store.getAllRooms();
    const result: RoomDTO[] = [];

    for (const r of rooms) {
      const participants = await store.getParticipantsByRoom(r.roomCode);
      result.push({
        id: r.id,
        roomCode: r.roomCode,
        eventName: r.eventName,
        roundName: r.roundName,
        status: r.status,
        settings: r.settings,
        participantCount: participants.length,
        totalQuestions: r.questionIds?.length || 0,
        currentQuestionIndex: r.currentQuestionIndex,
        createdAt: r.createdAt
      });
    }

    return res.json({ success: true, rooms: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getRoomByCode(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const room = await store.getRoom(roomCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const participants = await store.getParticipantsByRoom(roomCode);
    const dto: RoomDTO = {
      id: room.id,
      roomCode: room.roomCode,
      eventName: room.eventName,
      roundName: room.roundName,
      status: room.status,
      settings: room.settings,
      participantCount: participants.length,
      totalQuestions: room.questionIds?.length || 0,
      currentQuestionIndex: room.currentQuestionIndex,
      createdAt: room.createdAt
    };

    return res.json({ success: true, room: dto });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateRoomStatus(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const { status } = req.body;
    const room = await store.updateRoom(roomCode, { status });
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    return res.json({ success: true, room });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getRoomParticipants(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const participants = await store.getParticipantsByRoom(roomCode);
    return res.json({ success: true, participants });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
