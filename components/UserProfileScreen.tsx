import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { avatars } from '../avatars.ts';
import { themes } from '../themes.ts';
import { PhotoEditorModal } from './PhotoEditorModal.tsx';
import { LEVEL_THRESHOLDS } from '../config.ts';
import { getXpForNextLevel } from '../services/profileService.ts';


interface UserProfileScreenProps {
  onSave: (profile: UserProfile) => void;
  currentUser: UserProfile;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);


export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onSave, currentUser }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const { t } = useLanguage();

  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setSelectedAvatar(currentUser.avatar);
      setThemeColor(currentUser.themeColor);
    }
  }, [currentUser]);
  
  const currentLevel = currentUser.level;
  const currentXp = currentUser.xp;
  const xpForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
  const xpForNextLevel = getXpForNextLevel(currentLevel);
  const isMaxLevel = currentLevel >= LEVEL_THRESHOLDS.length;

  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = isMaxLevel ? 100 : Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100));


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setEditingPhoto(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handlePhotoSave = (croppedImage: string) => {
    setSelectedAvatar(croppedImage);
    setEditingPhoto(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && selectedAvatar && themeColor) {
      onSave({ 
        ...currentUser, // Preserve existing level/xp
        username: username.trim(), 
        avatar: selectedAvatar, 
        themeColor 
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto transition-colors duration-300 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">{t('profile.title')}</h2>
      
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-5 gap-x-12 gap-y-10">
        
        {/* Left Column: Avatar & Identity */}
        <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-300 dark:border-slate-600 pb-2">{t('profile.section.identity')}</h3>
            
            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-40 h-40">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden shadow-lg border-4 border-white dark:border-slate-600">
                        {selectedAvatar.startsWith('data:image/') ? (
                            <img src={selectedAvatar} alt={t('profile.avatar')} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-8xl">{selectedAvatar || '👤'}</span>
                        )}
                    </div>
                </div>
                <div className="w-full">
                    <label htmlFor="username" className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                        {t('profile.username')}
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-slate-800 dark:text-white"
                        placeholder={t('profile.username.placeholder')}
                        maxLength={25}
                        required
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{t('profile.changeAvatar')}</label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600 transition-colors"
                    >
                        {t('profile.photo.choose')}
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleFileChange} />
                </div>
                
                <div className="w-full">
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 my-2">{t('profile.avatar.select')}</p>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] gap-2 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
                        {avatars.map((avatar, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`flex items-center justify-center text-3xl p-2 rounded-full transition-all duration-200 active:scale-90 aspect-square ${
                              selectedAvatar === avatar
                                ? 'bg-primary/50 ring-4 ring-primary scale-110'
                                : 'bg-white dark:bg-slate-700 hover:bg-primary/20 dark:hover:bg-slate-600'
                            }`}
                            aria-label={`Avatar ${avatar}`}
                          >
                            {avatar}
                          </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Details & Preferences */}
        <div className="md:col-span-3 space-y-8">
             {/* Progression Section */}
            <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-300 dark:border-slate-600 pb-2 mb-4">{t('profile.section.progression')}</h3>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-baseline mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-slate-800 dark:text-white">{t('profile.level')} {currentLevel}</span>
                             {isMaxLevel && <span className="text-xs font-semibold bg-primary text-white px-2 py-0.5 rounded-full">MAX</span>}
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('profile.totalXp')}: {currentXp.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 relative overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{xpInCurrentLevel.toLocaleString()} XP</span>
                        <span>{isMaxLevel ? t('profile.maxLevel') : `${xpNeededForLevel.toLocaleString()} XP ${t('profile.toNextLevel')}`}</span>
                    </div>
                </div>
            </div>

            {/* Theme Color Selection */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-300 dark:border-slate-600 pb-2 mb-4">{t('profile.section.preferences')}</h3>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-200 mb-2">
                {t('profile.themeColor')}
              </label>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                {themes.map((theme) => (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => setThemeColor(theme.key)}
                    className={`relative w-12 h-12 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                      themeColor === theme.key ? 'ring-4 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800' : ''
                    }`}
                    style={{ backgroundColor: theme.color, '--tw-ring-color': theme.color } as React.CSSProperties}
                    aria-label={`${t('profile.themeColor')} ${theme.name}`}
                  >
                    {themeColor === theme.key && (
                        <CheckIcon className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
               <button
                 type="submit"
                 className="w-full sm:w-auto bg-primary hover:brightness-110 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:scale-100 disabled:cursor-not-allowed active:scale-95 duration-200"
                 disabled={!username.trim() || !selectedAvatar}
               >
                 {t('profile.save')}
               </button>
            </div>
        </div>
      </form>

      {/* MODALS */}
      {editingPhoto && <PhotoEditorModal imageSrc={editingPhoto} onSave={handlePhotoSave} onCancel={() => setEditingPhoto(null)} />}
      
    </div>
  );
};