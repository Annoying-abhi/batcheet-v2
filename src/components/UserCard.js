import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, rtdb } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { User, LogOut, AlertTriangle } from 'lucide-react';

const SignOutModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-gray-800 border border-red-500/50 rounded-lg shadow-xl p-6 max-w-sm mx-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Are you sure?</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            You are signed in anonymously. If you sign out, you will lose access to this account and your chats forever.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserCard = () => {
    const { currentUser, userProfile } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        if (!rtdb || !currentUser) return;
        const userStatusRef = ref(rtdb, `/status/${currentUser.uid}`);
        const unsubscribe = onValue(userStatusRef, (snapshot) => {
            const status = snapshot.val();
            setIsOnline(status?.state === 'online');
        });
        return () => unsubscribe();
    }, [currentUser]);

    if (!currentUser || !userProfile) return null;
    
    const handleSignOutClick = () => {
        if (currentUser.isAnonymous) {
            setIsModalOpen(true);
        } else {
            signOut(auth).catch(error => console.error("Sign out failed:", error));
        }
    };

    const confirmSignOut = () => {
        signOut(auth).catch(error => console.error("Sign out failed:", error));
        setIsModalOpen(false);
    };

    return (
        <>
            <SignOutModal isOpen={isModalOpen} onConfirm={confirmSignOut} onCancel={() => setIsModalOpen(false)} />
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 text-center shadow-lg">
                <div className="relative w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center ring-4 ring-gray-700">
                    {userProfile.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full rounded-full" />
                    ) : (
                        <User className="w-10 h-10 text-white" />
                    )}
                    {isOnline && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>}
                </div>
                <h2 className="font-bold text-lg text-white">{userProfile.displayName}</h2>
                <p className="text-xs text-gray-500 truncate" title={currentUser.uid}>{currentUser.uid}</p>
                <button onClick={handleSignOutClick} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 text-gray-400 hover:bg-red-500/20 hover:text-red-400">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </>
    )
};

export default UserCard;
