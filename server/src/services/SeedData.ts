import { store } from '../models/store';
import { SEED_QUESTIONS } from '../../../shared/seedData';

export { SEED_QUESTIONS };

export async function seedInitialQuestions() {
  const existing = await store.getAllQuestions();
  if (existing.length === 0) {
    console.log('[Seed] Populating 3 master competition demo puzzles with SVG image pairs...');
    for (const q of SEED_QUESTIONS) {
      await store.saveQuestion(q);
    }
    console.log('[Seed] Successfully seeded master puzzles.');
  }
}
