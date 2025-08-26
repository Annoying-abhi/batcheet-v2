import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
// Import 'increment'
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { Send } from 'lucide-react';

const MessageForm = ({ chatId }) => {
    const { currentUser } = useAuth();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const typingTimeoutRef = useRef(null);

    const updateTypingStatus = (isTyping) => {
        if (!db || !chatId || !currentUser) return;
        const chatRef = doc(db, 'chats', chatId);
        updateDoc(chatRef, {
            [`typingStatus.${currentUser.uid}`]: isTyping
        }).catch(e => console.error("Error updating typing status:", e));
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        } else {
            updateTypingStatus(true);
        }

        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUser || !db) return;

        const messageText = text;
        setText(''); 
        setIsSubmitting(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        updateTypingStatus(false);

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const chatRef = doc(db, 'chats', chatId);

        try {
            // --- Start of Change ---
            const chatSnap = await getDoc(chatRef);
            if (!chatSnap.exists()) {
                throw new Error("Chat does not exist!");
            }
            const chatData = chatSnap.data();
            const otherUserId = chatData.participants.find(p => p !== currentUser.uid);

            await addDoc(messagesRef, {
                text: messageText,
                senderId: currentUser.uid,
                createdAt: serverTimestamp()
            });

            await updateDoc(chatRef, {
                lastMessage: { text: messageText, senderId: currentUser.uid },
                lastUpdated: serverTimestamp(),
                // Increment the unread count for the other user
                [`unreadCount.${otherUserId}`]: increment(1)
            });
            // --- End of Change ---

        } catch (error) {
            console.error("Error sending message:", error);
            setText(messageText);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-600 p-2 rounded-lg">
                <input
                    type="text" value={text} onChange={handleTextChange}
                    placeholder="Type a message..."
                    className="w-full bg-transparent focus:outline-none px-2 text-gray-200"
                />
                <button type="submit" disabled={isSubmitting || !text.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold p-2 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0">
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

export default MessageForm;