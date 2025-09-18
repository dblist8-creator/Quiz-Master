import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

const GeneratingQuizLoader: React.FC = () => (
    <svg
        className="h-16 w-16 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
    >
        <circle cx="25" cy="50" r="10" fill="currentColor">
            <animate attributeName="r" values="10;5;10" dur="1.5s" repeatCount="indefinite" begin="0s" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="50" cy="50" r="5" fill="currentColor">
            <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="75" cy="50" r="10" fill="currentColor">
            <animate attributeName="r" values="10;5;10" dur="1.5s" repeatCount="indefinite" begin="1s" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </circle>
    </svg>
);

interface GeneratingQuizScreenProps {
  numQuestions?: number;
}

export const GeneratingQuizScreen: React.FC<GeneratingQuizScreenProps> = ({ numQuestions = 10 }) => {
    const { t } = useLanguage();
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');

    const messages = useMemo(() => [
        t('quizSetup.loading.message1'),
        t('quizSetup.loading.message2'),
        t('quizSetup.loading.message3'),
        t('quizSetup.loading.message4'),
        t('quizSetup.loading.message5'),
    ], [t]);

    useEffect(() => {
        // Cycling flavor text
        const messageInterval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2500);

        // Simulated progress logic
        const totalDuration = numQuestions * 600; // 0.6s per question
        let currentQ = 0;
        setProgressText(t('quizSetup.loading.preparing'));

        const progressInterval = setInterval(() => {
            currentQ++;
            if (currentQ >= numQuestions) {
                clearInterval(progressInterval);
                setProgress(99);
                setProgressText(t('quizSetup.loading.finalizing'));
            } else {
                setProgress((currentQ / numQuestions) * 100);
                setProgressText(`${t('quizSetup.loading.generatingQuestion')} ${currentQ} / ${numQuestions}...`);
            }
        }, totalDuration / numQuestions);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, [numQuestions, t, messages]);
    
    const currentMessage = messages[messageIndex];

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-8 text-center bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md mx-auto animate-fadeInUp">
            <GeneratingQuizLoader />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('quizSetup.loading.title')}</h2>
            
            <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>{progressText}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-primary h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="h-12 flex items-center justify-center">
                <p key={currentMessage} className="text-lg text-slate-500 dark:text-slate-400 animate-fadeIn">
                    {currentMessage}
                </p>
            </div>
        </div>
    );
};
