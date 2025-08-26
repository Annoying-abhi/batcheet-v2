import React, { useState, useEffect, useMemo } from 'react';
import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { User, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isCaptchaCorrect, setIsCaptchaCorrect] = useState(false);

  const captchaNumbers = useMemo(() => ({
    num1: Math.floor(Math.random() * 10) + 1,
    num2: Math.floor(Math.random() * 10) + 1,
  }), []);

  const captchaCorrectAnswer = captchaNumbers.num1 + captchaNumbers.num2;

  useEffect(() => {
    if (parseInt(captchaAnswer) === captchaCorrectAnswer) {
      setIsCaptchaCorrect(true);
    } else {
      setIsCaptchaCorrect(false);
    }
  }, [captchaAnswer, captchaCorrectAnswer]);

  const handleGoogleSignIn = async () => {
    if (!isCaptchaCorrect) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (!isCaptchaCorrect) return;
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* CSS to hide the number input arrows */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* New Vibrant Mesh Gradient Background */}
      <div className="absolute inset-[-100px] z-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      {/* Login Card with Deeper Glassmorphism */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-black/20 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl text-center">
        <div className="flex justify-center">
          {/* Logo */}
          <svg className="w-16 h-16 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M13 8l2 2-2 2"></path>
            <path d="M9 12H15"></path>
          </svg>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Welcome to Batcheet
            </h1>
            <p className="text-lg text-gray-300">
              Join the conversation. Your way.
            </p>
        </div>

        {/* Spam Protection Section */}
        <div className="pt-2">
          <label htmlFor="captcha" className="block text-sm font-medium text-gray-300 mb-2">
            Human Verification
          </label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-mono text-gray-400">{captchaNumbers.num1} + {captchaNumbers.num2} =</span>
            <input
              id="captcha"
              type="number"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className={`w-20 p-2 text-center bg-gray-800/50 border rounded-md transition-all ${isCaptchaCorrect ? 'border-green-500/50 text-green-400' : 'border-gray-600 text-white'}`}
            />
            {isCaptchaCorrect && <ShieldCheck className="w-6 h-6 text-green-400 animate-fade-in" />}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <button 
            onClick={handleGoogleSignIn} 
            disabled={!isCaptchaCorrect}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.3-26.2-63.5-42.3-104.5-42.3-84.3 0-152.3 68.1-152.3 152.4s68 152.4 152.3 152.4c97.9 0 130.9-74.5 135.2-112.4H248v-91.3h236.2c2.3 12.7 3.8 26.6 3.8 41.9z"></path></svg>
            Sign in with Google
          </button>
          
          <button 
            onClick={handleAnonymousSignIn} 
            disabled={!isCaptchaCorrect}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="w-6 h-6" />
            Continue Anonymously
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
