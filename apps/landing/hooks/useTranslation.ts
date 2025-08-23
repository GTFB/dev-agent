import { useRouter } from 'next/router';
import { useMemo } from 'react';

export function useTranslation() {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      // Simple translation function
      // In a real app, you'd use react-i18next or similar
      const keys = key.split('.');
      let value = getNestedValue(translations[locale as keyof typeof translations] || translations.en, keys);
      
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          value = value.replace(`{{${key}}}`, String(val));
        });
      }
      
      return value || key;
    };
  }, [locale]);

  const changeLanguage = (newLocale: string) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  return {
    t,
    locale,
    locales,
    defaultLocale,
    changeLanguage,
  };
}

// Simple translations object - in production use proper i18n library
const translations = {
  en: {
    navigation: {
      home: 'Home',
      blog: 'Blog',
      docs: 'Documentation',
      about: 'About',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },
  ru: {
    navigation: {
      home: 'Главная',
      blog: 'Блог',
      docs: 'Документация',
      about: 'О проекте',
    },
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
    },
  },
};

function getNestedValue(obj: any, keys: string[]): string {
  return keys.reduce((current, key) => current?.[key], obj);
}
