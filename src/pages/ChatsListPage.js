import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { User, Search } from 'lucide-react';

const ChatsListPage = ({ navigate }) => {
    const { currentUser, userProfile } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    // --- Start of New Search State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    // --- End of New Search State ---

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            chatsData.sort((a, b) => (b.lastUpdated?.toMillis() || 0) - (a.lastUpdated?.toMillis() || 0));
            setChats(chatsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // --- Start of New Search Logic ---
    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.trim().length < 3) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            // Firestore query for "starts-with" search
            const usersQuery = query(
                collection(db, 'users'),
                where('username', '>=', searchTerm.toLowerCase()),
                where('username', '<=', searchTerm.toLowerCase() + '\uf8ff')
            );
            const usersSnapshot = await getDocs(usersQuery);
            const users = usersSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUser.uid); // Exclude self from search
            setSearchResults(users);
            setIsSearching(false);
        };
        const debounceSearch = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceSearch);
    }, [searchTerm, currentUser.uid]);
    
    const handleStartChat = async (otherUser) => {
        const chatId = [currentUser.uid, otherUser.id].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                participants: [currentUser.uid, otherUser.id],
                participantProfiles: {
                    [currentUser.uid]: { name: userProfile.displayName, photoURL: userProfile.photoURL },
                    [otherUser.id]: { name: otherUser.displayName, photoURL: otherUser.photoURL }
                },
                unreadCount: { [currentUser.uid]: 0, [otherUser.id]: 0 },
                lastMessage: null,
                lastUpdated: serverTimestamp()
            });
        }
        setSearchTerm(''); // Clear search after starting chat
        setSearchResults([]);
        navigate('chat', { chatId });
    };
    // --- End of New Search Logic ---

    if (loading) {
        return <div className="text-center text-gray-400">Loading chats...</div>;
    }

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg animate-fade-in">
            <div className="p-4 border-b border-gray-700/50">
                <h1 className="text-2xl font-bold text-cyan-300 mb-4">Messages</h1>
                {/* --- Start of Search Bar UI --- */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for users to chat with..."
                        className="w-full bg-gray-900/70 border-2 border-gray-700 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
                    />
                </div>
                {/* --- End of Search Bar UI --- */}
            </div>

            {/* --- Start of Search Results UI --- */}
            {searchTerm.length > 0 && (
                <div className="p-2">
                    {isSearching && <p className="text-gray-400 text-center p-4">Searching...</p>}
                    {!isSearching && searchResults.length > 0 && searchResults.map(user => (
                        <div key={user.id} onClick={() => handleStartChat(user)} className="p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0">
                                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{user.displayName}</h3>
                                <p className="text-sm text-gray-400">@{user.username}</p>
                            </div>
                        </div>
                    ))}
                    {!isSearching && searchTerm.length >= 3 && searchResults.length === 0 && (
                        <p className="text-gray-500 text-center p-4">No users found.</p>
                    )}
                </div>
            )}
            {/* --- End of Search Results UI --- */}
            
            <div className="divide-y divide-gray-700/50">
                {chats.length > 0 ? (
                    chats.map(chat => {
                        // ... (existing chat list mapping code remains the same)
                        const otherUserId = chat.participants.find(p => p !== currentUser.uid);
                        const otherUserProfile = chat.participantProfiles[otherUserId] || {};
                        const unreadCount = chat.unreadCount?.[currentUser.uid] || 0;
                        const isUnread = unreadCount > 0;
                        return (
                            <div key={chat.id} onClick={() => navigate('chat', { chatId: chat.id })}
                                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-700/50 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0">
                                    {otherUserProfile.photoURL ? (
                                        <img src={otherUserProfile.photoURL} alt="Profile" className="w-full h-full rounded-full" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-400 m-3" />
                                    )}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <h2 className="font-bold text-white truncate">{otherUserProfile.name || 'Anonymous'}</h2>
                                    <p className={`text-sm truncate ${isUnread ? 'text-gray-100 font-semibold' : 'text-gray-400'}`}>
                                        {chat.lastMessage?.text || 'No messages yet'}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                        {chat.lastUpdated?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isUnread && (
                                        <span className="w-6 h-6 bg-cyan-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="p-8 text-center text-gray-500">You have no messages yet. Start a conversation from a user's post.</p>
                )}
            </div>
        </div>
    );
};

export default ChatsListPage;