'use client';

import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageToggle() {
  const { locale, locales, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languageNames = {
    en: 'English',
    ru: 'Русский',
  };

  const handleLanguageChange = (newLocale: string) => {
    changeLanguage(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
      >
        <Globe className="h-4 w-4" />
        <span>{languageNames[locale as keyof typeof languageNames] || locale}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            {locales?.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                  loc === locale ? 'bg-accent text-accent-foreground' : 'text-foreground'
                }`}
              >
                {languageNames[loc as keyof typeof languageNames] || loc}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
