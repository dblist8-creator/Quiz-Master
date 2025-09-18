// FIX: Corrected import path to include file extension.
import type { QuizResult } from '../types.ts';

const HISTORY_KEY = 'quizHistory';

export const getHistory = (): QuizResult[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse quiz history from localStorage", error);
    return [];
  }
};

export const saveHistory = (history: QuizResult[]): void => {
  try {
    const historyJson = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, historyJson);
  } catch (error) {
    console.error("Failed to save quiz history to localStorage", error);
  }
};

export const addResult = (result: QuizResult): void => {
  const history = getHistory();
  // Add new result to the beginning of the array
  const newHistory = [result, ...history];
  saveHistory(newHistory);
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear quiz history from localStorage", error);
  }
};