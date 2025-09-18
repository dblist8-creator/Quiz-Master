import { categoryKeys } from '../categories.ts';
import { supportedLanguages } from '../locales.ts';
import type { QuizSetupOptions } from '../types.ts';
import { logger } from './loggingService.ts';
import { getFromCache, saveToCache, fetchQuizFromApi } from './quizDataService.ts';

const DIFFICULTIES: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];
const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // Sync every 6 hours
const REQUEST_DELAY_MS = 1000; // 1-second delay between API calls to avoid rate limiting
const STANDARD_NUM_QUESTIONS = 10;
const STANDARD_NUM_OPTIONS = 4;
const MAX_RETRIES = 1; // Simple retry for transient network issues

let isSyncing = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Checks if a quiz for the given configuration is already cached. If not, it fetches,
 * validates, and caches it from the API.
 */
const syncAndCacheQuiz = async (options: QuizSetupOptions): Promise<boolean> => {
    const { categoryKey, difficulty, numQuestions, language } = options;
    const cacheKey = `quizdata_cache_${categoryKey}_${difficulty}_${numQuestions}_${language}`;
    
    // 1. Check if a valid quiz is already in the cache (silent check)
    if (getFromCache(cacheKey, true)) {
        return false; // Already cached, no update happened
    }
    
    logger.info(`Syncing quiz for: [${categoryKey}] in [${language}] (${difficulty})...`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // 2. Fetch from the API and validate
            const questions = await fetchQuizFromApi(options);
            
            // 3. Save to cache
            saveToCache(cacheKey, questions);
            logger.success(`Successfully synced and cached quiz for [${categoryKey}] in [${language}].`);
            return true; // Cache was updated
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            logger.error(`Attempt ${attempt + 1} failed for [${categoryKey}] in [${language}]. Reason: ${errorMessage}`);
            if (attempt < MAX_RETRIES) {
                await delay(REQUEST_DELAY_MS * 2); // Wait a bit longer before retry
            }
        }
    }
    return false; // All attempts failed, no update
};

/**
 * The main sync process that iterates through all desired quiz configurations.
 */
const startSync = async (): Promise<boolean> => {
    if (isSyncing) {
        logger.warn("Sync is already in progress. Skipping new request.");
        return false;
    }
    if (!navigator.onLine) {
        logger.info("Offline. Sync will be postponed until connection is restored.");
        return false;
    }

    isSyncing = true;
    logger.info("Starting background quiz synchronization process...");
    let didUpdateCache = false;

    const syncQueue: QuizSetupOptions[] = [];
    for (const lang of supportedLanguages) {
        for (const categoryKey of categoryKeys) {
            for (const difficulty of DIFFICULTIES) {
                syncQueue.push({
                    numQuestions: STANDARD_NUM_QUESTIONS,
                    category: '', // This will be populated by fetchQuizFromApi
                    categoryKey: categoryKey,
                    difficulty: difficulty,
                    language: lang.code,
                    timed: false,
                    timerDuration: 0,
                    numOptions: STANDARD_NUM_OPTIONS
                });
            }
        }
    }
    
    logger.info(`Sync queue created with ${syncQueue.length} quiz configurations.`);

    for (let i = 0; i < syncQueue.length; i++) {
        if (!navigator.onLine) {
            logger.warn("Connection lost. Pausing sync.");
            isSyncing = false;
            return didUpdateCache;
        }
        logger.info(`Sync progress: ${i + 1} / ${syncQueue.length}`);
        const updated = await syncAndCacheQuiz(syncQueue[i]);
        if (updated) {
            didUpdateCache = true;
        }
        await delay(REQUEST_DELAY_MS);
    }

    isSyncing = false;
    if (didUpdateCache) {
        logger.success("Background quiz synchronization process completed. New quizzes were cached.");
    } else {
        logger.success("Background quiz synchronization process completed. All quizzes were up-to-date.");
    }
    return didUpdateCache;
};

export const quizSyncService = {
  /**
   * Initializes the background sync service.
   */
  init: (onSyncComplete: (didUpdate: boolean) => void) => {
    const runSync = async () => {
        const didUpdate = await startSync();
        if (didUpdate) {
            onSyncComplete(true);
        }
    };

    logger.info("Initializing Quiz Sync Service.");
    
    // Initial sync on app load (after a short delay to not block UI)
    setTimeout(runSync, 5000); 
    
    // Set up periodic sync
    setInterval(runSync, SYNC_INTERVAL_MS);
    
    // Add event listener for when the app comes back online
    window.addEventListener('online', () => {
        logger.info("Connection restored. Triggering background sync.");
        runSync();
    });
  }
};