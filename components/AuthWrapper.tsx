import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, applyActionCode, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../services/firebase";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import { Language } from "../types";
import WelcomeToast from "./WelcomeToast";

const AuthWrapper: React.FC<{ 
  children: React.ReactNode;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: string;
  toggleTheme: () => void;
}> = ({ children, language, setLanguage, theme, toggleTheme }) => {
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(true);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [processingEmailLink, setProcessingEmailLink] = useState(false);

  useEffect(() => {
    // Handle email action links (verification, password reset)
    const handleEmailActionLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setProcessingEmailLink(true);
        try {
          let email = window.localStorage.getItem('emailForSignIn');
          if (!email) {
            // If email is not stored, prompt user to enter it
            email = window.prompt('Please provide your email for confirmation');
          }
          
          if (email) {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // Clear the URL to prevent issues
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error processing email link:', error);
        } finally {
          setProcessingEmailLink(false);
        }
      }
    };

    // Check for action code in URL (for password reset, email verification)
    const urlParams = new URLSearchParams(window.location.search);
    const actionCode = urlParams.get('oobCode');
    
    if (actionCode) {
      setProcessingEmailLink(true);
      applyActionCode(auth, actionCode)
        .then(() => {
          // Action code applied successfully
          console.log('Email action completed successfully');
          // Clear the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          // Show success message
          alert('Email verification successful! You can now log in.');
        })
        .catch((error) => {
          console.error('Error applying action code:', error);
          // Handle specific error cases
          if (error.code === 'auth/invalid-action-code') {
            alert('This verification link has expired or is invalid. Please request a new verification email.');
          } else if (error.code === 'auth/user-disabled') {
            alert('This account has been disabled. Please contact support.');
          } else {
            alert('An error occurred while verifying your email. Please try again.');
          }
        })
        .finally(() => {
          setProcessingEmailLink(false);
        });
    } else {
      // Handle email sign-in links
      handleEmailActionLink();
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
        setShowWelcomeToast(true);
        // Hide toast after 5 seconds
        setTimeout(() => setShowWelcomeToast(false), 5000);
      } else if (user && !user.emailVerified) {
        // If user is not verified, sign them out and show login
        signOut(auth);
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || processingEmailLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {processingEmailLink ? "Processing email link..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (screen === "login")
      return (
        <Login
          onSwitchToRegister={() => setScreen("register")}
          onSwitchToForgot={() => setScreen("forgot")}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    if (screen === "register")
      return (
        <Register 
          onSwitchToLogin={() => setScreen("login")} 
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    if (screen === "forgot")
      return (
        <ForgotPassword 
          onSwitchToLogin={() => setScreen("login")} 
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
  }

  return (
    <div>
      {showWelcomeToast && (
        <WelcomeToast 
          user={user} 
          language={language} 
          onClose={() => setShowWelcomeToast(false)} 
        />
      )}
      <div className="flex justify-end p-4 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-slate-700 dark:text-slate-300 text-sm">
            {user?.email}
          </span>
          <button
            className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={() => signOut(auth)}
          >
            {language === 'nl' ? 'Uitloggen' : language === 'de' ? 'Abmelden' : 'Logout'}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AuthWrapper;
