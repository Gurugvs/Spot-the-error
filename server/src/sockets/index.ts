import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { store, StoredParticipant } from '../models/store';
import { gameEngine } from '../services/GameEngine';
import { 
  RoomDTO, 
  ParticipantDTO, 
  AnswerSubmission,
  RoomSettings
} from '../../../shared/types';

const DEMO_NAMES = [
  { name: 'Team CyberKnights', id: 'Team CyberKnights' },
  { name: 'Team PixelHunters', id: 'Team PixelHunters' },
  { name: 'Team ByteForce', id: 'Team ByteForce' },
  { name: 'Team BugBusters', id: 'Team BugBusters' },
  { name: 'Team CodeCrafters', id: 'Team CodeCrafters' },
  { name: 'Team Matrix', id: 'Team Matrix' },
  { name: 'Team Vortex', id: 'Team Vortex' },
  { name: 'Team Quantum', id: 'Team Quantum' },
  { name: 'Team Shadow', id: 'Team Shadow' },
  { name: 'Team Apex', id: 'Team Apex' }
];

export function setupSocketHandlers(io: Server) {
  gameEngine.setSocketServer(io);

  io.on('connection', (socket: Socket) => {
    let currentSessionId: string | null = null;
    let currentRoomCode: string | null = null;

    // 1. Participant / Organizer joins a room channel
    socket.on('join_room', async (data: { roomCode: string; name: string; rollNumber: string; sessionId?: string }, callback) => {
      try {
        const code = data.roomCode.trim().toUpperCase();
        const room = await store.getRoom(code);

        if (!room) {
          return callback?.({ success: false, error: 'Room not found. Please check the 6-character room code.' });
        }

        if (room.status === 'closed') {
          return callback?.({ success: false, error: 'This competition room has been closed.' });
        }

        const participants = await store.getParticipantsByRoom(code);

        // Check if room is full
        if (room.settings?.maxParticipants && participants.length >= room.settings.maxParticipants) {
          // Allow existing sessions to reconnect
          const existingSession = data.sessionId ? await store.getParticipantBySession(data.sessionId) : null;
          if (!existingSession) {
            return callback?.({ success: false, error: 'Room is full. Maximum participant limit reached.' });
          }
        }

        // Check duplicate roll number / participant ID
        const duplicateId = participants.find(p => 
          p.participantId.toLowerCase() === data.rollNumber.trim().toLowerCase() && 
          p.sessionId !== data.sessionId
        );

        if (duplicateId && duplicateId.status !== 'disconnected') {
          return callback?.({ success: false, error: `Participant ID '${data.rollNumber}' is already joined in this room.` });
        }

        const sessionId = data.sessionId || uuidv4();
        currentSessionId = sessionId;
        currentRoomCode = code;

        let participant = await store.getParticipantBySession(sessionId);

        if (!participant) {
          // New participant
          participant = {
            id: uuidv4(),
            roomId: room.id,
            roomCode: code,
            name: data.name.trim(),
            participantId: data.rollNumber.trim(),
            sessionId,
            status: 'connected',
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            differencesFound: {},
            totalTime: 0,
            lastActiveTimestamp: Date.now(),
            joinedAt: new Date().toISOString()
          };
          await store.addParticipant(participant);
        } else {
          // Reconnection
          participant.status = 'connected';
          participant.lastActiveTimestamp = Date.now();
          await store.addParticipant(participant);
        }

        socket.join(code);
        socket.join(`session_${sessionId}`);

        // Broadcast participant joined to room (organizer/presentation)
        const updatedParticipants = await store.getParticipantsByRoom(code);
        io.to(code).emit('participant_joined', {
          participant: {
            id: participant.id,
            roomId: participant.roomId,
            name: participant.name,
            participantId: participant.participantId,
            sessionId: participant.sessionId,
            status: participant.status,
            score: participant.score,
            correctAnswers: participant.correctAnswers,
            wrongAnswers: participant.wrongAnswers,
            differencesFoundCount: 0,
            totalTime: participant.totalTime,
            joinedAt: participant.joinedAt
          },
          totalCount: updatedParticipants.length
        });

        // Fetch current game state for recovery
        const syncState = await gameEngine.getParticipantGameState(sessionId);

        return callback?.({
          success: true,
          participant: {
            id: participant.id,
            roomId: participant.roomId,
            name: participant.name,
            participantId: participant.participantId,
            sessionId: participant.sessionId,
            status: participant.status,
            score: participant.score,
            correctAnswers: participant.correctAnswers,
            wrongAnswers: participant.wrongAnswers,
            differencesFoundCount: 0,
            totalTime: participant.totalTime,
            joinedAt: participant.joinedAt
          },
          gameState: syncState?.gameState
        });
      } catch (err: any) {
        console.error('join_room error:', err);
        return callback?.({ success: false, error: err.message || 'Failed to join room.' });
      }
    });

    // 1.5 Sync Game State snapshot
    socket.on('get_game_state' as any, async (data: { roomCode: string; sessionId?: string }, callback: any) => {
      const code = data.roomCode?.trim().toUpperCase();
      const sId = data.sessionId || currentSessionId;
      if (sId) {
        const syncState = await gameEngine.getParticipantGameState(sId);
        if (syncState) {
          return callback?.(syncState);
        }
      }
      // If no session found yet, return room general state
      const room = await store.getRoom(code);
      if (room) {
        const session = (gameEngine as any).activeGames?.get(code);
        let currentQuestion = null;
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
        }
        return callback?.({
          room,
          gameState: {
            roomCode: room.roomCode,
            status: room.status,
            currentQuestionIndex: session ? session.currentQuestionIndex + 1 : 0,
            totalQuestions: session ? session.questions.length : (room.questionIds.length || 3),
            currentQuestion,
            timeRemaining: session ? session.timeRemaining : 30,
            isPaused: session ? session.isPaused : false,
            foundDifferenceIds: []
          }
        });
      }
      return callback?.(null);
    });

    // 2. Organizer connects & observes room
    socket.on('observe_room', async (data: { roomCode: string }, callback) => {
      const code = data.roomCode.trim().toUpperCase();
      const room = await store.getRoom(code);
      if (!room) return callback?.({ success: false, error: 'Room not found.' });

      socket.join(code);
      currentRoomCode = code;

      const participants = await store.getParticipantsByRoom(code);
      const leaderboard = await gameEngine.getLeaderboard(code);

      return callback?.({
        success: true,
        room: {
          id: room.id,
          roomCode: room.roomCode,
          eventName: room.eventName,
          roundName: room.roundName,
          status: room.status,
          settings: room.settings,
          participantCount: participants.length,
          totalQuestions: room.questionIds?.length || 3,
          currentQuestionIndex: room.currentQuestionIndex,
          createdAt: room.createdAt
        },
        participants: participants.map(p => ({
          id: p.id,
          roomId: p.roomId,
          name: p.name,
          participantId: p.participantId,
          sessionId: p.sessionId,
          status: p.status,
          score: p.score,
          correctAnswers: p.correctAnswers,
          wrongAnswers: p.wrongAnswers,
          differencesFoundCount: p.differencesFound ? Object.values(p.differencesFound).flat().length : 0,
          totalTime: p.totalTime,
          joinedAt: p.joinedAt
        })),
        leaderboard
      });
    });

    // 3. Start Game
    socket.on('start_game', async (data: { roomCode: string }) => {
      try {
        await gameEngine.startGame(data.roomCode);
      } catch (err: any) {
        socket.emit('error_message', { message: err.message });
      }
    });

    // 4. Pause Game
    socket.on('pause_game', (data: { roomCode: string }) => {
      gameEngine.pauseGame(data.roomCode);
    });

    // 5. Resume Game
    socket.on('resume_game', (data: { roomCode: string }) => {
      gameEngine.resumeGame(data.roomCode);
    });

    // 6. Next Question
    socket.on('next_question', async (data: { roomCode: string }) => {
      await gameEngine.nextQuestion(data.roomCode);
    });

    // 7. Restart Question
    socket.on('restart_question', async (data: { roomCode: string }) => {
      await gameEngine.restartQuestion(data.roomCode);
    });

    // 8. End Game
    socket.on('end_game', async (data: { roomCode: string }) => {
      await gameEngine.endGame(data.roomCode);
    });

    // 9. Kick Participant
    socket.on('kick_participant', async (data: { roomCode: string; participantId: string }) => {
      const code = data.roomCode.toUpperCase();
      const participants = await store.getParticipantsByRoom(code);
      const target = participants.find(p => p.participantId === data.participantId || p.id === data.participantId);

      if (target) {
        await store.removeParticipant(target.sessionId);
        io.to(`session_${target.sessionId}`).emit('participant_kicked', {
          participantId: target.participantId,
          reason: 'Removed by event organizer.'
        });

        const remaining = await store.getParticipantsByRoom(code);
        io.to(code).emit('participant_left', {
          participantId: target.participantId,
          name: target.name,
          totalCount: remaining.length
        });
      }
    });

    // 10. Answer Submission (Authoritative Hit-Test)
    socket.on('submit_answer', async (data: AnswerSubmission, callback) => {
      try {
        const result = await gameEngine.handleAnswerSubmission(data);
        if (callback) callback(result);
        socket.emit('answer_result', result);
      } catch (err: any) {
        console.error('submit_answer error', err);
      }
    });

    // 11. Demo Simulation: Add 10 Simulated Live Participants
    socket.on('add_demo_participants', async (data: { roomCode: string; count?: number }) => {
      const code = data.roomCode.toUpperCase();
      const room = await store.getRoom(code);
      if (!room) return;

      const numToAdd = data.count || 10;
      for (let i = 0; i < Math.min(numToAdd, DEMO_NAMES.length); i++) {
        const demo = DEMO_NAMES[i];
        const sessionId = `demo_bot_${i}_${code.toLowerCase()}`;
        const p: StoredParticipant = {
          id: uuidv4(),
          roomId: room.id,
          roomCode: code,
          name: demo.name,
          participantId: demo.id,
          sessionId,
          status: 'connected',
          score: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          differencesFound: {},
          totalTime: 0,
          lastActiveTimestamp: Date.now(),
          joinedAt: new Date().toISOString()
        };
        await store.addParticipant(p);
      }

      const all = await store.getParticipantsByRoom(code);
      io.to(code).emit('participant_joined', {
        participant: {
          id: 'demo-batch',
          roomId: room.id,
          name: 'Demo Participants Added',
          participantId: 'DEMO',
          sessionId: 'demo',
          status: 'connected',
          score: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          differencesFoundCount: 0,
          totalTime: 0,
          joinedAt: new Date().toISOString()
        },
        totalCount: all.length
      });
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      if (currentSessionId && currentRoomCode) {
        const participant = await store.getParticipantBySession(currentSessionId);
        if (participant) {
          participant.status = 'disconnected';
          await store.addParticipant(participant);

          io.to(currentRoomCode).emit('participant_status_updated', {
            participantId: participant.participantId,
            status: 'disconnected'
          });
        }
      }
    });
  });
}
