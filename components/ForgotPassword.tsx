import React, { useState } from "react";
import { auth, getActionCodeSettings } from "../services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Language } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

const ForgotPassword: React.FC<{ 
  onSwitchToLogin: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: string;
  toggleTheme: () => void;
}> = ({ onSwitchToLogin, language, setLanguage, theme, toggleTheme }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const translations = {
    nl: {
      title: "Wachtwoord vergeten",
      subtitle: "Voer je e-mailadres in om je wachtwoord te resetten",
      emailPlaceholder: "E-mail (@exact.com)",
      sendReset: "Reset e-mail versturen",
      sending: "Verzenden...",
      backToLogin: "Terug naar inloggen",
      resetSent: "Wachtwoord reset e-mail is verzonden!",
      resetMessage: "Controleer je inbox voor instructies om je wachtwoord te resetten.",
      resetError: "Kon geen reset e-mail versturen.",
      emailNotFound: "Geen account gevonden met dit e-mailadres.",
      invalidEmail: "Voer een geldig e-mailadres in.",
      tooManyRequests: "Te veel pogingen. Probeer het later opnieuw."
    },
    en: {
      title: "Forgot Password",
      subtitle: "Enter your email address to reset your password",
      emailPlaceholder: "Email (@exact.com)",
      sendReset: "Send reset email",
      sending: "Sending...",
      backToLogin: "Back to login",
      resetSent: "Password reset email has been sent!",
      resetMessage: "Check your inbox for instructions to reset your password.",
      resetError: "Could not send reset email.",
      emailNotFound: "No account found with this email address.",
      invalidEmail: "Please enter a valid email address.",
      tooManyRequests: "Too many attempts. Please try again later."
    },
    de: {
      title: "Passwort vergessen",
      subtitle: "Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen",
      emailPlaceholder: "E-Mail (@exact.com)",
      sendReset: "Reset-E-Mail senden",
      sending: "Senden...",
      backToLogin: "Zurück zur Anmeldung",
      resetSent: "Passwort-Reset-E-Mail wurde gesendet!",
      resetMessage: "Überprüfen Sie Ihren Posteingang für Anweisungen zum Zurücksetzen Ihres Passworts.",
      resetError: "Reset-E-Mail konnte nicht gesendet werden.",
      emailNotFound: "Kein Konto mit dieser E-Mail-Adresse gefunden.",
      invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      tooManyRequests: "Zu viele Versuche. Bitte versuchen Sie es später erneut."
    }
  };

  const t = translations[language];

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email, getActionCodeSettings());
      setResetSent(true);
      setMessage(t.resetSent);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError(t.emailNotFound);
      } else if (err.code === 'auth/invalid-email') {
        setError(t.invalidEmail);
      } else if (err.code === 'auth/too-many-requests') {
        setError(t.tooManyRequests);
      } else {
        setError(t.resetError);
      }
    }
    setLoading(false);
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <div className="flex justify-between items-center mb-8">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} language={language} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {t.resetSent}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                {t.resetMessage}
              </p>
              <div className="space-y-4">
                <button
                  onClick={onSwitchToLogin}
                  className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t.backToLogin}
                </button>
                <button
                  onClick={() => {
                    setResetSent(false);
                    setEmail("");
                    setMessage("");
                  }}
                  className="w-full bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Nog een e-mail versturen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-8">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} language={language} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
              <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 dark:from-teal-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent mb-2">
              Exact's Daily
            </h1>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {message}
              </div>
            </div>
          )}
          
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-mailadres
              </label>
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.sending}
                </div>
              ) : (
                t.sendReset
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <button 
              type="button" 
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline transition-colors duration-200 flex items-center justify-center mx-auto" 
              onClick={onSwitchToLogin}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              {t.backToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
