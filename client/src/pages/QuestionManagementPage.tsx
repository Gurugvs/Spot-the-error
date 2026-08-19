import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Clock, 
  Award, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';
import { questionApi } from '../services/api';
import { QuestionDTO } from '../../../shared/types';

export const QuestionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionApi.getQuestions();
      setQuestions(data);
    } catch (e) {
      console.error('Failed to load questions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await questionApi.deleteQuestion(id);
        setQuestions(prev => prev.filter(q => q.id !== id));
      } catch (e) {
        alert('Failed to delete question.');
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-surface-card hover:bg-surface-border text-slate-400 hover:text-white border border-surface-border transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary-light">
              QUESTION BANK & PUZZLE REPOSITORY
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
              Manage Difference Puzzles
            </h1>
            <p className="text-xs text-slate-400">
              Create, edit, and annotate dual-image puzzles with normalized difference coordinates.
            </p>
          </div>
        </div>

        <Link
          to="/admin/questions/new"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-110 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Puzzle
        </Link>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            Loading question bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 space-y-3">
            <Layers className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm">No puzzles found. Create a new puzzle or use the pre-seeded puzzles.</p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="glass-panel p-5 rounded-3xl border border-surface-border hover:border-slate-600 transition-all flex flex-col justify-between group space-y-4"
            >
              {/* Dual image thumbnail */}
              <div className="grid grid-cols-2 gap-2 aspect-[16/9] rounded-2xl overflow-hidden bg-surface border border-surface-border">
                <img src={q.imageA} alt="Image A" className="w-full h-full object-contain" />
                <img src={q.imageB} alt="Image B" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-light border border-secondary/30">
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {q.totalDifferences || q.differenceRegions?.length || 5} differences
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mt-2 truncate" title={q.title}>
                  {q.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {q.timeLimit}s
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Award className="w-3.5 h-3.5" /> +{q.points} pts
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/admin/questions/edit/${q.id}`)}
                    className="p-2 rounded-lg bg-surface-card hover:bg-surface-border text-slate-300 hover:text-white transition-colors"
                    title="Edit Difference Regions"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.title)}
                    className="p-2 rounded-lg bg-surface-card hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Puzzle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
