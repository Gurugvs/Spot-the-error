import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Layers, 
  Play, 
  Trophy, 
  Plus, 
  Sparkles, 
  Activity, 
  Clock, 
  FileSpreadsheet, 
  ArrowRight, 
  QrCode,
  CheckCircle,
  Eye
} from 'lucide-react';
import { roomApi } from '../services/api';
import { RoomDTO } from '../../../shared/types';

export const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingDemo, setCreatingDemo] = useState<boolean>(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomApi.getRooms();
      setRooms(data);
    } catch (e) {
      console.error('Failed to load rooms', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const totalParticipants = rooms.reduce((acc, r) => acc + (r.participantCount || 0), 0);
  const activeRooms = rooms.filter(r => r.status === 'active' || r.status === 'waiting');
  const completedRooms = rooms.filter(r => r.status === 'completed');

  // Fast 1-Click "Load Demo Game"
  const handleLoadDemoGame = async () => {
    try {
      setCreatingDemo(true);
      const newRoom = await roomApi.createRoom({
        eventName: 'College Tech Fest 2026',
        roundName: 'Spot The Errors Championship',
        maxParticipants: 100,
        timePerQuestion: 30,
        pointsPerDifference: 10,
        negativeMarking: 0,
        fastestAnswerBonus: 5,
        showLeaderboardDuringGame: true,
        showCorrectAnswersAfterQuestion: true,
      });

      navigate(`/admin/room/${newRoom.roomCode}`);
    } catch (e) {
      alert('Failed to launch demo room.');
    } finally {
      setCreatingDemo(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary-light">
            EVENT CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
            Organizer Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage live rooms, conduct error-spotting competitions, and review analytical leaderboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLoadDemoGame}
            disabled={creatingDemo}
            className="px-4 py-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-secondary-light font-bold text-sm border border-secondary/30 hover:border-secondary flex items-center gap-2 transition-all shadow-md shadow-secondary/10"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            {creatingDemo ? 'Creating Demo...' : 'Load Instant Demo Room'}
          </button>

          <Link
            to="/admin/create-room"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-110 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Room
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-surface-border flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Rooms</span>
            <div className="text-3xl font-display font-black text-white mt-1">{rooms.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-surface-border flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active / Lobby Rooms</span>
            <div className="text-3xl font-display font-black text-cyan-400 mt-1">{activeRooms.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary-light flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-surface-border flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Participants</span>
            <div className="text-3xl font-display font-black text-emerald-400 mt-1">{totalParticipants}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-surface-border flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Completed Games</span>
            <div className="text-3xl font-display font-black text-yellow-400 mt-1">{completedRooms.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Questions & Puzzles */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-white border-b-2 border-primary pb-3 -mb-3.5">
            Competition Rooms
          </span>
          <Link
            to="/admin/questions"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Question Bank & Annotation Editor
          </Link>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="glass-panel rounded-3xl border border-surface-border overflow-hidden">
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Active & Historical Game Rooms
          </h2>
          <button
            onClick={fetchRooms}
            className="text-xs text-secondary-light hover:underline font-semibold"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-surface/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4 sm:px-6">Room Code</th>
                <th className="py-3 px-4">Event / Round</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading competition rooms...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No game rooms created yet. Click "Create New Room" or "Load Instant Demo Room" to start!
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-surface-card/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-display font-black text-white text-base tracking-wider">
                      {room.roomCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{room.eventName}</div>
                      <div className="text-[11px] text-slate-400">{room.roundName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{room.participantCount}</span>
                      <span className="text-slate-400"> / {room.settings?.maxParticipants || 100}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {room.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          LIVE GAME
                        </span>
                      ) : room.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          LOBBY WAITING
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                      {room.status === 'completed' ? (
                        <Link
                          to={`/admin/results/${room.roomCode}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border text-xs font-bold text-yellow-400 border border-yellow-500/30 hover:border-yellow-400 transition-all"
                        >
                          <Trophy className="w-3.5 h-3.5" /> View Results
                        </Link>
                      ) : (
                        <Link
                          to={`/admin/room/${room.roomCode}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-xs font-bold text-primary-light border border-primary/30 hover:border-primary transition-all"
                        >
                          <Play className="w-3.5 h-3.5" /> Enter Lobby
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
