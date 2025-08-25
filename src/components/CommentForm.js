import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config'; // ✅ Correct import for Firebase
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Send } from 'lucide-react';

const CommentForm = ({ postId }) => {
    const { currentUser, userProfile } = useAuth();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUser || !userProfile) return;
        
        const commentText = text;
        setText(''); // Clear the input box immediately for instant feedback
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "comments"), {
                text: commentText, 
                postId, 
                authorId: currentUser.uid, 
                authorProfile: {
                    name: userProfile.displayName,
                    photoURL: userProfile.photoURL,
                },
                createdAt: serverTimestamp()
            });

            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);
            if(postSnap.exists()){
                const currentCount = postSnap.data().commentCount || 0;
                await updateDoc(postRef, { commentCount: currentCount + 1 });
            }

        } catch (error) {
            console.error("Error adding comment:", error);
            setText(commentText); // If error, put the text back so user can retry
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 sticky bottom-4 lg:bottom-0">
            <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-cyan-500/20 p-2 rounded-lg shadow-2xl shadow-black/50">
                <input
                    type="text" value={text} onChange={(e) => setText(e.target.value)}
                    placeholder="Add to the conversation..."
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

export default CommentForm;
