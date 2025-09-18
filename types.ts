// FIX: Exported all necessary types for the application.
export interface Question {
  question: string;
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string;
}

export interface QuizSetupOptions {
  numQuestions: number;
  category: string;
  categoryKey: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  timed: boolean;
  timerDuration: number;
  numOptions: number;
}

export interface QuizResult {
  id: string;
  name: string;
  score: number;
  totalQuestions: number;
  categoryKey: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  date: string;
  userAnswers: (string | null)[];
  questions: Question[];
  userId: string;
  avatar: string;
}

export interface UserProfile {
    id: string;
    username: string;
    avatar: string;
    themeColor: string;
    level: number;
    xp: number;
    leaderboardFilters?: {
        category: string;
        difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
    };
}

export interface AnalyticsData {
    totalPlays: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    averageScorePercentage: number;
    mostPlayedCategory: string | null;
    categoryStats: {
        [categoryKey: string]: {
            plays: number;
            totalCorrect: number;
            totalQuestions: number;
            avgScore: number;
        }
    }
}