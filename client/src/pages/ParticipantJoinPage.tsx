import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  Smartphone 
} from 'lucide-react';
import { socketService } from '../services/socket';
import { useGame } from '../context/GameContext';

export const ParticipantJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setParticipant } = useGame();

  const [roomCode, setRoomCode] = useState(searchParams.get('room') || '');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const queryRoom = searchParams.get('room');
    if (queryRoom) {
      setRoomCode(queryRoom.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = roomCode.trim().toUpperCase();
    const cleanTeam = teamName.trim();

    if (!cleanCode || !cleanTeam) {
      setError('Please enter both the Room Code and your Team Name.');
      return;
    }

    setLoading(true);

    try {
      // Check existing session token for seamless reconnect
      const savedSessionId = localStorage.getItem(`spot_session_${cleanCode}`);

      const res = await socketService.joinRoom(
        cleanCode,
        cleanTeam,
        cleanTeam, // Use team name as identifier
        savedSessionId || undefined
      );

      if (res.success && res.participant) {
        // Save session locally
        localStorage.setItem(`spot_session_${cleanCode}`, res.participant.sessionId);
        localStorage.setItem('spot_last_room', cleanCode);
        localStorage.setItem('spot_last_participant', JSON.stringify(res.participant));

        setParticipant(res.participant);

        // If game is already active, transition directly to game view
        if (res.gameState && res.gameState.status === 'active') {
          navigate(`/participant/game/${cleanCode}`);
        } else {
          navigate(`/participant/${cleanCode}`);
        }
      } else {
        setError(res.error || 'Unable to join room. Please check your room code.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6 shadow-2xl relative">
        {/* Glow Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-white flex items-center justify-center mx-auto shadow-lg shadow-secondary/20">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            SPOT THE ERRORS
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Enter your Room Code and Team Name to join the live competition.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Room Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-4 py-3 text-base sm:text-lg font-mono font-bold text-secondary uppercase tracking-widest placeholder-slate-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="e.g. A7K9P2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Team Name
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="e.g. Cyber Knights / Pixel Hunters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary via-cyan-500 to-primary text-slate-950 font-display font-black text-base shadow-xl shadow-secondary/20 hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Joining Arena...' : 'ENTER ARENA'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
