import React from 'react';
import type { UserProfile } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
// FIX: Removed getLevelFromXp as it is not exported from profileService and is not used in this component.
import { getXpForNextLevel } from '../services/profileService.ts';
import { LEVEL_THRESHOLDS } from '../config.ts';


interface LoginWidgetProps {
  userProfile: UserProfile | null;
  onProfileClick: () => void;
}

export const LoginWidget: React.FC<LoginWidgetProps> = ({ userProfile, onProfileClick }) => {
  const { t } = useLanguage();

  if (!userProfile) {
    return null; // Don't render if profile is not loaded yet
  }
  
  const currentLevel = userProfile.level;
  const currentXp = userProfile.xp;
  const xpForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
  const xpForNextLevel = getXpForNextLevel(currentLevel);
  
  const isMaxLevel = currentLevel >= LEVEL_THRESHOLDS.length;
  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  
  const progressPercentage = isMaxLevel ? 100 : Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <button
      onClick={onProfileClick}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-2 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 group"
      aria-label={t('profile.widget.ariaLabel')}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
         <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-600 group-hover:border-primary transition-colors">
            {userProfile.avatar.startsWith('data:image/') ? (
              <img src={userProfile.avatar} alt={t('profile.avatar')} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{userProfile.avatar}</span>
            )}
        </div>
        {/* XP Progress Circle */}
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 52 52">
            <circle
                className="text-primary/20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                r={radius}
                cx="26"
                cy="26"
            />
            <circle
                className="text-primary"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="26"
                cy="26"
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.5s ease-out'
                }}
            />
        </svg>
         {/* Level Badge */}
        <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
            {userProfile.level}
        </div>
      </div>
      <div className="flex-col items-start hidden sm:flex">
        <span className="font-bold text-sm text-black dark:text-white leading-tight">{userProfile.username}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{t('profile.widget.viewProfile')}</span>
      </div>
    </button>
  );
};
