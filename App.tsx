import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { QuizSetup } from './components/QuizSetup';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { Spinner } from './components/Spinner';
import { getQuiz } from './services/quizDataService.ts';
import { playCompletion, setSoundEnabled } from './services/soundService';
import type { Question, QuizSetupOptions, QuizResult, UserProfile } from './types.ts';
import { useLanguage } from './context/LanguageContext.tsx';
import { RetryScreen } from './components/RetryScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { getHistory, addResult as addHistoryResult, clearHistory as clearHistoryStorage } from './services/historyService';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { getHighScores, addHighScore } from './services/highScoreService';
import { SaveScoreScreen } from './components/SaveScoreScreen';
import { CategoryScreen } from './components/CategoryScreen.tsx';
import { Toast } from './components/Toast';
import { UserProfileScreen } from './components/UserProfileScreen';
import { getProfile, saveProfile, processQuizResultForXp } from './services/profileService';
import { LanguageScreen } from './components/LanguageScreen.tsx';
import { themes } from './themes.ts';
import { LoginWidget } from './components/LoginWidget.tsx';
import { quizSyncService } from './services/quizSyncService.ts';
import { analyticsService } from './services/analyticsService.ts';
import { AnalyticsScreen } from './components/AnalyticsScreen.tsx';
import { GeneratingQuizScreen } from './components/GeneratingQuizScreen.tsx';
import { logger } from './services/loggingService.ts';


