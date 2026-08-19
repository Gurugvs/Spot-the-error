import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { ExcelService } from '../services/ExcelService';
import { gameEngine } from '../services/GameEngine';
import { store } from '../models/store';

export async function getAnalytics(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const analytics = await AnalyticsService.getRoomAnalytics(roomCode);
    return res.json({ success: true, analytics });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getGameResults(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const summary = await store.getWinnerSummary(roomCode);
    const leaderboard = await gameEngine.getLeaderboard(roomCode);

    return res.json({
      success: true,
      summary,
      leaderboard
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function exportExcel(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const room = await store.getRoom(roomCode);
    const leaderboard = await gameEngine.getLeaderboard(roomCode);

    const buffer = ExcelService.generateResultsExcel(
      leaderboard,
      room?.eventName || 'Spot The Errors',
      room?.roundName || 'Round 1'
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="spot-the-errors-results-${roomCode}.xlsx"`);
    return res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function exportCSV(req: Request, res: Response) {
  try {
    const { roomCode } = req.params;
    const leaderboard = await gameEngine.getLeaderboard(roomCode);
    const csv = ExcelService.generateResultsCSV(leaderboard);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="spot-the-errors-results-${roomCode}.csv"`);
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
