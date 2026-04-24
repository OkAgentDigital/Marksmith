import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en_US.json'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof import('../locales/en_US.json')
    }
  }
}
export const getSystemLanguage = () => {
  return 'en'
}
