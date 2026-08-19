import React from 'react';
import { Eye } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-surface-border bg-surface/50 py-6 px-4 sm:px-6 lg:px-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-slate-200">SPOT THE ERRORS</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs sm:text-sm text-slate-300 font-medium">Brahmastra 26'</span>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Brahmastra 26' built by CSE • Published by Chettinad College of Engineering and Technology
        </div>
      </div>
    </footer>
  );
};
