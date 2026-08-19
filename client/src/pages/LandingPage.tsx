import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Sparkles, 
  Users, 
  Zap, 
  Trophy, 
  ArrowRight, 
  Smartphone, 
  Monitor, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { SEED_QUESTIONS } from '../../../server/src/services/SeedData';
import { DualImageSpotter } from '../components/DualImageSpotter';

export const LandingPage: React.FC = () => {
  const samplePuzzle = SEED_QUESTIONS[0];
  const [foundInDemo, setFoundInDemo] = useState<string[]>([]);
  const [demoScore, setDemoScore] = useState<number>(0);

  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex flex-col items-center text-center">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-primary/40 text-xs font-bold text-primary-light mb-6 shadow-lg shadow-primary/10 animate-float">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>COLLEGE EVENT MULTIPLAYER PLATFORM</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-white max-w-5xl leading-[1.1]">
          SPOT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-secondary glow-text-primary">ERRORS</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl leading-relaxed">
          “Find the Difference. Beat the Clock. Become the Champion.”
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/admin/create-room"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-secondary text-white font-display font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <Monitor className="w-5 h-5" />
            CREATE ROOM (ORGANIZER)
          </Link>

          <Link
            to="/join"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-card hover:bg-surface-border text-slate-100 font-display font-bold text-lg border border-surface-border hover:border-secondary shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <Smartphone className="w-5 h-5 text-secondary" />
            JOIN ROOM (PARTICIPANT)
          </Link>
        </div>

        {/* Quick event specs pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 100+ Concurrent Players
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Real-time Touch Hit Detection
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Projector Presentation Ready
          </span>
        </div>
      </section>

      {/* INTERACTIVE SAMPLE SPOT DEMO SECTION */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/50 pb-4">
            <div>
              <div className="inline-block text-[11px] uppercase font-bold text-secondary tracking-wider mb-1">
                INTERACTIVE LIVE PREVIEW
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                Try Spotting a Difference Right Here!
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-surface-card rounded-xl border border-surface-border text-xs font-bold text-slate-300">
                Spotted: <span className="text-emerald-400">{foundInDemo.length}</span>/{samplePuzzle.differenceRegions?.length || 5}
              </div>
              <div className="px-3.5 py-1.5 bg-primary/20 rounded-xl border border-primary/30 text-xs font-bold text-primary-light">
                Demo Score: +{demoScore} PTS
              </div>
            </div>
          </div>

          <DualImageSpotter
            imageA={samplePuzzle.imageA}
            imageB={samplePuzzle.imageB}
            foundRegions={samplePuzzle.differenceRegions?.filter(r => foundInDemo.includes(r.id))}
            onTap={async (x, y) => {
              const TOLERANCE = 4.5;
              const hit = samplePuzzle.differenceRegions?.find(
                r =>
                  x >= r.x - r.width / 2 - TOLERANCE &&
                  x <= r.x + r.width / 2 + TOLERANCE &&
                  y >= r.y - r.height / 2 - TOLERANCE &&
                  y <= r.y + r.height / 2 + TOLERANCE
              );

              if (hit && !foundInDemo.includes(hit.id)) {
                setFoundInDemo(prev => [...prev, hit.id]);
                setDemoScore(prev => prev + 10);
                return {
                  correct: true,
                  differenceId: hit.id,
                  region: hit,
                  scoreGained: 10,
                  currentScore: demoScore + 10,
                  differencesFoundCount: foundInDemo.length + 1,
                  totalDifferences: samplePuzzle.differenceRegions?.length || 5,
                  message: `Found: ${hit.name}`,
                };
              }
              return {
                correct: false,
                scoreGained: 0,
                currentScore: demoScore,
                differencesFoundCount: foundInDemo.length,
                totalDifferences: samplePuzzle.differenceRegions?.length || 5,
                message: 'No difference at this spot',
              };
            }}
          />
        </div>
      </section>

      {/* EVENT FEATURES GRID */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary-light">
            BUILT FOR COLLEGE CULTURAL & TECH EVENTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-white mt-2">
            Engineered For Pure Adrenaline & Fair Competition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-surface-border hover:border-primary/50 transition-all hover:scale-[1.02] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Live Multiplayer</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Hundreds of participants join via dynamic QR code on their mobile phones. Instant lobby sync without manual refreshes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-border/40 text-[11px] font-semibold text-primary-light">
              Zero App Installs Required
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-surface-border hover:border-secondary/50 transition-all hover:scale-[1.02] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary-light flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Real-Time Scoring</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Sub-millisecond normalized touch evaluation. Correct difference hits trigger instant score boosts, sound effects, and feedback.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-border/40 text-[11px] font-semibold text-secondary-light">
              Authoritative Server Scoring
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-surface-border hover:border-accent/50 transition-all hover:scale-[1.02] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Fastest Finger Bonus</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Configurable speed bonuses for lightning-fast answers, negative marking for spam taps, and tap rate-limiting anti-cheat protection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-border/40 text-[11px] font-semibold text-accent">
              Customizable Penalty Rules
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-surface-border hover:border-emerald-500/50 transition-all hover:scale-[1.02] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Automatic Winner Detection</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                4-tier tie-breaking algorithm, celebratory confetti podium, instant Excel/CSV report exports, and full projector presentation mode.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-border/40 text-[11px] font-semibold text-emerald-400">
              1-Click Results Download
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl border border-primary/40 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
            Ready to host your college event?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Launch a room in 30 seconds, display the QR code on your auditorium projector, and let the live competition begin!
          </p>
          <div className="pt-2">
            <Link
              to="/admin/create-room"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-display font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