type Screen = 'home' | 'categorySelect' | 'setup' | 'quiz' | 'result' | 'retry' | 'history' | 'leaderboard' | 'saveScore' | 'profile' | 'languageSelect' | 'analytics' | 'generating';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [animationClass, setAnimationClass] = useState('animate-fadeInUp');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSetupOptions, setQuizSetupOptions] = useState<QuizSetupOptions | null>(null);
  const [quizResult, setQuizResult] = useState<Omit<QuizResult, 'id' | 'name' | 'date' | 'userId' | 'avatar'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [retryQuestion, setRetryQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [highScores, setHighScores] = useState<QuizResult[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const navigate = (newScreen: Screen) => {
    if (isTransitioning || newScreen === screen) return;

    setIsTransitioning(true);
    setAnimationClass('animate-fadeOut');

    setTimeout(() => {
        setScreen(newScreen);
        setAnimationClass('animate-fadeInUp');
        setTimeout(() => setIsTransitioning(false), 50);
    }, 400); // This duration MUST match the fadeOut animation in index.html
  };


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const profile = getProfile();
    setUserProfile(profile);
    if (profile.themeColor) {
      const selectedTheme = themes.find(t => t.key === profile.themeColor);
      const color = selectedTheme ? selectedTheme.color : themes[0].color; // Fallback to default
      document.documentElement.style.setProperty('--color-primary', color);
    }
    
    // Initialize the background quiz syncing service
    quizSyncService.init((didUpdate) => {
        if (didUpdate) {
            setToastMessage(t('app.newQuizzes'));
        }
    });
  }, [t]);
  
  useEffect(() => {
    const generateAndStartQuiz = async () => {
        if (screen === 'generating' && quizSetupOptions) {
            try {
                const fetchedQuestions = await getQuiz(quizSetupOptions);
                if (fetchedQuestions.length > 0) {
                    setQuestions(fetchedQuestions);
                    navigate('quiz');
                } else {
                    throw new Error("The quiz data returned was empty. Please try again.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                navigate('setup'); // Go back to setup on error
            }
        }
    };
    generateAndStartQuiz();
  }, [screen, quizSetupOptions]);


  useEffect(() => {
      setHistory(getHistory());
      setHighScores(getHighScores());
  }, []);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabledState(newSoundState);
    setSoundEnabled(newSoundState);
  };
  
  const handleStartQuiz = (options: QuizSetupOptions) => {
    analyticsService.logQuizStart(options.categoryKey, options.difficulty);
    setError(null);
    setQuizSetupOptions(options);
    navigate('generating');
  };

  const handleQuizFinish = (score: number, userAnswers: (string | null)[]) => {
    if (quizSetupOptions) {
      playCompletion();
      const resultData = {
        score,
        totalQuestions: questions.length,
        categoryKey: quizSetupOptions.categoryKey,
        difficulty: quizSetupOptions.difficulty,
        userAnswers,
        questions,
      };
      setQuizResult(resultData);
      navigate('result');
    }
  };
  
  const handleQuizUpdate = (newQuestions: Question[]) => {
    if (newQuestions.length > 0) {
      setQuestions(prevQuestions => [...prevQuestions, ...newQuestions]);
      setToastMessage(t('quiz.bonusQuestionsAdded'));
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setQuizResult(null);
    navigate('setup');
  };
  
  const handleGoHome = () => {
    setQuestions([]);
    setQuizResult(null);
    navigate('home');
  };

  const handleHeaderBack = () => {
    if (screen === 'setup') {
      navigate('categorySelect');
    } else if (screen === 'languageSelect') {
        navigate(previousScreen);
    } else if (['categorySelect', 'profile', 'history', 'leaderboard', 'analytics'].includes(screen)) {
      navigate('home');
    }
  };
  
  const handleRetryLastIncorrect = () => {
    if (quizResult) {
       const lastIncorrectIndex = quizResult.userAnswers.map((answer, index) => {
        return answer !== quizResult.questions[index].correctAnswer ? index : -1;
      }).filter(index => index !== -1).pop();

      if (lastIncorrectIndex !== undefined) {
          setRetryQuestion(quizResult.questions[lastIncorrectIndex]);
          navigate('retry');
      }
    }
  };
  
  const handleRetryFinish = (selectedAnswer: string) => {
      if (quizResult && retryQuestion) {
          const originalIndex = quizResult.questions.findIndex(q => q.question === retryQuestion.question);
          if (originalIndex !== -1) {
            const newUserAnswers = [...quizResult.userAnswers];
            newUserAnswers[originalIndex] = selectedAnswer;
            
            const newScore = newUserAnswers.reduce((acc, ans, i) => {
                return ans === quizResult.questions[i].correctAnswer ? acc + 1 : acc;
            }, 0);

            setQuizResult(prev => prev ? {...prev, score: newScore, userAnswers: newUserAnswers} : null);
          }
      }
      setRetryQuestion(null);
      navigate('result');
  };
  
  const handleSaveScore = () => {
      navigate('saveScore');
  };
  
  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategoryKey(categoryKey);
    navigate('setup');
  };

  const handleConfirmSave = (name: string) => {
      if (quizResult && quizSetupOptions && userProfile) {
          const newResult: QuizResult = {
              id: new Date().toISOString(),
              name,
              score: quizResult.score,
              totalQuestions: quizResult.totalQuestions,
              categoryKey: quizSetupOptions.categoryKey,
              difficulty: quizSetupOptions.difficulty,
              date: new Date().toLocaleString(),
              userAnswers: quizResult.userAnswers,
              questions: quizResult.questions,
              userId: userProfile.id,
              avatar: userProfile.avatar
          };
          
          addHistoryResult(newResult);
          addHighScore(newResult);
          analyticsService.logQuizComplete(newResult);
          
          // Process XP and Leveling
          const { xpGained, didLevelUp, newLevel } = processQuizResultForXp(newResult);
          setUserProfile(getProfile()); // Refresh profile state
          
          // Show feedback toast for XP and Level Ups
          setTimeout(() => setToastMessage(`${t('profile.xpGained')}: +${xpGained} XP`), 500);
          if (didLevelUp && newLevel) {
            setTimeout(() => setToastMessage(`${t('profile.levelUp')}! ${t('profile.level')} ${newLevel}`), 2500);
          }
          
          // Refresh local state
          setHistory(getHistory());
          setHighScores(getHighScores());
          
          navigate('result');
      }
  };
  
  const handleProfileSave = (profile: UserProfile) => {
      saveProfile(profile);
      setUserProfile(profile);
      // Apply theme color immediately
      const selectedTheme = themes.find(t => t.key === profile.themeColor);
      if (selectedTheme) {
        document.documentElement.style.setProperty('--color-primary', selectedTheme.color);
      }
      setToastMessage(t('profile.saved'));
      navigate('home');
  };
  
  const handleNavigateToLanguageSelect = () => {
    setPreviousScreen(screen);
    navigate('languageSelect');
  };
  
  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    navigate(previousScreen);
  };

  const handleClearHistory = () => {
      clearHistoryStorage();
      setHistory([]);
  };

  const handleLeaderboardFilterChange = (filters: { category: string; difficulty: 'all' | 'Easy' | 'Medium' | 'Hard' }) => {
    if (userProfile) {
        const newProfile = { ...userProfile, leaderboardFilters: filters };
        saveProfile(newProfile);
        setUserProfile(newProfile);
        logger.info('Leaderboard filters saved to profile.');
    }
  };
  
  const renderScreen = () => {
    if (!userProfile) {
      return <div className="flex flex-col items-center justify-center gap-4"><Spinner /><p className="text-lg text-slate-800 dark:text-slate-300">{t('app.loadingProfile')}</p></div>;
    }

    switch (screen) {
      case 'home':
        return <HomeScreen onStart={() => navigate('categorySelect')} onViewHistory={() => navigate('history')} onViewLeaderboard={() => navigate('leaderboard')} highScores={highScores} onViewAnalytics={() => navigate('analytics')} />;
      case 'categorySelect':
        return <CategoryScreen onSelectCategory={handleCategorySelect} />;
      case 'setup':
        return <QuizSetup 
                  onStartQuiz={handleStartQuiz} 
                  selectedCategoryKey={selectedCategoryKey} 
                  error={error}
                  clearError={() => setError(null)}
                />;
      case 'generating':
        return <GeneratingQuizScreen numQuestions={quizSetupOptions?.numQuestions} />;
      case 'quiz':
        return <QuizScreen 
                  questions={questions} 
                  onQuizFinish={handleQuizFinish} 
                  timed={quizSetupOptions?.timed ?? false} 
                  timerDuration={quizSetupOptions?.timerDuration ?? 30}
                  quizSetupOptions={quizSetupOptions}
                  onQuizUpdate={handleQuizUpdate} 
                />;
      case 'result':
        return <ResultScreen 
          score={quizResult!.score} 
          questions={quizResult!.questions} 
          userAnswers={quizResult!.userAnswers} 
          onRestart={handleRestart} 
          onRetryLastIncorrect={handleRetryLastIncorrect}
          onSaveScore={handleSaveScore}
          onGoHome={handleGoHome}
        />;
      case 'retry':
        return <RetryScreen question={retryQuestion!} onFinish={handleRetryFinish} />;
      case 'history':
        return <HistoryScreen history={history} onClear={handleClearHistory} onBack={() => navigate('home')} currentUserProfile={userProfile} />;
      case 'leaderboard':
        return <LeaderboardScreen scores={highScores} currentUserProfile={userProfile} onFiltersChange={handleLeaderboardFilterChange} />;
      case 'saveScore':
        return <SaveScoreScreen 
                  score={quizResult!.score} 
                  totalQuestions={quizResult!.totalQuestions} 
                  onSave={handleConfirmSave} 
                  currentUsername={userProfile.username}
                />;
      case 'profile':
          return <UserProfileScreen 
                    onSave={handleProfileSave} 
                    currentUser={userProfile}
                  />
      case 'languageSelect':
          return <LanguageScreen onSelect={handleLanguageSelect} currentLanguage={language} />;
      case 'analytics':
          return <AnalyticsScreen onBack={() => navigate('home')} />;
      default:
        return <HomeScreen onStart={() => navigate('categorySelect')} onViewHistory={() => navigate('history')} onViewLeaderboard={() => navigate('leaderboard')} highScores={highScores} onViewAnalytics={() => navigate('analytics')} />;
    }
  };
  
  const showBackButton = ['setup', 'categorySelect', 'profile', 'history', 'leaderboard', 'languageSelect', 'analytics'].includes(screen);

  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300`}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onBack={showBackButton ? handleHeaderBack : undefined}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        onNavigateToLanguageSelect={handleNavigateToLanguageSelect}
      />
      <main className="container mx-auto p-4 sm:p-6 md:p-8 flex justify-center items-start">
        <div className={`w-full ${animationClass}`} key={screen}>
          {renderScreen()}
        </div>
      </main>
      <LoginWidget userProfile={userProfile} onProfileClick={() => navigate('profile')} />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;