import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { User, Zap, Send } from 'lucide-react';
import PostCard from '../components/PostCard';
import PostMenu from '../components/PostMenu';

const ProfilePage = ({ navigate, userId }) => {
    const { currentUser, userProfile: currentUserProfile, blockUser } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const isOwnProfile = currentUser.uid === userId;

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                setUserProfile(userSnap.data());
                const postsQuery = query(collection(db, "posts"), where("authorId", "==", userId), orderBy("createdAt", "desc"));
                const postsSnapshot = await getDocs(postsQuery);
                setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        };
        fetchUserData();
        
        const userStatusRef = ref(rtdb, `/status/${userId}`);
        const unsubscribe = onValue(userStatusRef, (snapshot) => {
            const status = snapshot.val();
            setIsOnline(status?.state === 'online');
        });
        return () => unsubscribe();
    }, [userId]);

    const handleStartChat = async () => {
        if (!db || !currentUser || !currentUserProfile || isOwnProfile) return;
        const chatId = [currentUser.uid, userId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                participants: [currentUser.uid, userId],
                participantProfiles: {
                    [currentUser.uid]: { name: currentUserProfile.displayName, photoURL: currentUserProfile.photoURL, username: currentUserProfile.username },
                    [userId]: { name: userProfile.displayName, photoURL: userProfile.photoURL, username: userProfile.username }
                },
                lastMessage: null,
                lastUpdated: serverTimestamp()
            });
        }
        navigate('chat', { chatId });
    };

    if (loading) {
        return <div className="text-center text-gray-400 flex justify-center items-center h-64"><Zap className="animate-ping w-8 h-8 text-cyan-400" /></div>;
    }

    if (!userProfile) {
        return (
            <div className="text-center py-16 bg-gray-800/50 border border-dashed border-gray-700/80 rounded-lg">
                <p className="text-gray-500 text-lg">User Not Found</p>
                <p className="text-gray-400 mt-2">This user may not exist or has deleted their account.</p>
            </div>
        );
    }

    const mockPostForMenu = {
        id: 'profile_page_user',
        authorId: userId,
        authorProfile: userProfile
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center ring-4 ring-gray-700 flex-shrink-0">
                            {userProfile?.photoURL ? (
                                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full rounded-full" />
                            ) : (
                                <User className="w-12 h-12 text-white" />
                            )}
                            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">{userProfile?.displayName}</h1>
                            <p className="text-md text-cyan-400/80">@{userProfile?.username}</p>
                        </div>
                    </div>
                    {!isOwnProfile && (
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                             <button onClick={handleStartChat} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/30">
                                <Send className="w-4 h-4" /> Message
                            </button>
                            <PostMenu post={mockPostForMenu} onBlock={blockUser} isAuthor={false} />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                <h2 className="text-xl font-semibold text-cyan-300 border-b border-gray-700 pb-2">Posts by {userProfile?.displayName}</h2>
                {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} navigate={navigate} />)
                ) : (
                    <p className="text-gray-500 text-center py-8">This user hasn't posted anything yet.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;