import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Users, 
  Play, 
  Sparkles, 
  Copy, 
  Check, 
  Maximize2, 
  Tv, 
  UserPlus, 
  UserMinus, 
  Wifi, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import { socketService } from '../services/socket';
import { roomApi } from '../services/api';
import { RoomDTO, ParticipantDTO } from '../../../shared/types';
import { QRModal } from '../components/QRModal';

export const RoomLobbyPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [participants, setParticipants] = useState<ParticipantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [addingBots, setAddingBots] = useState<boolean>(false);

  const code = (roomCode || '').toUpperCase();
  const joinUrl = `${window.location.origin}/join?room=${code}`;

  useEffect(() => {
    async function loadData() {
      try {
        const r = await roomApi.getRoomByCode(code);
        setRoom(r);
        const pList = await roomApi.getParticipants(code);
        setParticipants(pList);
      } catch (e) {
        console.error('Failed to load room data', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Socket Connection & Real-Time Observation
    const socket = socketService.getSocket();
    socketService.observeRoom(code).then((res) => {
      if (res?.success) {
        setRoom(res.room);
        setParticipants(res.participants);
      }
    });

    // Listen for incoming live participants
    socket.on('participant_joined', (data) => {
      setParticipants((prev) => {
        const exists = prev.find(p => p.participantId === data.participant.participantId);
        if (exists) return prev;
        return [...prev, data.participant];
      });
    });

    socket.on('participant_left', (data) => {
      setParticipants(prev => prev.filter(p => p.participantId !== data.participantId));
    });

    socket.on('participant_status_updated', (data) => {
      setParticipants(prev =>
        prev.map(p => (p.participantId === data.participantId ? { ...p, status: data.status } : p))
      );
    });

    // If game started, redirect organizer to live control panel
    socket.on('question_started', () => {
      navigate(`/admin/game/${code}`);
    });

    return () => {
      socket.off('participant_joined');
      socket.off('participant_left');
      socket.off('participant_status_updated');
      socket.off('question_started');
    };
  }, [code, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (participants.length === 0) {
      if (!confirm('No participants have joined yet. Start anyway?')) return;
    }
    socketService.startGame(code);
    navigate(`/admin/game/${code}`);
  };

  const handleAddDemoBots = () => {
    setAddingBots(true);
    socketService.addDemoParticipants(code, 10);
    setTimeout(() => setAddingBots(false), 800);
  };

  const handleKick = (participantId: string) => {
    if (confirm(`Remove participant ${participantId} from room?`)) {
      socketService.kickParticipant(code, participantId);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-surface-card hover:bg-surface-border text-slate-400 hover:text-white border border-surface-border transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary-light">
                {room?.eventName || 'SPOT THE ERRORS'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">({room?.roundName})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
              Event Room Lobby
            </h1>
          </div>
        </div>

        {/* Projector Presentation Mode Button */}
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/room/${code}/presentation`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-secondary-light font-bold text-sm border border-secondary/30 hover:border-secondary flex items-center gap-2 transition-all shadow-md shadow-secondary/10"
          >
            <Tv className="w-4 h-4 text-secondary" />
            Launch Projector Mode
          </Link>
        </div>
      </div>

      {/* Main Grid: Left QR & Code (2 cols), Right Participant Stream (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Room Code & QR Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-primary/40 text-center space-y-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              JOIN ROOM CODE
            </span>

            {/* Room Code */}
            <div className="text-5xl sm:text-6xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-secondary glow-text-primary">
              {code}
            </div>

            {/* QR Code */}
            <div className="relative group inline-block p-4 bg-white rounded-2xl shadow-xl shadow-primary/20 cursor-pointer" onClick={() => setQrModalOpen(true)}>
              <QRCodeSVG value={joinUrl} size={180} level="H" />
              <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                <Maximize2 className="w-6 h-6 mr-1" /> Click to Expand
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Scan with phone camera or visit <br />
              <strong className="text-secondary font-mono">{window.location.host}/join</strong>
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-xs font-bold text-slate-200 border border-surface-border flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Link Copied!' : 'Copy Join Link'}
              </button>
              <button
                onClick={() => setQrModalOpen(true)}
                className="p-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-slate-200 border border-surface-border transition-all"
                title="Fullscreen QR"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Start Game Action Card */}
          <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-4">
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500 text-slate-950 font-display font-black text-lg shadow-xl shadow-emerald-500/30 hover:brightness-110 flex items-center justify-center gap-3 transition-all animate-pulse"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              START GAME NOW
            </button>

            <button
              onClick={handleAddDemoBots}
              disabled={addingBots}
              className="w-full py-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-xs font-bold text-slate-300 border border-surface-border flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4 text-secondary" />
              {addingBots ? 'Simulating...' : '+ Add 10 Simulated Demo Participants'}
            </button>
          </div>
        </div>

        {/* Right Side: Real-Time Participant Stream */}
        <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border/60 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold text-white">
                Participants Online
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-black text-emerald-400">
                {participants.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">Joined</span>
            </div>
          </div>

          {/* Participant List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {participants.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 space-y-2">
                <Users className="w-10 h-10 mx-auto opacity-30 animate-bounce" />
                <p className="text-sm font-medium">Waiting for participants to scan QR code...</p>
                <p className="text-xs text-slate-600">
                  Or click "+ Add 10 Simulated Demo Participants" to test immediately.
                </p>
              </div>
            ) : (
              participants.map((p, idx) => (
                <div
                  key={p.participantId || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="block font-bold text-xs text-white truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.participantId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Wifi className="w-2.5 h-2.5" />
                      Ready
                    </span>
                    <button
                      onClick={() => handleKick(p.participantId)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-opacity"
                      title="Kick Participant"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <QRModal
        roomCode={code}
        eventName={room?.eventName}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};
