import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';

const resources = {
  zh: {
    translation: zh
  },
  en: {
    translation: en
  }
};

// 从localStorage获取保存的语言设置，默认为中文
const getStoredLanguage = (): string => {
  try {
    return localStorage.getItem('yescoin-language') || 'zh';
  } catch (error) {
    console.warn('Failed to get language from localStorage:', error);
    return 'zh';
  }
};

// 保存语言设置到localStorage
const saveLanguage = (language: string): void => {
  try {
    localStorage.setItem('yescoin-language', language);
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(), // 使用保存的语言设置
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

// 监听语言变化并保存到localStorage
i18n.on('languageChanged', (lng: string) => {
  saveLanguage(lng);
});

export default i18n;