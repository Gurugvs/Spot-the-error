import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Wifi, Sparkles, Clock, Smartphone, AlertCircle } from 'lucide-react';
import { socketService } from '../services/socket';
import { useGame } from '../context/GameContext';
import { roomApi } from '../services/api';
import { ParticipantDTO } from '../../../shared/types';

export const ParticipantLobbyPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { participant, setParticipant } = useGame();

  const code = (roomCode || '').toUpperCase();
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [eventName, setEventName] = useState<string>('SPOT THE ERRORS');
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantDTO | null>(participant);

  useEffect(() => {
    let p = currentParticipant;
    if (!p) {
      const saved = localStorage.getItem('spot_last_participant');
      if (saved) {
        try {
          p = JSON.parse(saved);
          setCurrentParticipant(p);
          setParticipant(p);
        } catch (e) {}
      }
    }

    if (!p) {
      // If no participant info found, redirect to join page
      navigate(`/join?room=${code}`);
      return;
    }

    // Ensure socket joins this room channel
    const socket = socketService.getSocket();

    const joinRoomChannel = async () => {
      if (p) {
        const res = await socketService.joinRoom(code, p.name, p.participantId, p.sessionId);
        if (res?.gameState && res.gameState.status === 'active') {
          navigate(`/participant/game/${code}`);
        }
      }
    };

    joinRoomChannel();

    async function fetchLobbyInfo() {
      try {
        const r = await roomApi.getRoomByCode(code);
        if (r) {
          setEventName(r.eventName);
          if (r.status === 'active') {
            navigate(`/participant/game/${code}`);
          }
        }
        const pList = await roomApi.getParticipants(code);
        setPlayerCount(Math.max(1, pList.length));
      } catch (e) {}
    }

    fetchLobbyInfo();

    // Periodic check in case game starts while in background
    const interval = setInterval(fetchLobbyInfo, 3000);

    socket.on('connect', joinRoomChannel);

    socket.on('participant_joined', (data) => {
      setPlayerCount(Math.max(1, data.totalCount));
    });

    socket.on('participant_left', (data) => {
      setPlayerCount(Math.max(1, data.totalCount));
    });

    // Auto-Transition to Game when organizer starts
    socket.on('question_started', () => {
      navigate(`/participant/game/${code}`);
    });

    socket.on('participant_kicked', (data) => {
      alert(data.reason || 'You were removed from the room.');
      navigate('/join');
    });

    return () => {
      clearInterval(interval);
      socket.off('connect', joinRoomChannel);
      socket.off('participant_joined');
      socket.off('participant_left');
      socket.off('question_started');
      socket.off('participant_kicked');
    };
  }, [code, navigate, currentParticipant, setParticipant]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-surface-border space-y-6 shadow-2xl relative">
        {/* Animated Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Welcome Banner */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-secondary">
            {eventName}
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Welcome, {currentParticipant?.name ? currentParticipant.name : 'Team'}!
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            Status: Ready in Arena
          </p>
        </div>

        {/* Room Code Card */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">ROOM CODE</span>
          <div className="text-3xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary">
            {code}
          </div>
        </div>

        {/* Live Player Counter */}
        <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-surface/60 border border-surface-border">
          <Users className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">
            Players in Lobby: <strong className="text-emerald-400 text-lg font-black">{playerCount}</strong>
          </span>
        </div>

        {/* Waiting Status */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary-light text-sm font-bold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            Waiting for organizer to start...
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Get your eyes ready! Two pictures will appear on your screen simultaneously. Tap every difference you spot before time runs out!
          </p>
        </div>
      </div>
    </div>
  );
};
