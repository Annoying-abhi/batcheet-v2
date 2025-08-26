import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, rtdb } from '../firebase/config'; // Import rtdb
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database'; // Import RTDB functions
import { Zap } from 'lucide-react';

const adjectives = ["Whispering", "Silent", "Wandering", "Cosmic", "Hidden", "Forgotten", "Midnight", "Crimson", "Golden", "Iron"];
const nouns = ["Echo", "Shadow", "Voyager", "Oracle", "Phantom", "River", "Specter", "Golem", "Pioneer", "Dreamer"];
const generateAnonymousName = () => `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                // --- Start of Presence Management Logic ---
                const userStatusDatabaseRef = ref(rtdb, '/status/' + user.uid);
                const isOfflineForDatabase = {
                    state: 'offline',
                    last_changed: serverTimestamp(),
                };
                const isOnlineForDatabase = {
                    state: 'online',
                    last_changed: serverTimestamp(),
                };

                const connectedRef = ref(rtdb, '.info/connected');
                onValue(connectedRef, (snapshot) => {
                    if (snapshot.val() === false) {
                        return;
                    }
                    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                        set(userStatusDatabaseRef, isOnlineForDatabase);
                    });
                });
                // --- End of Presence Management Logic ---

                const userRef = doc(db, 'users', user.uid);
                onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        const newProfile = {
                            displayName: user.isAnonymous ? generateAnonymousName() : user.displayName,
                            photoURL: user.isAnonymous ? `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}` : user.photoURL,
                            blockedUsers: []
                        };
                        setDoc(userRef, newProfile);
                    }
                });
                setLoading(false);
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const blockUser = async (userIdToBlock) => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { blockedUsers: arrayUnion(userIdToBlock) });
    };

    if (loading) {
        return (
            <div className="bg-gray-900 flex items-center justify-center h-screen">
                <Zap className="animate-ping w-10 h-10 text-cyan-400" />
            </div>
        );
    }

    const value = { currentUser, userProfile, blockUser, signOut: () => auth.signOut() };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};