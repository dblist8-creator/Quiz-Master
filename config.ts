// App-wide configuration and constants

/**
 * Represents the version of the app's data structures.
 * Incrementing this version will invalidate all existing quiz caches on clients' devices,
 * forcing a complete re-sync of quiz data. This should be done when the format
 * of the `Question` type or other cached data changes in a non-backward-compatible way.
 */
export const APP_VERSION = "1.2.0";

// --- Leveling System Configuration ---

/**
 * Base XP awarded for each correct answer.
 */
export const XP_PER_CORRECT_ANSWER = 10;

/**
 * Multiplier applied to the base XP based on quiz difficulty.
 */
export const DIFFICULTY_XP_MULTIPLIER: { [key in 'Easy' | 'Medium' | 'Hard']: number } = {
    Easy: 1.0,
    Medium: 1.5,
    Hard: 2.0,
};

/**
 * Flat bonus XP awarded for achieving a perfect score (100%).
 */
export const PERFECT_SCORE_BONUS = 50;

/**
 * Defines the XP required to reach each level.
 * The index represents the level (e.g., LEVEL_THRESHOLDS[5] is the XP needed for level 5).
 * Level 1 requires 0 XP. The value is the *total XP* needed, not incremental.
 */
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    800,    // Level 5
    1200,   // Level 6
    1700,   // Level 7
    2300,   // Level 8
    3000,   // Level 9
    4000,   // Level 10
    5200,   // Level 11
    6600,   // Level 12
    8200,   // Level 13
    10000,  // Level 14
    12500,  // Level 15
];

/**
 * Calculates the level based on total XP.
 * @param xp The total experience points of the user.
 * @returns The user's current level.
 */
export const getLevelFromXp = (xp: number): number => {
    // Find the highest level threshold the user has surpassed
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1; // Levels are 1-based
        }
    }
    return 1; // Default to level 1
};
