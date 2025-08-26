import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext'; // Import useModal
import { auth, rtdb } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { User, LogOut } from 'lucide-react';

const UserCard = () => {
    const { currentUser, userProfile } = useAuth();
    const { openModal } = useModal(); // Use the modal context
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
        const performSignOut = () => {
            signOut(auth).catch(error => console.error("Sign out failed:", error));
        };

        if (currentUser.isAnonymous) {
            // Use the global modal
            openModal('sign-out', { onConfirm: performSignOut });
        } else {
            performSignOut();
        }
    };

    return (
        // The component no longer renders a modal itself
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
            <p className="text-xs text-cyan-400/80 truncate" title={userProfile.username}>@{userProfile.username}</p>
            <button onClick={handleSignOutClick} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 text-gray-400 hover:bg-red-500/20 hover:text-red-400">
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </div>
    )
};

export default UserCard;