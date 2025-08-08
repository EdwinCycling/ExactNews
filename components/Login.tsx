import React, { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Language } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

const Login: React.FC<{ 
  onSwitchToRegister: () => void; 
  onSwitchToForgot: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: string;
  toggleTheme: () => void;
}> = ({
  onSwitchToRegister,
  onSwitchToForgot,
  language,
  setLanguage,
  theme,
  toggleTheme
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const translations = {
    nl: {
      title: "Inloggen",
      subtitle: "Welkom terug bij Exact's Daily",
      emailPlaceholder: "E-mail (@exact.com)",
      passwordPlaceholder: "Wachtwoord",
      login: "Inloggen",
      loggingIn: "Inloggen...",
      noAccount: "Nog geen account?",
      register: "Registreren",
      forgotPassword: "Wachtwoord vergeten?",
      invalidCredentials: "Ongeldige inloggegevens.",
      emailNotVerified: "E-mail niet geverifieerd. Controleer je inbox.",
      tooManyAttempts: "Te veel mislukte pogingen. Probeer het over {minutes} minuten opnieuw.",
      accountLocked: "Account tijdelijk geblokkeerd. Probeer het over {minutes} minuten opnieuw."
    },
    en: {
      title: "Login",
      subtitle: "Welcome back to Exact's Daily",
      emailPlaceholder: "Email (@exact.com)",
      passwordPlaceholder: "Password",
      login: "Login",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      register: "Register",
      forgotPassword: "Forgot password?",
      invalidCredentials: "Invalid login credentials.",
      emailNotVerified: "Email not verified. Check your inbox.",
      tooManyAttempts: "Too many failed attempts. Try again in {minutes} minutes.",
      accountLocked: "Account temporarily locked. Try again in {minutes} minutes."
    },
    de: {
      title: "Anmelden",
      subtitle: "Willkommen zurück bei Exact's Daily",
      emailPlaceholder: "E-Mail (@exact.com)",
      passwordPlaceholder: "Passwort",
      login: "Anmelden",
      loggingIn: "Anmeldung läuft...",
      noAccount: "Noch kein Konto?",
      register: "Registrieren",
      forgotPassword: "Passwort vergessen?",
      invalidCredentials: "Ungültige Anmeldedaten.",
      emailNotVerified: "E-Mail nicht bestätigt. Überprüfen Sie Ihren Posteingang.",
      tooManyAttempts: "Zu viele fehlgeschlagene Versuche. Versuchen Sie es in {minutes} Minuten erneut.",
      accountLocked: "Konto vorübergehend gesperrt. Versuchen Sie es in {minutes} Minuten erneut."
    }
  };

  const t = translations[language];

  // Check if account is locked
  useEffect(() => {
    if (lockedUntil && new Date() > lockedUntil) {
      setLockedUntil(null);
      setAttempts(0);
    }
  }, [lockedUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Check if account is locked
    if (lockedUntil && new Date() <= lockedUntil) {
      const minutesLeft = Math.ceil((lockedUntil.getTime() - new Date().getTime()) / (1000 * 60));
      setError(t.accountLocked.replace('{minutes}', minutesLeft.toString()));
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError(t.emailNotVerified);
        setLoading(false);
        return;
      }
      
      // Reset attempts on successful login
      setAttempts(0);
      setLockedUntil(null);
      
      // User is now logged in, parent component should handle redirect
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Lock account for 15 minutes
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + 15);
          setLockedUntil(lockTime);
          setError(t.tooManyAttempts.replace('{minutes}', '15'));
        } else {
          setError(t.invalidCredentials);
        }
      } else if (err.code === 'auth/user-not-verified') {
        setError(t.emailNotVerified);
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  const isLocked = lockedUntil && new Date() <= lockedUntil;
  const minutesLeft = lockedUntil ? Math.ceil((lockedUntil.getTime() - new Date().getTime()) / (1000 * 60)) : 0;

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
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
          
          <form onSubmit={handleLogin} className="space-y-6">
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
                disabled={isLocked}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  required
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  disabled={isLocked}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {isLocked && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-400">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Account geblokkeerd voor {minutesLeft} minuten
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || isLocked}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.loggingIn}
                </div>
              ) : (
                t.login
              )}
            </button>
          </form>
          
          <div className="mt-8 flex justify-between items-center">
            <button 
              type="button" 
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline transition-colors duration-200" 
              onClick={onSwitchToRegister}
              disabled={isLocked}
            >
              {t.register}
            </button>
            <button 
              type="button" 
              className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200" 
              onClick={onSwitchToForgot}
              disabled={isLocked}
            >
              {t.forgotPassword}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
