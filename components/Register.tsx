import React, { useState } from "react";
import { auth, db, getActionCodeSettings } from "../services/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Language } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const Register: React.FC<{ 
  onSwitchToLogin: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: string;
  toggleTheme: () => void;
}> = ({ onSwitchToLogin, language, setLanguage, theme, toggleTheme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const translations = {
    nl: {
      title: "Registreren",
      subtitle: "Maak een account aan voor Exact's Daily. Gebruik je Exact mail adres maar met een nieuw en uniek wachtwoord. Deze staat los van je Exact account.",
      emailPlaceholder: "E-mail (@exact.com)",
      passwordPlaceholder: "Wachtwoord",
      passwordStrength: "Wachtwoord sterkte:",
      register: "Registreren",
      registering: "Registreren...",
      alreadyAccount: "Al een account?",
      login: "Inloggen",
      emailError: "Alleen Exact.com e-mailadressen zijn toegestaan.",
      passwordError: "Wachtwoord is niet sterk genoeg.",
      verificationSent: "Registratie gelukt! Controleer je e-mail voor verificatie.",
      verificationRequired: "E-mail verificatie vereist. Controleer je inbox.",
      backToLogin: "Terug naar inloggen",
      resendEmail: "E-mail opnieuw versturen",
      resending: "Verzenden...",
      resendSuccess: "Verificatie e-mail opnieuw verzonden!",
      resendError: "Kon verificatie e-mail niet opnieuw versturen.",
      resendCooldown: "Wacht {seconds} seconden voordat je opnieuw kunt versturen"
    },
    en: {
      title: "Register",
      subtitle: "Create an account for Exact's Daily. Use your Exact email address but with a new and unique password. This is separate from your Exact account.",
      emailPlaceholder: "Email (@exact.com)",
      passwordPlaceholder: "Password",
      passwordStrength: "Password strength:",
      register: "Register",
      registering: "Registering...",
      alreadyAccount: "Already have an account?",
      login: "Login",
      emailError: "Only Exact.com email addresses are allowed.",
      passwordError: "Password is not strong enough.",
      verificationSent: "Registration successful! Check your email for verification.",
      verificationRequired: "Email verification required. Check your inbox.",
      backToLogin: "Back to login",
      resendEmail: "Resend email",
      resending: "Sending...",
      resendSuccess: "Verification email resent!",
      resendError: "Could not resend verification email.",
      resendCooldown: "Wait {seconds} seconds before you can resend"
    },
    de: {
      title: "Registrieren",
      subtitle: "Erstellen Sie ein Konto für Exact's Daily. Verwenden Sie Ihre Exact-E-Mail-Adresse, aber mit einem neuen und eindeutigen Passwort. Dies ist getrennt von Ihrem Exact-Konto.",
      emailPlaceholder: "E-Mail (@exact.com)",
      passwordPlaceholder: "Passwort",
      passwordStrength: "Passwort-Stärke:",
      register: "Registrieren",
      registering: "Registrierung läuft...",
      alreadyAccount: "Bereits ein Konto?",
      login: "Anmelden",
      emailError: "Nur Exact.com E-Mail-Adressen sind erlaubt.",
      passwordError: "Passwort ist nicht stark genug.",
      verificationSent: "Registrierung erfolgreich! Überprüfen Sie Ihre E-Mail zur Bestätigung.",
      verificationRequired: "E-Mail-Bestätigung erforderlich. Überprüfen Sie Ihren Posteingang.",
      backToLogin: "Zurück zur Anmeldung",
      resendEmail: "E-Mail erneut senden",
      resending: "Senden...",
      resendSuccess: "Bestätigungs-E-Mail erneut gesendet!",
      resendError: "Bestätigungs-E-Mail konnte nicht erneut gesendet werden.",
      resendCooldown: "Warten Sie {seconds} Sekunden, bevor Sie erneut senden können"
    }
  };

  const t = translations[language];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.endsWith("@exact.com")) {
      setError(t.emailError);
      return;
    }
    if (passwordStrength(password) < 4) {
      setError(t.passwordError);
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store email in localStorage for email link processing
      window.localStorage.setItem('emailForSignIn', email);
      
      // Send email verification with proper settings
      await sendEmailVerification(userCredential.user, getActionCodeSettings());
      
      // Store user in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        createdAt: new Date().toISOString(),
        emailVerified: false
      });
      
      setVerificationSent(true);
      setSuccess(t.verificationSent);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setError("");
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser, getActionCodeSettings());
        setSuccess(t.resendSuccess);
        setResendCooldown(60); // 60 seconds cooldown
        
        // Start countdown
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(t.resendError);
    }
    setResendLoading(false);
  };

  if (verificationSent) {
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
                {t.verificationRequired}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {t.verificationSent}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Troubleshooting tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Check your spam/junk folder</li>
                      <li>• If the link doesn't work immediately, wait a minute and try again</li>
                      <li>• Make sure you're using the same browser where you registered</li>
                      <li>• If issues persist, try the resend option below</li>
                    </ul>
                  </div>
                </div>
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
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {success}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={onSwitchToLogin}
                  className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t.backToLogin}
                </button>
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.resending}
                    </div>
                  ) : resendCooldown > 0 ? (
                    t.resendCooldown.replace('{seconds}', resendCooldown.toString())
                  ) : (
                    t.resendEmail
                  )}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
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
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {success}
              </div>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-6">
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.passwordStrength}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={passwordStrength(password)}
                  readOnly
                  className="w-full h-2 bg-slate-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>
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
                  {t.registering}
                </div>
              ) : (
                t.register
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-slate-600 dark:text-slate-400">
              {t.alreadyAccount}{" "}
            </span>
            <button 
              type="button" 
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline transition-colors duration-200" 
              onClick={onSwitchToLogin}
            >
              {t.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
