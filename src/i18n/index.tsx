import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './en';
import { uk } from './uk';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

type LanguageType = 'en' | 'uk';
type TranslationsType = typeof en;

type LanguageContextType = {
  language: LanguageType;
  t: TranslationsType;
  setLanguage: (lang: LanguageType) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: en,
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const [language, setLangState] = useState<LanguageType>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@language') as LanguageType;
        if (savedLang === 'en' || savedLang === 'uk') {
          setLangState(savedLang);
        } else if (profile?.language === 'uk') {
          setLangState('uk');
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLanguage();
  }, [profile]);

  const setLanguage = async (lang: LanguageType) => {
    setLangState(lang);
    try {
      await AsyncStorage.setItem('@language', lang);
      if (user) {
        await supabase.from('profiles').update({ language: lang }).eq('id', user.id);
      }
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = language === 'uk' ? uk : en;

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
