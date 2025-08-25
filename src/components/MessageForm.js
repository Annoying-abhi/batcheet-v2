import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
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
        setText(''); // Clear the input box immediately for instant feedback
        setIsSubmitting(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        updateTypingStatus(false);

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const chatRef = doc(db, 'chats', chatId);

        try {
            await addDoc(messagesRef, {
                text: messageText,
                senderId: currentUser.uid,
                createdAt: serverTimestamp()
            });

            await updateDoc(chatRef, {
                lastMessage: { text: messageText, senderId: currentUser.uid },
                lastUpdated: serverTimestamp()
            });

        } catch (error) {
            console.error("Error sending message:", error);
            setText(messageText); // If sending fails, restore the text
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
