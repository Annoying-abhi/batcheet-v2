import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ReactionButton = ({ post, reactionType }) => {
    const { currentUser, userProfile } = useAuth();
    const [count, setCount] = useState(0);
    const [userHasReacted, setUserHasReacted] = useState(false);

    useEffect(() => {
        if (!post.reactions) return;
        const reactors = post.reactions[reactionType] || [];
        setCount(reactors.length);
        if (currentUser) {
            setUserHasReacted(reactors.includes(currentUser.uid));
        }
    }, [post.reactions, reactionType, currentUser]);

    const reactionEmojis = {
        fire: '🔥',
        mindblown: '🤯',
        funny: '😂',
        wholesome: '❤️',
        relatable: '😢'
    };

    const handleReaction = async () => {
        if (!currentUser) return;
        const postRef = doc(db, 'posts', post.id);

        const hadAlreadyReacted = userHasReacted;
        setUserHasReacted(!hadAlreadyReacted);
        setCount(hadAlreadyReacted ? count - 1 : count + 1);

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw new Error("Document does not exist!");

                const postData = postDoc.data();
                const newReactions = { ...(postData.reactions || {}) };
                Object.keys(reactionEmojis).forEach(key => {
                    if (!newReactions[key]) newReactions[key] = [];
                });
                
                let userAlreadyReactedSomewhere = false;
                Object.keys(newReactions).forEach(key => {
                    const userIndex = newReactions[key].indexOf(currentUser.uid);
                    if (userIndex > -1) {
                        userAlreadyReactedSomewhere = true;
                        newReactions[key].splice(userIndex, 1);
                    }
                });

                if (!hadAlreadyReacted) {
                    newReactions[reactionType].push(currentUser.uid);
                }
                
                transaction.update(postRef, { reactions: newReactions });
            });

            // Add Notification Logic
            if (!hadAlreadyReacted && post.authorId !== currentUser.uid) {
                const notificationRef = collection(db, 'users', post.authorId, 'notifications');
                await addDoc(notificationRef, {
                    type: 'reaction',
                    reactionType: reactionType,
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile.displayName,
                    postId: post.id,
                    postTextSnippet: post.text.substring(0, 50),
                    createdAt: serverTimestamp(),
                    read: false
                });
            }

        } catch (e) {
            console.error("Transaction failed: ", e);
            setUserHasReacted(hadAlreadyReacted);
            setCount(post.reactions[reactionType]?.length || 0);
        }
    };

    return (
        <button
            onClick={handleReaction}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-200 ${userHasReacted ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-700/50 hover:bg-gray-700'}`}
        >
            <span className="text-lg">{reactionEmojis[reactionType]}</span>
            <span className="text-sm font-semibold">{count}</span>
        </button>
    );
};

export default ReactionButton;