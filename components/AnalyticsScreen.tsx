import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
// FIX: Changed import for AnalyticsData to point to the correct types file.
import { analyticsService } from '../services/analyticsService.ts';
import type { AnalyticsData } from '../types.ts';

interface AnalyticsScreenProps {
  onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number | null; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-lg shadow flex items-center space-x-4">
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? 'N/A'}</p>
        </div>
    </div>
);

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [stats, setStats] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        setStats(analyticsService.getAnalytics());
    }, []);
    
    const handleClearData = () => {
        if (confirm(t('analytics.clear.confirm'))) {
            analyticsService.clearAnalytics();
            setStats(analyticsService.getAnalytics());
        }
    }

    if (!stats || stats.totalPlays === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center animate-fadeInUp border border-slate-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">{t('analytics.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t('analytics.noData')}</p>
            </div>
        );
    }
    
    const sortedCategories = Object.entries(stats.categoryStats).sort(([, a], [, b]) => b.plays - a.plays);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto animate-fadeInUp border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">{t('analytics.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title={t('analytics.totalPlays')} value={stats.totalPlays} icon="🎮" />
                <StatCard title={t('analytics.avgScore')} value={`${stats.averageScorePercentage}%`} icon="🎯" />
                <StatCard title={t('analytics.mostPlayed')} value={stats.mostPlayedCategory ? t(`category.${stats.mostPlayedCategory}`) : null} icon="🏆" />
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">{t('analytics.byCategory')}</h3>
            <div className="overflow-x-auto max-h-[40vh] custom-scrollbar rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('analytics.category')}</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">{t('analytics.plays')}</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">{t('analytics.score')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {sortedCategories.map(([key, catStats]) => (
                            <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{t(`category.${key}`)}</td>
                                <td className="p-3 text-center text-slate-600 dark:text-slate-300">{catStats.plays}</td>
                                <td className="p-3 text-center font-semibold text-primary">{catStats.avgScore}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleClearData}
                    className="text-sm text-red-500 hover:underline"
                >
                    {t('analytics.clear')}
                </button>
            </div>
        </div>
    );
};
