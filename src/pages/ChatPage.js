import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, rtdb } from '../firebase/config';
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { User } from 'lucide-react';
import MessageForm from '../components/MessageForm';

const ChatPage = ({ navigate, chatId }) => {
    const { currentUser } = useAuth();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (chatId && currentUser) {
            const chatRef = doc(db, 'chats', chatId);
            updateDoc(chatRef, { [`unreadCount.${currentUser.uid}`]: 0 })
            .catch(e => console.error("Error resetting unread count:", e));
        }
    }, [chatId, currentUser]);

    useEffect(() => {
        if (!db || !chatId) return;
        
        const chatRef = doc(db, 'chats', chatId);
        const unsubChat = onSnapshot(chatRef, (doc) => {
            const chatData = doc.exists() ? { id: doc.id, ...doc.data() } : null;
            setChat(chatData);
            if (chatData) {
                const otherUserId = chatData.participants.find(p => p !== currentUser.uid);
                setIsOtherUserTyping(!!(chatData.typingStatus && chatData.typingStatus[otherUserId]));
            }
        });

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));
        const unsubMessages = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => { unsubChat(); unsubMessages(); };
    }, [chatId, currentUser.uid]);

    const otherUserId = chat?.participants.find(p => p !== currentUser.uid);

    useEffect(() => {
        if (!rtdb || !otherUserId) return;
        const userStatusRef = ref(rtdb, `/status/${otherUserId}`);
        const unsubscribe = onValue(userStatusRef, (snapshot) => {
            const status = snapshot.val();
            setIsOnline(status?.state === 'online');
        });
        return () => unsubscribe();
    }, [otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) return <div className="text-center text-gray-400">Loading chat...</div>;
    if (!chat) return <div className="text-center text-gray-400">Chat not found.</div>;

    const otherUserProfile = chat.participantProfiles[otherUserId] || {};

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg animate-fade-in h-[calc(100vh-12rem)] flex flex-col">
            <div className="p-4 border-b border-gray-700/50 flex items-center gap-4">
                <button onClick={() => navigate('chats')} className="text-cyan-400 hover:underline">&larr;</button>
                <div 
                    onClick={() => navigate('profile', { userId: otherUserId })} 
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="relative w-10 h-10 rounded-full bg-gray-600 flex-shrink-0">
                        {otherUserProfile.photoURL ? (
                            <img src={otherUserProfile.photoURL} alt="Profile" className="w-full h-full rounded-full" />
                        ) : (
                            <User className="w-5 h-5 text-gray-400 m-2.5" />
                        )}
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{otherUserProfile.name || 'Anonymous'}</h1>
                        <p className="text-xs text-gray-400">{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.senderId === currentUser.uid ? 'text-cyan-200' : 'text-gray-400'} text-right`}>
                                {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                {/* --- THIS IS THE CORRECTED CODE BLOCK --- */}
                {isOtherUserTyping && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none">
                            <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <MessageForm chatId={chatId} />
        </div>
    );
};

export default ChatPage;