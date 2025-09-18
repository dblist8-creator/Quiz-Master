import React, { useState, useMemo, useEffect } from 'react';
import type { QuizResult, UserProfile } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { categoryKeys } from '../categories.ts';

interface LeaderboardScreenProps {
  scores: QuizResult[];
  currentUserProfile: UserProfile;
  onFiltersChange: (filters: { category: string; difficulty: 'all' | 'Easy' | 'Medium' | 'Hard' }) => void;
}

const Avatar: React.FC<{ avatar: string; altText: string; sizeClass?: string; textClass?: string }> = ({ avatar, altText, sizeClass = 'w-12 h-12', textClass = 'text-3xl' }) => (
    <div className={`${sizeClass} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600 flex-shrink-0`}>
        {avatar.startsWith('data:image/') ? (
            <img src={avatar} alt={altText} className="w-full h-full object-cover" />
        ) : (
            <span className={textClass}>{avatar}</span>
        )}
    </div>
);

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ scores, currentUserProfile, onFiltersChange }) => {
    const { t } = useLanguage();
    
    const [categoryFilter, setCategoryFilter] = useState(currentUserProfile.leaderboardFilters?.category || 'all');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>(currentUserProfile.leaderboardFilters?.difficulty || 'all');

    useEffect(() => {
        onFiltersChange({ category: categoryFilter, difficulty: difficultyFilter });
    }, [categoryFilter, difficultyFilter, onFiltersChange]);

    const filteredScores = useMemo(() => {
        return scores.filter(score => {
            const categoryMatch = categoryFilter === 'all' || score.categoryKey === categoryFilter;
            const difficultyMatch = difficultyFilter === 'all' || score.difficulty === difficultyFilter;
            return categoryMatch && difficultyMatch;
        }).sort((a, b) => {
            const scoreA = (a.score / a.totalQuestions);
            const scoreB = (b.score / b.totalQuestions);
            if (scoreB !== scoreA) return scoreB - scoreA;
            return new Date(b.id).getTime() - new Date(a.id).getTime();
        });
    }, [scores, categoryFilter, difficultyFilter]);

    const { currentUserBestScore, rank } = useMemo(() => {
        const rankIndex = filteredScores.findIndex(score => score.userId === currentUserProfile.id);
        
        if (rankIndex !== -1) {
            return {
                currentUserBestScore: filteredScores[rankIndex],
                rank: rankIndex + 1
            };
        }
        return { currentUserBestScore: null, rank: null };
    }, [filteredScores, currentUserProfile.id]);

    const top3Scores = useMemo(() => filteredScores.slice(0, 3), [filteredScores]);
    const otherScores = useMemo(() => filteredScores.slice(3), [filteredScores]);

    const rankClasses = {
        1: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-400', shadow: 'shadow-yellow-400/50', icon: '🥇' },
        2: { bg: 'bg-slate-100 dark:bg-slate-700/50', border: 'border-slate-400', shadow: 'shadow-slate-400/50', icon: '🥈' },
        3: { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-600', shadow: 'shadow-amber-500/50', icon: '🥉' }
    };

    const difficultyOptions: Array<'all' | 'Easy' | 'Medium' | 'Hard'> = ['all', 'Easy', 'Medium', 'Hard'];

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto animate-fadeInUp border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-6">{t('leaderboard.title')}</h2>
            
            {/* Filters */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-700">
                <div>
                    <label htmlFor="difficulty-filter" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('leaderboard.filterByDifficulty')}</label>
                    <div className="flex rounded-md shadow-sm">
                        {difficultyOptions.map((level, index) => (
                            <button key={level} type="button" onClick={() => setDifficultyFilter(level)}
                                className={`relative ${index > 0 ? '-ml-px' : ''} inline-flex items-center justify-center flex-1 px-4 py-2 border text-sm font-medium transition-colors focus:outline-none focus:z-10 focus:ring-2 focus:ring-primary ${index === 0 ? 'rounded-l-md' : ''} ${index === difficultyOptions.length - 1 ? 'rounded-r-md' : ''} ${
                                    difficultyFilter === level
                                        ? 'bg-primary text-white border-primary z-10'
                                        : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                                }`}
                                aria-pressed={difficultyFilter === level}>
                                {t(`leaderboard.filter.${level.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('leaderboard.filterByCategory')}</label>
                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                        <option value="all">{t('leaderboard.allCategories')}</option>
                        {categoryKeys.map(key => (
                            <option key={key} value={key}>{t(`category.${key}`)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* My Rank Snapshot */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{t('leaderboard.yourRank')}</h3>
                {currentUserBestScore && rank ? (
                    <div className="bg-primary/10 p-3 rounded-lg flex items-center justify-between gap-4 border-2 border-primary/20 shadow-sm">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="font-bold text-primary text-xl sm:text-2xl w-10 text-center flex-shrink-0">#{rank}</div>
                            <Avatar avatar={currentUserBestScore.avatar} altText={currentUserBestScore.name} />
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-white truncate">{currentUserBestScore.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={t(`category.${currentUserBestScore.categoryKey}`)}>
                                    {t(`category.${currentUserBestScore.categoryKey}`)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-2">
                             <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                                {currentUserBestScore.score} / {currentUserBestScore.totalQuestions}
                                <span className="text-base font-medium ml-1">({Math.round((currentUserBestScore.score / currentUserBestScore.totalQuestions) * 100)}%)</span>
                             </p>
                             <p className="text-xs text-slate-500 dark:text-slate-400">{t(`quizSetup.difficulty.${currentUserBestScore.difficulty.toLowerCase()}`)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                        <p className="font-medium text-slate-600 dark:text-slate-300">{t('leaderboard.notRanked')}</p>
                    </div>
                )}
            </div>

            {filteredScores.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{t('leaderboard.empty.title')}</h3>
                    <p>{t('leaderboard.empty.description')}</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Podium */}
                    {top3Scores.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
                            <div className="md:order-1">
                                {top3Scores[1] && <PodiumCard score={top3Scores[1]} rank={2} rankInfo={rankClasses[2]} profile={currentUserProfile} />}
                            </div>
                            <div className="md:order-2">
                                {top3Scores[0] && <PodiumCard score={top3Scores[0]} rank={1} rankInfo={rankClasses[1]} profile={currentUserProfile} isFirst />}
                            </div>
                             <div className="md:order-3">
                                {top3Scores[2] && <PodiumCard score={top3Scores[2]} rank={3} rankInfo={rankClasses[3]} profile={currentUserProfile} />}
                            </div>
                        </div>
                    )}

                    {/* Ranks 4+ */}
                    {otherScores.map((score, index) => {
                        const isCurrentUser = score.userId === currentUserProfile.id;
                        const rank = index + 4;
                        return (
                            <div key={score.id} className={`p-3 rounded-lg shadow-sm flex items-center justify-between transition-all duration-300 ${isCurrentUser ? 'bg-primary/10 ring-2 ring-primary' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="font-bold text-slate-500 dark:text-slate-400 w-8 text-center text-lg">{rank}</div>
                                    <Avatar avatar={score.avatar} altText={t('profile.avatar')} />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold truncate text-slate-700 dark:text-slate-200" title={score.name}>{score.name}</p>
                                            {isCurrentUser && <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full flex-shrink-0">{t('leaderboard.you')}</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={`${t(`category.${score.categoryKey}`)} - ${t(`quizSetup.difficulty.${score.difficulty.toLowerCase()}`)}`}>
                                            {t(`category.${score.categoryKey}`)} - {t(`quizSetup.difficulty.${score.difficulty.toLowerCase()}`)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 pl-2">
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{score.score}/{score.totalQuestions}</p>
                                    <p className="text-sm font-semibold text-primary">{Math.round((score.score / score.totalQuestions) * 100)}%</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


const PodiumCard: React.FC<{ score: QuizResult, rank: number, rankInfo: any, profile: UserProfile, isFirst?: boolean }> = ({ score, rank, rankInfo, profile, isFirst = false }) => {
    const { t } = useLanguage();
    const isCurrentUser = score.userId === profile.id;
    const scorePercentage = Math.round((score.score / score.totalQuestions) * 100);
    return (
        <div className={`flex flex-col items-center p-4 rounded-xl border-2 text-center transition-transform duration-300 ${rankInfo.bg} ${rankInfo.border} ${isFirst ? 'md:scale-110 shadow-lg' : 'shadow-md'}`}>
            <span className="text-4xl">{rankInfo.icon}</span>
            <Avatar avatar={score.avatar} altText={t('profile.avatar')} sizeClass="w-16 h-16 mt-2" textClass="text-5xl" />
            <p className="font-bold text-lg mt-2 truncate w-full text-slate-800 dark:text-white" title={score.name}>{score.name}</p>
            {isCurrentUser && <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full mt-1">{t('leaderboard.you')}</span>}
            <div className="mt-2">
                 <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                    {score.score}<span className="text-base text-slate-500 dark:text-slate-400">/{score.totalQuestions}</span>
                </p>
                <p className="text-sm font-semibold text-primary">{scorePercentage}%</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full mt-1">{t(`category.${score.categoryKey}`)}</p>
        </div>
    );
};
