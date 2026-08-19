import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border text-primary flex items-center justify-center shadow-lg">
        <Eye className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white">
          404 — Page Not Found
        </h1>
        <p className="text-sm text-slate-400 max-w-md">
          Looks like this error was spotted! The page or competition room you are looking for does not exist.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all"
      >
        <Home className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};
