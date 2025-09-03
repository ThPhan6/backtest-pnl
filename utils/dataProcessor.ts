import { Trade, KPIs } from '../types';
import { GoogleGenAI } from "@google/genai";

// Helper to get week number for a date
const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};


export const calculateKpis = (trades: Trade[]): KPIs => {
  if (trades.length === 0) {
    return { finalPnl: 0, weeklyAvgPnl: 0, monthlyAvgPnl: 0, winRate: 0, totalTrades: 0, avgTradesPerWeek: 0, avgTradesPerMonth: 0, totalWins: 0, totalLosses: 0, longestWinStreak: 0, longestLossStreak: 0, currentStreak: 0, currentStreakType: 'none', highestProfit: 0, highestLoss: 0, totalProfit: 0, totalLoss: 0 };
  }

  const sortedTrades = [...trades].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  let finalPnl = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let highestProfit = 0;
  let highestLoss = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  const weeklyPnls: { [key: string]: number } = {};
  const monthlyPnls: { [key: string]: number } = {};
  const weeklyTradeCounts: { [key: string]: number } = {};
  const monthlyTradeCounts: { [key: string]: number } = {};

  sortedTrades.forEach(trade => {
    finalPnl += trade.profitOrLoss;

    if (trade.profitOrLoss > 0) {
      totalWins++;
      totalProfit += trade.profitOrLoss;
      if (trade.profitOrLoss > highestProfit) {
        highestProfit = trade.profitOrLoss;
      }
    } else if (trade.profitOrLoss < 0) {
      totalLosses++;
      totalLoss += trade.profitOrLoss;
      if (trade.profitOrLoss < highestLoss) {
        highestLoss = trade.profitOrLoss;
      }
    }

    const year = trade.startDate.getFullYear();
    const week = getWeekNumber(trade.startDate);
    const month = trade.startDate.getMonth();
    
    const weekKey = `${year}-${week}`;
    const monthKey = `${year}-${month}`;

    weeklyPnls[weekKey] = (weeklyPnls[weekKey] || 0) + trade.profitOrLoss;
    monthlyPnls[monthKey] = (monthlyPnls[monthKey] || 0) + trade.profitOrLoss;
    weeklyTradeCounts[weekKey] = (weeklyTradeCounts[weekKey] || 0) + 1;
    monthlyTradeCounts[monthKey] = (monthlyTradeCounts[monthKey] || 0) + 1;
  });

  // Streak calculation
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  sortedTrades.forEach(trade => {
    if (trade.profitOrLoss > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > longestWinStreak) {
        longestWinStreak = currentWinStreak;
      }
    } else if (trade.profitOrLoss < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > longestLossStreak) {
        longestLossStreak = currentLossStreak;
      }
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  });

  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  if (sortedTrades.length > 0) {
      const lastTradeSign = Math.sign(sortedTrades[sortedTrades.length - 1].profitOrLoss);
      if (lastTradeSign !== 0) {
          for (let i = sortedTrades.length - 1; i >= 0; i--) {
              if (Math.sign(sortedTrades[i].profitOrLoss) === lastTradeSign) {
                  currentStreak++;
              } else {
                  break;
              }
          }
          currentStreakType = lastTradeSign > 0 ? 'win' : 'loss';
      }
  }


  const totalWeeks = Object.keys(weeklyPnls).length;
  const totalMonths = Object.keys(monthlyPnls).length;

  const weeklyAvgPnl = totalWeeks > 0 ? Object.values(weeklyPnls).reduce((sum, pnl) => sum + pnl, 0) / totalWeeks : 0;
  const monthlyAvgPnl = totalMonths > 0 ? Object.values(monthlyPnls).reduce((sum, pnl) => sum + pnl, 0) / totalMonths : 0;
  
  const avgTradesPerWeek = totalWeeks > 0 ? trades.length / totalWeeks : 0;
  const avgTradesPerMonth = totalMonths > 0 ? trades.length / totalMonths : 0;

  const winRate = trades.length > 0 ? (totalWins / trades.length) * 100 : 0;

  return {
    finalPnl,
    weeklyAvgPnl,
    monthlyAvgPnl,
    winRate,
    totalTrades: trades.length,
    avgTradesPerWeek,
    avgTradesPerMonth,
    totalWins,
    totalLosses,
    longestWinStreak,
    longestLossStreak,
    currentStreak,
    currentStreakType,
    highestProfit,
    highestLoss,
    totalProfit,
    totalLoss,
  };
};

