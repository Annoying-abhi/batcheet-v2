import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { processMentions } from '../firebase/helpers';
import { Send } from 'lucide-react';

const CommentForm = ({ postId, parentCommentId = null, onCommentPosted }) => {
    const { currentUser, userProfile } = useAuth();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUser || !userProfile) return;

        const commentText = text;
        setText('');
        setIsSubmitting(true);

        try {
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);
            const postData = postSnap.data();

            await addDoc(collection(db, "comments"), {
                text: commentText,
                postId,
                parentCommentId,
                authorId: currentUser.uid,
                authorProfile: {
                    name: userProfile.displayName,
                    photoURL: userProfile.photoURL,
                    username: userProfile.username
                },
                createdAt: serverTimestamp()
            });

            if (!parentCommentId) {
                const currentCount = postData.commentCount || 0;
                await updateDoc(postRef, { commentCount: currentCount + 1 });
            }

            await processMentions(
                commentText,
                currentUser.uid,
                userProfile.displayName,
                postId,
                postData.text.substring(0, 50),
                'comment' // Provide the context here
            );

            if (postData.authorId !== currentUser.uid) {
                const notificationRef = collection(db, 'users', postData.authorId, 'notifications');
                addDoc(notificationRef, {
                    type: 'comment',
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile.displayName,
                    postId: postId,
                    postTextSnippet: postData.text.substring(0, 50),
                    commentText: commentText,
                    createdAt: serverTimestamp(),
                    read: false
                });
            }

        } catch (error) {
            console.error("Error adding comment:", error);
            setText(commentText);
        } finally {
            setIsSubmitting(false);
            if (onCommentPosted) onCommentPosted();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-cyan-500/20 p-2 rounded-lg shadow-2xl shadow-black/50">
                <input
                    type="text" value={text} onChange={(e) => setText(e.target.value)}
                    placeholder={parentCommentId ? "Write a reply..." : "Add to the conversation..."}
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
