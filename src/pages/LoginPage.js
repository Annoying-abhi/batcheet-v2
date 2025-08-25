import React from 'react';
import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { Sparkles } from 'lucide-react';

const LoginPage = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
    }
  };

  return (
    <div className="bg-gray-900 flex items-center justify-center h-screen">
      <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg shadow-2xl mx-4">
        <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Batcheet</h1>
        <p className="text-gray-400 mb-8">Join the conversation. Your way.</p>
        <div className="space-y-4">
          <button onClick={handleGoogleSignIn} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.3-26.2-63.5-42.3-104.5-42.3-84.3 0-152.3 68.1-152.3 152.4s68 152.4 152.3 152.4c97.9 0 130.9-74.5 135.2-112.4H248v-91.3h236.2c2.3 12.7 3.8 26.6 3.8 41.9z"></path></svg>
            Sign in with Google
          </button>
          <button onClick={handleAnonymousSignIn} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Continue Anonymously
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
