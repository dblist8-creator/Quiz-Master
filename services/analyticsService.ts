// FIX: Imported AnalyticsData from the central types file.
import type { QuizResult, AnalyticsData } from '../types.ts';
import { logger } from './loggingService.ts';

const ANALYTICS_EVENTS_KEY = 'quizAnalyticsEvents';

type AnalyticsEvent =
  | { type: 'QUIZ_START'; payload: { categoryKey: string; difficulty: string; timestamp: number } }
  | { type: 'QUIZ_COMPLETE'; payload: { result: QuizResult; timestamp: number } };

const getEvents = (): AnalyticsEvent[] => {
    try {
        const data = localStorage.getItem(ANALYTICS_EVENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        logger.error("Failed to parse analytics events", e);
        return [];
    }
};

const saveEvents = (events: AnalyticsEvent[]) => {
    try {
        localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
        logger.error("Failed to save analytics events", e);
    }
};

export const analyticsService = {
    logQuizStart: (categoryKey: string, difficulty: string) => {
        const events = getEvents();
        events.push({
            type: 'QUIZ_START',
            payload: { categoryKey, difficulty, timestamp: Date.now() }
        });
        saveEvents(events);
    },

    logQuizComplete: (result: QuizResult) => {
        const events = getEvents();
        events.push({
            type: 'QUIZ_COMPLETE',
            payload: { result, timestamp: Date.now() }
        });
        saveEvents(events);
    },

    getAnalytics: (): AnalyticsData => {
        const events = getEvents();
        const quizCompletions = events.filter(e => e.type === 'QUIZ_COMPLETE') as Extract<AnalyticsEvent, {type: 'QUIZ_COMPLETE'}>[];

        const initialData: AnalyticsData = {
            totalPlays: 0,
            totalQuestionsAnswered: 0,
            totalCorrectAnswers: 0,
            averageScorePercentage: 0,
            mostPlayedCategory: null,
            categoryStats: {}
        };

        if (quizCompletions.length === 0) {
            return initialData;
        }

        const data = quizCompletions.reduce((acc, event) => {
            const { result } = event.payload;
            const { categoryKey, score, totalQuestions } = result;

            acc.totalPlays += 1;
            acc.totalCorrectAnswers += score;
            acc.totalQuestionsAnswered += totalQuestions;

            if (!acc.categoryStats[categoryKey]) {
                acc.categoryStats[categoryKey] = { plays: 0, totalCorrect: 0, totalQuestions: 0, avgScore: 0 };
            }
            const stats = acc.categoryStats[categoryKey];
            stats.plays += 1;
            stats.totalCorrect += score;
            stats.totalQuestions += totalQuestions;

            return acc;
        }, initialData);

        data.averageScorePercentage = data.totalQuestionsAnswered > 0 ? Math.round((data.totalCorrectAnswers / data.totalQuestionsAnswered) * 100) : 0;
        
        Object.keys(data.categoryStats).forEach(key => {
            const stats = data.categoryStats[key];
            stats.avgScore = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
        });

        data.mostPlayedCategory = Object.entries(data.categoryStats).sort(([, a], [, b]) => b.plays - a.plays)[0]?.[0] || null;

        return data;
    },
    
    clearAnalytics: () => {
        try {
            localStorage.removeItem(ANALYTICS_EVENTS_KEY);
            logger.info("Analytics data cleared.");
        } catch (e) {
            logger.error("Failed to clear analytics data", e);
        }
    }
};
