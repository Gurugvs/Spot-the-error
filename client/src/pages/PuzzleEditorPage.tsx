import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageAnnotationEditor } from '../components/ImageAnnotationEditor';
import { questionApi } from '../services/api';
import { QuestionDTO } from '../../../shared/types';
import { SEED_QUESTIONS } from '../../../server/src/services/SeedData';

export const PuzzleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Partial<QuestionDTO> | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);

  useEffect(() => {
    async function load() {
      if (id) {
        try {
          const q = await questionApi.getQuestion(id);
          setQuestion(q);
        } catch (e) {
          console.error('Failed to load question', e);
        } finally {
          setLoading(false);
        }
      } else {
        // Default new template using seed 1 as starter base
        setQuestion({
          title: 'Custom Difference Puzzle',
          difficulty: 'medium',
          timeLimit: 30,
          points: 10,
          imageA: SEED_QUESTIONS[0].imageA,
          imageB: SEED_QUESTIONS[0].imageB,
          differenceRegions: SEED_QUESTIONS[0].differenceRegions,
        });
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async (updated: Partial<QuestionDTO>) => {
    try {
      if (id) {
        await questionApi.updateQuestion(id, updated);
      } else {
        await questionApi.createQuestion(updated);
      }
      navigate('/admin/questions');
    } catch (e: any) {
      alert(e.message || 'Failed to save question.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-500">
        Loading puzzle annotation canvas...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ImageAnnotationEditor
        initialQuestion={question || undefined}
        onSave={handleSave}
        onCancel={() => navigate('/admin/questions')}
      />
    </div>
  );
};
