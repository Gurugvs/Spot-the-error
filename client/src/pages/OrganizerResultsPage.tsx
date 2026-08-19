import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Download, 
  FileSpreadsheet, 
  RotateCcw, 
  ArrowLeft, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Users, 
  Printer, 
  Sparkles 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { resultsApi, roomApi } from '../services/api';
import { WinnerSummary, LeaderboardEntry, AnalyticsData, RoomDTO } from '../../../shared/types';
import { Leaderboard } from '../components/Leaderboard';
import { ConfettiCelebration } from '../components/ConfettiCelebration';

export const OrganizerResultsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const roomCode = (gameId || '').toUpperCase();

  const [summary, setSummary] = useState<WinnerSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'analytics'>('leaderboard');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await resultsApi.getResults(roomCode);
        setSummary(res.summary);
        setLeaderboard(res.leaderboard || []);

        const a = await resultsApi.getAnalytics(roomCode);
        setAnalytics(a);

        const r = await roomApi.getRoomByCode(roomCode);
        setRoom(r);
      } catch (e) {
        console.error('Failed to load results', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [roomCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    window.location.href = resultsApi.getExportExcelUrl(roomCode);
  };

  const handleDownloadCSV = () => {
    window.location.href = resultsApi.getExportCsvUrl(roomCode);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center text-slate-500">
        Compiling authoritative rankings and analytics...
      </div>
    );
  }

  const champion = summary?.winner || (leaderboard.length > 0 ? leaderboard[0] : null);
  const runnerUp = summary?.runnerUp || (leaderboard.length > 1 ? leaderboard[1] : null);
  const secondRunnerUp = summary?.secondRunnerUp || (leaderboard.length > 2 ? leaderboard[2] : null);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      <ConfettiCelebration durationMs={8000} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border print:hidden">
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
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
              Final Competition Results
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-slate-200 font-bold text-xs border border-surface-border flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-surface-card hover:bg-surface-border text-slate-300 border border-surface-border transition-colors"
            title="Print Official Score Sheet"
          >
            <Printer className="w-4 h-4" />
          </button>

          <Link
            to="/admin/create-room"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-xs shadow-lg shadow-primary/30 hover:brightness-110 flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Start New Round
          </Link>
        </div>
      </div>

      {/* CHAMPION PODIUM */}
      {champion ? (
        <div className="glass-panel-glow p-8 sm:p-10 rounded-3xl border-2 border-yellow-500/40 text-center space-y-6 shadow-2xl shadow-yellow-500/10">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-secondary">
              OFFICIAL WINNER ANNOUNCEMENT
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
              🏆 EVENT CHAMPION 🏆
            </h2>
          </div>

          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center mx-auto text-4xl shadow-xl shadow-yellow-500/30">
            🥇
          </div>

          <div>
            <h3 className="text-3xl sm:text-4xl font-display font-black text-white">
              {champion.name}
            </h3>
            <p className="text-sm text-secondary font-semibold mt-1">
              Winning Champion Team
            </p>
          </div>

          {/* Quick Champion Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 border-t border-surface-border">
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Score</span>
              <div className="text-3xl font-display font-black text-yellow-400 mt-1">
                {champion.score} <span className="text-xs font-bold text-slate-400">PTS</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-xs text-slate-400 uppercase font-bold">Accuracy</span>
              <div className="text-3xl font-display font-black text-emerald-400 mt-1">
                {champion.correctAnswers} <span className="text-xs font-bold text-slate-400">Hits</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Time</span>
              <div className="text-3xl font-display font-black text-cyan-400 mt-1">
                {champion.totalTime}s
              </div>
            </div>
          </div>

          {/* Runner Up & 2nd Runner Up Row */}
          {(runnerUp || secondRunnerUp) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
              {runnerUp && (
                <div className="p-4 rounded-2xl bg-surface-card border border-slate-400/30 flex items-center gap-4 text-left">
                  <div className="text-3xl">🥈</div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">1st Runner Up</span>
                    <h4 className="text-base font-bold text-white">{runnerUp.name}</h4>
                    <span className="text-xs text-slate-300 font-semibold">{runnerUp.score} PTS • {runnerUp.totalTime}s</span>
                  </div>
                </div>
              )}

              {secondRunnerUp && (
                <div className="p-4 rounded-2xl bg-surface-card border border-amber-700/30 flex items-center gap-4 text-left">
                  <div className="text-3xl">🥉</div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">2nd Runner Up</span>
                    <h4 className="text-base font-bold text-white">{secondRunnerUp.name}</h4>
                    <span className="text-xs text-slate-300 font-semibold">{secondRunnerUp.score} PTS • {secondRunnerUp.totalTime}s</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* TABS: LEADERBOARD vs ANALYTICS */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-surface-border pb-3 print:hidden">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-all ${
              activeTab === 'leaderboard'
                ? 'border-primary text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Complete Participant Leaderboard ({leaderboard.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-primary text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Performance Analytics & Charts
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border">
            <Leaderboard entries={leaderboard} showDetails={true} />
          </div>
        )}

        {/* TAB 2: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Analytics Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-surface-border">
                <span className="text-xs text-slate-400 font-medium">Average Score</span>
                <div className="text-2xl font-display font-black text-white mt-1">
                  {analytics.averageScore} PTS
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-surface-border">
                <span className="text-xs text-slate-400 font-medium">Avg Completion Time</span>
                <div className="text-2xl font-display font-black text-cyan-400 mt-1">
                  {analytics.averageCompletionTime}s
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-surface-border">
                <span className="text-xs text-slate-400 font-medium">Easiest Puzzle</span>
                <div className="text-sm font-bold text-emerald-400 mt-1 truncate">
                  {analytics.easiestQuestion.title} ({analytics.easiestQuestion.accuracy}%)
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-surface-border">
                <span className="text-xs text-slate-400 font-medium">Hardest Puzzle</span>
                <div className="text-sm font-bold text-red-400 mt-1 truncate">
                  {analytics.mostDifficultQuestion.title} ({analytics.mostDifficultQuestion.accuracy}%)
                </div>
              </div>
            </div>

            {/* Recharts Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Score Distribution */}
              <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-4">
                <h3 className="text-sm font-bold text-white">Score Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3449" />
                      <XAxis dataKey="scoreRange" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#2a3449', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Participants" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Question Accuracy Breakdown */}
              <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-4">
                <h3 className="text-sm font-bold text-white">Question Accuracy (%)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.questionAccuracy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3449" />
                      <XAxis dataKey="question" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#2a3449', borderRadius: 8 }} />
                      <Bar dataKey="accuracy" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Accuracy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
