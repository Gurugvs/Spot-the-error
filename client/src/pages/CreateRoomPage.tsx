import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Settings, 
  Clock, 
  Award, 
  AlertTriangle, 
  Users, 
  ArrowLeft, 
  Check, 
  Layers 
} from 'lucide-react';
import { roomApi, questionApi } from '../services/api';
import { QuestionDTO, RoomSettings } from '../../../shared/types';

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [eventName, setEventName] = useState('SPOT THE ERRORS 2026');
  const [roundName, setRoundName] = useState('Prelims Round 1');
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30);
  const [pointsPerDifference, setPointsPerDifference] = useState<number>(10);
  const [negativeMarking, setNegativeMarking] = useState<number>(0);
  const [fastestAnswerBonus, setFastestAnswerBonus] = useState<number>(5);
  const [showLeaderboardDuringGame, setShowLeaderboardDuringGame] = useState<boolean>(true);
  const [showCorrectAnswersAfterQuestion, setShowCorrectAnswersAfterQuestion] = useState<boolean>(true);
  const [allowLateJoin, setAllowLateJoin] = useState<boolean>(false);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const qList = await questionApi.getQuestions();
        setQuestions(qList);
        setSelectedQuestionIds(qList.map(q => q.id)); // default select all
      } catch (e) {
        console.error('Failed to load questions', e);
      }
    }
    loadQuestions();
  }, []);

  const toggleQuestionSelect = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      if (selectedQuestionIds.length === 1) {
        alert('You must select at least 1 puzzle question.');
        return;
      }
      setSelectedQuestionIds(prev => prev.filter(qId => qId !== id));
    } else {
      setSelectedQuestionIds(prev => [...prev, id]);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least 1 question.');
      return;
    }

    setLoading(true);
    try {
      const settings: RoomSettings = {
        eventName,
        roundName,
        maxParticipants,
        timePerQuestion,
        pointsPerDifference,
        negativeMarking,
        fastestAnswerBonus,
        showLeaderboardDuringGame,
        showCorrectAnswersAfterQuestion,
        allowLateJoin,
        soundEffects,
      };

      const newRoom = await roomApi.createRoom(settings, selectedQuestionIds);
      navigate(`/admin/room/${newRoom.roomCode}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="p-2 rounded-xl bg-surface-card hover:bg-surface-border text-slate-400 hover:text-white border border-surface-border transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Create Competition Room
          </h1>
          <p className="text-xs text-slate-400">
            Configure round rules, scoring parameters, and select spot-the-error puzzles.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateRoom} className="space-y-6">
        {/* SECTION 1: EVENT DETAILS */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-4">
          <h2 className="text-sm font-bold text-primary-light uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4" /> 1. Event & Round Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Event Name</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. SPOT THE ERRORS 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Round Name</label>
              <input
                type="text"
                required
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. Prelims Round 1 / Grand Finals"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Maximum Participants
              </label>
              <input
                type="number"
                min={2}
                max={500}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Time Per Question (Seconds)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SCORING RULES */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-4">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" /> 2. Custom Scoring & Penalties
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Points per Correct Difference
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={pointsPerDifference}
                onChange={(e) => setPointsPerDifference(Number(e.target.value))}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Negative Marking (Wrong Tap)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={negativeMarking}
                onChange={(e) => setNegativeMarking(Number(e.target.value))}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-slate-500">Set 0 for no penalty</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Fastest Answer Speed Bonus
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={fastestAnswerBonus}
                onChange={(e) => setFastestAnswerBonus(Number(e.target.value))}
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-slate-500">Awarded if found in ≤5s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-surface-border/50">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl bg-surface-card hover:bg-surface-border/60 transition-colors">
              <input
                type="checkbox"
                checked={showLeaderboardDuringGame}
                onChange={(e) => setShowLeaderboardDuringGame(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-slate-200">
                Show Live Leaderboard During Gameplay
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl bg-surface-card hover:bg-surface-border/60 transition-colors">
              <input
                type="checkbox"
                checked={showCorrectAnswersAfterQuestion}
                onChange={(e) => setShowCorrectAnswersAfterQuestion(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-slate-200">
                Reveal Solution After Each Question
              </span>
            </label>
          </div>
        </div>

        {/* SECTION 3: PUZZLE SELECTION */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-light uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> 3. Select Competition Puzzles ({selectedQuestionIds.length} Selected)
            </h2>
            <Link
              to="/admin/questions/new"
              className="text-xs font-bold text-secondary hover:underline"
            >
              + Create New Custom Puzzle
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {questions.map((q) => {
              const isSelected = selectedQuestionIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestionSelect(q.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-surface-border bg-surface-card opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-surface-border">
                      <img src={q.imageA} alt={q.title} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-white truncate" title={q.title}>
                        {q.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="capitalize text-secondary">{q.difficulty}</span>
                        <span>•</span>
                        <span>{q.totalDifferences || q.differenceRegions?.length || 5} differences</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-surface-border flex items-center justify-between text-xs">
                    <span className="text-slate-400">{q.timeLimit}s</span>
                    <span className={`font-bold ${isSelected ? 'text-primary-light' : 'text-slate-500'}`}>
                      {isSelected ? '✓ Selected' : 'Click to Add'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-secondary text-white font-display font-black text-lg shadow-xl shadow-primary/30 hover:brightness-110 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? 'Generating Room...' : 'CREATE ROOM & LAUNCH LOBBY'}
        </button>
      </form>
    </div>
  );
};