export interface MonthlyPnlData {
    month: string;
    pnl: number;
}

export interface MonthlyHighLowData {
    month: string;
    highest: number;
    lowest: number;
}

export const calculateChartData = (trades: Trade[]): { monthlyPnl: MonthlyPnlData[], monthlyHighLow: MonthlyHighLowData[] } => {
    if (trades.length === 0) {
        return { monthlyPnl: [], monthlyHighLow: [] };
    }

    const sortedTrades = [...trades].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    const monthlyData: { [key: string]: { pnl: number, trades: number[] } } = {};

    sortedTrades.forEach(trade => {
        const monthKey = `${trade.startDate.getFullYear()}-${String(trade.startDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { pnl: 0, trades: [] };
        }
        monthlyData[monthKey].pnl += trade.profitOrLoss;
        monthlyData[monthKey].trades.push(trade.profitOrLoss);
    });

    const monthKeys = Object.keys(monthlyData).sort();
    
    const monthlyPnl: MonthlyPnlData[] = monthKeys.map(key => {
        const date = new Date(`${key}-01T00:00:00Z`);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear()).slice(-2);
        return {
            month: `${month}${year}`,
            pnl: monthlyData[key].pnl,
        };
    });

    const monthlyHighLow: MonthlyHighLowData[] = monthKeys.map(key => {
        const date = new Date(`${key}-01T00:00:00Z`);
        const tradesInMonth = monthlyData[key].trades;
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear()).slice(-2);
        return {
            month: `${month}${year}`,
            highest: Math.max(...tradesInMonth.filter(pnl => pnl > 0), 0),
            lowest: Math.min(...tradesInMonth.filter(pnl => pnl < 0), 0),
        };
    });

    return { monthlyPnl, monthlyHighLow };
};


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GEMINI_PROMPT = `
You are an expert at analyzing images of financial trading statements.
Extract the trading data from the provided image.
The data should be formatted as a CSV with the following headers: 'Pair', 'Start Date', 'Status', 'Trade Type', 'Profit/Loss'.
- 'Pair': The currency or stock pair, e.g., EUR/USD.
- 'Start Date': The date the trade was opened. Format as YYYY-MM-DD HH:mm:ss if possible, otherwise use the format in the image.
- 'Status': The status of the trade, e.g., 'Closed', 'Open'.
- 'Trade Type': Must be either 'buy' or 'sell'.
- 'Profit/Loss': A number representing the profit or loss. Do not include currency symbols or commas. A loss should be a negative number.

Ensure the output is ONLY the CSV text, including the header row. Do not include any other explanatory text or markdown formatting.
`;

export const extractTradesFromImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: GEMINI_PROMPT };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts) {
            throw new Error("Invalid AI response structure. No content found.");
        }

        const csvText = response.candidates[0].content.parts
            .map(part => part.text)
            .filter(text => !!text)
            .join('')
            .trim();
        
        const cleanedCsv = csvText.replace(/```csv\n/g, '').replace(/```/g, '').trim();

        if (!cleanedCsv) {
            throw new Error("Could not extract any data from the image. Please ensure the image is clear and contains a trade table.");
        }

        return cleanedCsv;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze image with AI: ${error.message}`);
        }
        throw new Error('An unknown error occurred while analyzing the image.');
    }
};