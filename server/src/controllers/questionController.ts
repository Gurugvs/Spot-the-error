import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../models/store';
import { QuestionDTO, DifferenceRegion } from '../../../shared/types';

export async function getQuestions(req: Request, res: Response) {
  try {
    const questions = await store.getAllQuestions();
    return res.json({ success: true, questions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const question = await store.getQuestionById(id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    return res.json({ success: true, question });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const { title, imageA, imageB, difficulty, timeLimit, points, differenceRegions } = req.body;

    if (!title || !imageA || !imageB) {
      return res.status(400).json({ error: 'Title, Image A, and Image B are required.' });
    }

    const regions: DifferenceRegion[] = (differenceRegions || []).map((r: any, idx: number) => ({
      id: r.id || `diff-${idx + 1}-${uuidv4().substring(0, 6)}`,
      name: r.name || `Difference ${idx + 1}`,
      x: Number(r.x),
      y: Number(r.y),
      width: Number(r.width) || 10,
      height: Number(r.height) || 10,
      imageTarget: r.imageTarget || 'both'
    }));

    const newQ = await store.saveQuestion({
      title,
      imageA,
      imageB,
      difficulty: difficulty || 'medium',
      timeLimit: Number(timeLimit) || 30,
      points: Number(points) || 10,
      totalDifferences: regions.length,
      differenceRegions: regions
    });

    return res.status(201).json({ success: true, question: newQ });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await store.getQuestionById(id);
    if (!existing) return res.status(404).json({ error: 'Question not found.' });

    const updated = await store.saveQuestion({
      ...existing,
      ...req.body,
      id,
      totalDifferences: req.body.differenceRegions ? req.body.differenceRegions.length : existing.totalDifferences
    });

    return res.json({ success: true, question: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await store.deleteQuestion(id);
    return res.json({ success: true, message: 'Question deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
