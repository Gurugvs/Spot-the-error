import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Volume2, VolumeX, Shield, LogOut, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../audio/soundManager';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState<boolean>(soundManager.isEnabled());

  const handleToggleSound = () => {
    const next = soundManager.toggleSound();
    setSoundOn(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                SPOT THE ERRORS
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Eyes Sharp. Mind Fast.
            </p>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={soundOn ? "Mute audio" : "Unmute audio"}
            className="p-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 hover:text-white transition-colors"
            title={soundOn ? "Sound Effects ON" : "Sound Effects MUTED"}
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-secondary" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          {/* Organizer Authenticated Links */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border text-sm font-medium text-slate-200 border border-surface-border transition-colors"
              >
                <Shield className="w-4 h-4 text-primary" />
                Dashboard
              </Link>
              <Link
                to="/admin/create-room"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold text-white shadow-md shadow-primary/30 hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                New Room
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg bg-surface-card hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-surface-border transition-colors"
                title="Logout Organizer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/join"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-secondary to-secondary-hover text-sm font-semibold text-slate-950 shadow-md shadow-secondary/20 hover:brightness-110 transition-all"
              >
                Join Room
              </Link>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border text-sm font-medium text-slate-300 border border-surface-border transition-colors"
              >
                Organizer Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
