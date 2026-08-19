import { store } from '../models/store';
import { AnalyticsData, LeaderboardEntry } from '../../../shared/types';

export class AnalyticsService {
  public static async getRoomAnalytics(roomCode: string): Promise<AnalyticsData> {
    const code = roomCode.toUpperCase();
    const participants = await store.getParticipantsByRoom(code);
    const answers = await store.getAnswersByRoom(code);
    const questions = await store.getAllQuestions();

    const totalParticipants = participants.length;
    if (totalParticipants === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        highestScore: 0,
        averageCompletionTime: 0,
        easiestQuestion: { title: 'N/A', accuracy: 0 },
        mostDifficultQuestion: { title: 'N/A', accuracy: 0 },
        scoreDistribution: [
          { scoreRange: '0-20', count: 0 },
          { scoreRange: '21-40', count: 0 },
          { scoreRange: '41-60', count: 0 },
          { scoreRange: '61-80', count: 0 },
          { scoreRange: '81-100+', count: 0 },
        ],
        questionAccuracy: [],
        timelineData: []
      };
    }

    const scores = participants.map(p => p.score);
    const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalParticipants) * 10) / 10;
    const highestScore = Math.max(...scores);
    const avgTime = Math.round((participants.map(p => p.totalTime).reduce((a, b) => a + b, 0) / totalParticipants) * 10) / 10;

    // Score distribution
    const dist = [
      { scoreRange: '0-20', count: 0 },
      { scoreRange: '21-40', count: 0 },
      { scoreRange: '41-60', count: 0 },
      { scoreRange: '61-80', count: 0 },
      { scoreRange: '81-100+', count: 0 },
    ];
    for (const s of scores) {
      if (s <= 20) dist[0].count++;
      else if (s <= 40) dist[1].count++;
      else if (s <= 60) dist[2].count++;
      else if (s <= 80) dist[3].count++;
      else dist[4].count++;
    }

    // Question accuracy
    const questionAccuracy = questions.map(q => {
      const qAnswers = answers.filter(a => a.questionId === q.id);
      const correctCount = qAnswers.filter(a => a.correct).length;
      const totalAnswers = qAnswers.length || 1;
      const accuracy = Math.round((correctCount / totalAnswers) * 100);
      const avgAnsTime = qAnswers.length > 0 
        ? Math.round((qAnswers.reduce((a, b) => a + b.timeTaken, 0) / qAnswers.length) * 10) / 10
        : 15;

      return {
        question: q.title.length > 20 ? q.title.substring(0, 20) + '...' : q.title,
        accuracy,
        avgTime: avgAnsTime
      };
    });

    const sortedByAcc = [...questionAccuracy].sort((a, b) => b.accuracy - a.accuracy);
    const easiestQuestion = sortedByAcc.length > 0 ? { title: sortedByAcc[0].question, accuracy: sortedByAcc[0].accuracy } : { title: 'N/A', accuracy: 0 };
    const mostDifficultQuestion = sortedByAcc.length > 0 ? { title: sortedByAcc[sortedByAcc.length - 1].question, accuracy: sortedByAcc[sortedByAcc.length - 1].accuracy } : { title: 'N/A', accuracy: 0 };

    return {
      totalParticipants,
      averageScore,
      highestScore,
      averageCompletionTime: avgTime,
      easiestQuestion,
      mostDifficultQuestion,
      scoreDistribution: dist,
      questionAccuracy,
      timelineData: [
        { time: 'Start', averageScore: 0 },
        { time: 'Q1', averageScore: Math.round(averageScore * 0.35) },
        { time: 'Q2', averageScore: Math.round(averageScore * 0.7) },
        { time: 'Final', averageScore }
      ]
    };
  }
}
