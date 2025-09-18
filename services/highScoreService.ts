import type { QuizResult } from '../types';

const HIGH_SCORES_KEY = 'quizHighScores';
const MAX_SCORES = 10; // Keep top 10 scores

export const getHighScores = (): QuizResult[] => {
  try {
    const scoresJson = localStorage.getItem(HIGH_SCORES_KEY);
    return scoresJson ? JSON.parse(scoresJson) : [];
  } catch (error) {
    console.error("Failed to parse high scores from localStorage", error);
    return [];
  }
};

export const addHighScore = (result: QuizResult): void => {
  try {
    const highScores = getHighScores();
    const newScores = [...highScores, result];
    
    // Sort by score percentage descending, then by date descending
    newScores.sort((a, b) => {
        const scoreA = (a.score / a.totalQuestions);
        const scoreB = (b.score / b.totalQuestions);
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }
        return new Date(b.id).getTime() - new Date(a.id).getTime();
    });

    // Keep only top N scores
    const topScores = newScores.slice(0, MAX_SCORES);
    
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(topScores));
  } catch (error) {
    console.error("Failed to save high score to localStorage", error);
  }
};
