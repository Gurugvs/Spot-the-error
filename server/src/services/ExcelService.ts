import * as XLSX from 'xlsx';
import { LeaderboardEntry } from '../../../shared/types';

export class ExcelService {
  public static generateResultsExcel(leaderboard: LeaderboardEntry[], eventName = 'Spot The Errors', roundName = 'Round 1'): Buffer {
    const rows = leaderboard.map(entry => ({
      'Rank': entry.rank === 1 ? '1 🥇' : entry.rank === 2 ? '2 🥈' : entry.rank === 3 ? '3 🥉' : entry.rank,
      'Team Name': entry.name,
      'Score': entry.score,
      'Correct Answers': entry.correctAnswers,
      'Wrong Answers': entry.wrongAnswers,
      'Total Time (s)': entry.totalTime,
      'Status': entry.status.toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 10 }, // Rank
      { wch: 30 }, // Team Name
      { wch: 12 }, // Score
      { wch: 16 }, // Correct
      { wch: 16 }, // Wrong
      { wch: 16 }, // Time
      { wch: 15 }  // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${eventName} Results`.substring(0, 31));

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  public static generateResultsCSV(leaderboard: LeaderboardEntry[]): string {
    const header = 'Rank,Team Name,Score,Correct Answers,Wrong Answers,Total Time (s),Status\n';
    const rows = leaderboard.map(e => 
      `"${e.rank}","${e.name.replace(/"/g, '""')}",${e.score},${e.correctAnswers},${e.wrongAnswers},${e.totalTime},"${e.status}"`
    ).join('\n');
    return header + rows;
  }
}
