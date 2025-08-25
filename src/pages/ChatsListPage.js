import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User } from 'lucide-react';

const ChatsListPage = ({ navigate }) => {
    const { currentUser } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        
        const q = query(
            collection(db, 'chats'), 
            where('participants', 'array-contains', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            chatsData.sort((a, b) => (b.lastUpdated?.toMillis() || 0) - (a.lastUpdated?.toMillis() || 0));
            setChats(chatsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    if (loading) {
        return <div className="text-center text-gray-400">Loading chats...</div>;
    }

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg animate-fade-in">
            <div className="p-4 border-b border-gray-700/50">
                <h1 className="text-2xl font-bold text-cyan-300">Messages</h1>
            </div>
            <div className="divide-y divide-gray-700/50">
                {chats.length > 0 ? (
                    chats.map(chat => {
                        const otherUserId = chat.participants.find(p => p !== currentUser.uid);
                        const otherUserProfile = chat.participantProfiles[otherUserId] || {};
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
                                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage?.text || 'No messages yet'}</p>
                                </div>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                    {chat.lastUpdated?.toDate().toLocaleTimeString()}
                                </span>
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
