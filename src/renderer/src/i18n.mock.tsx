// Mock i18n module to safely replace react-i18next
// This allows the app to compile while we gradually remove translation calls

export const t = (key: string, options?: any): string => {
  // Return a human-readable fallback based on the translation key
  // Convert camelCase or snake_case to readable English
  const fallback = key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
  return fallback.charAt(0).toUpperCase() + fallback.slice(1);
};

export const useTranslation = () => ({
  t,
  i18n: {
    language: 'en' as const,
    changeLanguage: (lang: string) => console.log(`Language set to ${lang}`)
  }
});

export const getSystemLanguage = () => 'en';

export const Trans = ({ children, i18nKey, components }: { children?: React.ReactNode; i18nKey?: string; components?: any }) => <>{children}</>;

export default {
  t,
  useTranslation,
  getSystemLanguage,
  Trans,
  changeLanguage: (lang: string) => console.log(`Language set to ${lang}`)
};