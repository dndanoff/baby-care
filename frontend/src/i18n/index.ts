import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./en"
import bg from "./bg"

export const LANGUAGE_KEY = "language"

const savedLanguage = localStorage.getItem(LANGUAGE_KEY)
const defaultLanguage = savedLanguage === "bg" ? "bg" : "en"

i18next.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    bg: { translation: bg },
  },
  interpolation: { escapeValue: false },
})

export default i18next
