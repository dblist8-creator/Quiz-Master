import type { UserProfile, QuizResult } from '../types.ts';
import { XP_PER_CORRECT_ANSWER, DIFFICULTY_XP_MULTIPLIER, PERFECT_SCORE_BONUS, getLevelFromXp, LEVEL_THRESHOLDS } from '../config.ts';


const PROFILE_KEY = 'userProfile';

const defaultProfile: UserProfile = {
  id: '', // Will be generated if not present
  username: 'Guest',
  avatar: '👤',
  themeColor: 'blue',
  level: 1,
  xp: 0,
  leaderboardFilters: {
      category: 'all',
      difficulty: 'all'
  }
};

// Simple function to generate a unique-ish ID without external libraries
const generateUniqueId = () => `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const getProfile = (): UserProfile => {
  try {
    const profileJson = localStorage.getItem(PROFILE_KEY);
    let profile: UserProfile;

    if (profileJson) {
      const savedProfile = JSON.parse(profileJson);
      // Ensure the profile has all required fields, falling back to default if needed
      profile = { ...defaultProfile, ...savedProfile };
    } else {
      profile = { ...defaultProfile };
    }
    
    // Assign a unique ID if one doesn't exist
    if (!profile.id) {
      profile.id = generateUniqueId();
      saveProfile(profile); // Save profile with the new ID
    }
    
    return profile;
  } catch (error) {
    console.error("Failed to parse user profile from localStorage", error);
    const profile = { ...defaultProfile, id: generateUniqueId() };
    saveProfile(profile);
    return profile;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    // Ensure ID is always present
    if (!profile.id) {
      profile.id = generateUniqueId();
    }
    const profileJson = JSON.stringify(profile);
    localStorage.setItem(PROFILE_KEY, profileJson);
  } catch (error) {
    console.error("Failed to save user profile to localStorage", error);
  }
};

/**
 * Processes a quiz result to calculate and award XP, and handle leveling up.
 * @param result The result of the completed quiz.
 * @returns An object containing the XP gained and level-up status.
 */
export const processQuizResultForXp = (result: QuizResult) => {
    const profile = getProfile();
    const oldLevel = profile.level;

    // Calculate XP earned
    const baseScoreXp = result.score * XP_PER_CORRECT_ANSWER;
    const difficultyMultiplier = DIFFICULTY_XP_MULTIPLIER[result.difficulty] || 1;
    const difficultyXp = baseScoreXp * difficultyMultiplier;
    
    const isPerfectScore = result.score === result.totalQuestions;
    const perfectScoreBonus = isPerfectScore ? PERFECT_SCORE_BONUS : 0;
    
    const totalXpGained = Math.round(difficultyXp + perfectScoreBonus);
    
    // Update profile
    profile.xp += totalXpGained;
    profile.level = getLevelFromXp(profile.xp);
    
    saveProfile(profile);
    
    const didLevelUp = profile.level > oldLevel;
    
    return {
        xpGained: totalXpGained,
        didLevelUp,
        newLevel: didLevelUp ? profile.level : null,
    };
};

/**
 * Gets the XP needed for the user's next level.
 * @param currentLevel The user's current level.
 * @returns The total XP required for the next level, or the current level's XP if max level.
 */
export const getXpForNextLevel = (currentLevel: number): number => {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; // Already at max level
    }
    return LEVEL_THRESHOLDS[currentLevel]; // Next level is currentLevel index (since levels are 1-based)
};
