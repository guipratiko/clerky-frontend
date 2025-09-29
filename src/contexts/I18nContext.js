import React, { createContext, useContext, useState, useEffect } from 'react';
import { pt } from '../locales/pt';
import { en } from '../locales/en';

const I18nContext = createContext();

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Portuguese
    return localStorage.getItem('language') || 'pt';
  });

  const [translations, setTranslations] = useState(pt);

  useEffect(() => {
    // Update translations when language changes
    setTranslations(language === 'en' ? en : pt);
    
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key, params = {}) => {
    // Navigate through nested object keys
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key if translation not found
      }
    }
    
    // If value is a string, return it
    if (typeof value === 'string') {
      // Simple parameter replacement
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return value;
  };

  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'pt' || newLanguage === 'en') {
      setLanguage(newLanguage);
    } else {
      console.warn('Unsupported language:', newLanguage);
    }
  };

  const value = {
    language,
    translations,
    t,
    changeLanguage
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
