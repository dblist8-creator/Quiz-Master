import type { Question, QuizSetupOptions } from '../types.ts';
import { generateQuizQuestions } from './geminiService.ts';
import { logger } from './loggingService.ts';
import { FALLBACK_QUIZZES } from '../offline-data/fallbackQuizzes.ts';
import { APP_VERSION } from '../config.ts';

const CACHE_PREFIX = 'quizdata_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedQuiz {
  timestamp: number;
  version: string;
  questions: Question[];
}

const englishCategoryMap: { [key: string]: string } = {
  "generalKnowledge": "General Knowledge", "animals": "Animals", "art": "Art", "architecture": "Architecture",
  "businessAndFinance": "Business & Finance", "comics": "Comics", "foodAndDrink": "Food & Drink",
  "geography": "Geography", "healthAndMedicine": "Health & Medicine", "history": "History",
  "islamReligion": "Islam Religion", "literature": "Literature", "mathematics": "Mathematics",
  "movies": "Movies", "music": "Music", "mythology": "Mythology", "philosophy": "Philosophy",
  "politics": "Politics", "scienceAndNature": "Science & Nature", "sports": "Sports",
  "technology": "Technology", "television": "Television", "videoGames": "Video Games", "worldReligions": "World Religions"
};

/**
 * Validates the structure and content of quiz data. Exported for use by the sync service.
 */
export const validateQuizData = (data: any): Question[] | null => {
  if (!Array.isArray(data) || data.length === 0) {
    logger.warn('Validation failed: Data is not a non-empty array.');
    return null;
  }

  const questionSet = new Set<string>();

  for (const item of data) {
    if (
      typeof item.question !== 'string' || item.question.trim() === '' ||
      item.type !== 'multiple-choice' || // STRICT: Must be multiple-choice
      !Array.isArray(item.options) ||
      typeof item.correctAnswer !== 'string' || item.correctAnswer.trim() === ''
    ) {
      logger.warn('Validation failed: A question has a missing or invalid basic field or is not multiple-choice.', item);
      return null;
    }

    // STRICT: Must have exactly 4 options and the correct answer must be one of them.
    if (item.options.length !== 4 || !item.options.includes(item.correctAnswer)) {
      logger.warn(`Validation failed: Question does not have exactly 4 options or correctAnswer is invalid.`, item);
      return null;
    }

    // Check for duplicate options within the same question
    if (new Set(item.options).size !== item.options.length) {
        logger.warn('Validation failed: Duplicate options found in a question.', item);
        return null;
    }

    // Check for duplicate questions within the same quiz
    if (questionSet.has(item.question)) {
        logger.warn('Validation failed: Duplicate question found, quiz is invalid.', item.question);
        return null;
    }
    questionSet.add(item.question);
  }

  logger.success('Quiz data validation passed.');
  return data as Question[];
};

/**
 * Retrieves quiz questions from the cache. Exported for use by the sync service.
 */
export const getFromCache = (key: string, silent: boolean = false): Question[] | null => {
    try {
        const cachedItem = localStorage.getItem(key);
        if (!cachedItem) {
            if (!silent) logger.info(`Cache miss for key: ${key}`);
            return null;
        }

        const parsed: CachedQuiz = JSON.parse(cachedItem);

        if (parsed.version !== APP_VERSION) {
            if (!silent) logger.warn(`Cache version mismatch for key: ${key}. Expected ${APP_VERSION}, found ${parsed.version}. Invalidating.`);
            localStorage.removeItem(key);
            return null;
        }
        
        if (Date.now() - parsed.timestamp > CACHE_EXPIRY_MS) {
            if (!silent) logger.warn(`Cache expired for key: ${key}. Removing old data.`);
            localStorage.removeItem(key);
            return null;
        }

        const validatedQuestions = validateQuizData(parsed.questions);
        if (!validatedQuestions) {
            logger.error('Cached data is invalid/corrupted. Removing from cache.');
            localStorage.removeItem(key);
            return null;
        }
        
        if (!silent) logger.success(`Loaded valid quiz from cache for key: ${key}.`);
        return validatedQuestions;

    } catch (error) {
        logger.error('Failed to read or parse cache. Removing item.', { key, error });
        localStorage.removeItem(key);
        return null;
    }
};

/**
 * Saves quiz questions to the local storage cache. Exported for use by the sync service.
 */
export const saveToCache = (key: string, questions: Question[]) => {
    try {
        const cacheItem: CachedQuiz = {
            timestamp: Date.now(),
            version: APP_VERSION,
            questions: questions,
        };
        localStorage.setItem(key, JSON.stringify(cacheItem));
        logger.info(`Successfully saved quiz data to cache. Key: ${key}`);
    } catch (error) {
        logger.error('Failed to save quiz data to cache.', { key, error });
    }
};

/**
 * Fetches a quiz from the Gemini API, validates it, and returns the questions.
 * This is a reusable function for both on-demand and background fetching.
 */
export const fetchQuizFromApi = async (options: QuizSetupOptions): Promise<Question[]> => {
    // Ensure the prompt uses the English category name for better AI understanding,
    // while the `language` code is passed for generating questions in the target language.
    const apiOptions = {
        ...options,
        category: englishCategoryMap[options.categoryKey] || "General Knowledge",
    };

    const fetchedQuestions = await generateQuizQuestions(apiOptions);
    const validatedQuestions = validateQuizData(fetchedQuestions);

    if (validatedQuestions) {
        return validatedQuestions;
    } else {
        throw new Error("AI returned invalid, empty, or corrupted data.");
    }
};

/**
 * Main user-facing function to get a quiz. It prioritizes cache, then falls back
 * to an API call, and finally to preloaded offline data.
 */
export const getQuiz = async (options: QuizSetupOptions): Promise<Question[]> => {
    const cacheKey = `${CACHE_PREFIX}${options.categoryKey}_${options.difficulty}_${options.numQuestions}_${options.language}`;
    logger.info(`User requested quiz for category: '${options.categoryKey}'.`);

    // 1. Prioritize cache (the background service should have filled this)
    const cachedQuestions = getFromCache(cacheKey);
    if (cachedQuestions) {
        return cachedQuestions;
    }

    logger.warn("Quiz not found in cache. Attempting on-demand fetch.");

    // 2. If not in cache, try fetching from API if online
    if (navigator.onLine) {
        logger.info('Attempting to fetch quiz from Gemini API on-demand...');
        try {
            const questions = await fetchQuizFromApi(options);
            logger.success('Successfully fetched and validated on-demand quiz from API.');
            saveToCache(cacheKey, questions);
            return questions;
        } catch (error) {
            logger.error('On-demand API fetch failed. Will now attempt to use offline fallback.', error);
        }
    } else {
        logger.info('Offline mode detected. Cannot fetch on-demand.');
    }
    
    // 3. If API fails or offline, use preloaded fallback quizzes
    logger.warn(`Attempting to use preloaded offline fallback for '${options.categoryKey}'.`);
    
    const fallbackQuiz = FALLBACK_QUIZZES[options.categoryKey];
    if (fallbackQuiz) {
        logger.success(`Loaded category '${options.categoryKey}' from preloaded offline data.`);
        return fallbackQuiz;
    }

    // 4. If all else fails, throw an error
    logger.error(`CRITICAL: No fallback data available for category: '${options.categoryKey}'. All data sources exhausted.`);
    throw new Error(`We couldn't generate a quiz for this topic right now, and no offline version is available. Please check your internet connection or select a different category.`);
};