import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { debounce } from 'lodash';

const ProfileSetupPage = () => {
    const { currentUser } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkUsername = useCallback(
        debounce(async (name) => {
            if (name.length < 3) {
                setIsAvailable(true);
                return;
            }
            if (!/^[a-z0-9_]+$/.test(name)) {
                setIsAvailable(false);
                setError('Username can only contain lowercase letters, numbers, and underscores.');
                return;
            }
            setIsValidating(true);
            setError('');
            const q = query(collection(db, 'users'), where('username', '==', name));
            const querySnapshot = await getDocs(q);
            const isTaken = !querySnapshot.empty;
            setIsAvailable(!isTaken);
            if (isTaken) {
                setError(`Username @${name} is already taken.`);
            }
            setIsValidating(false);
        }, 500),
        []
    );

    useEffect(() => {
        if (currentUser && !displayName) {
            setDisplayName(currentUser.displayName || '');
        }
        checkUsername(username);
    }, [username, checkUsername, currentUser, displayName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (displayName.trim().length < 3) {
            setError('Display name must be at least 3 characters long.');
            return;
        }
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters long.');
            return;
        }
        if (!isAvailable || isValidating) {
            setError('Please choose an available username.');
            return;
        }
        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                displayName: displayName.trim(),
                username: username.trim(),
                isProfileComplete: true
            });
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen flex items-center justify-center font-sans antialiased p-4">
            <div className="relative z-10 p-8 bg-gray-800/60 backdrop-blur-md border border-gray-700/70 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow delay-200"></div>
                <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Complete Your Profile</h1>
                <p className="text-lg text-gray-300 mb-8">Let's set you up with a unique identity.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                            placeholder="e.g., Cosmic Echo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                            placeholder="e.g., cosmic_echo_01"
                        />
                        <div className="text-sm h-5 mt-2">
                            {isValidating && <p className="text-yellow-400 flex items-center gap-1">
                                <svg className="animate-spin h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Checking availability...
                            </p>}
                            {!isValidating && username.length >= 3 && isAvailable && !error && <p className="text-green-400 flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                @{username} is available!
                            </p>}
                            {!isValidating && !isAvailable && error && <p className="text-red-400 flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                {error}
                            </p>}
                        </div>
                    </div>
                    {error && !isValidating && <p className="text-red-400 text-center font-medium mt-4">{error}</p>}
                    <button type="submit" disabled={loading || !isAvailable || isValidating || displayName.trim().length < 3 || username.trim().length < 3} 
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none">
                        {loading ? 'Saving Profile...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupPage;