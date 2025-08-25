import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, runTransaction } from 'firebase/firestore';

const ReactionButton = ({ post, reactionType }) => {
    const { currentUser } = useAuth();
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

        // Optimistic UI update
        const originalReactions = { ...post.reactions };
        const hadAlreadyReacted = userHasReacted;

        // Immediately update the local state
        setUserHasReacted(!hadAlreadyReacted);
        setCount(hadAlreadyReacted ? count - 1 : count + 1);


        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) {
                    throw new Error("Document does not exist!");
                }

                const postData = postDoc.data();
                const newReactions = { ...(postData.reactions || {}) };

                // Ensure all reaction types are initialized
                Object.keys(reactionEmojis).forEach(key => {
                    if (!newReactions[key]) {
                        newReactions[key] = [];
                    }
                });
                
                // Allow only one reaction type per user
                Object.keys(newReactions).forEach(key => {
                    const reactorsList = newReactions[key];
                    const userIndex = reactorsList.indexOf(currentUser.uid);
                    if (userIndex > -1) {
                        reactorsList.splice(userIndex, 1);
                    }
                });

                // Add the new reaction if the user hadn't reacted this way before
                if (!hadAlreadyReacted) {
                    newReactions[reactionType].push(currentUser.uid);
                }
                
                transaction.update(postRef, { reactions: newReactions });
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            // If the transaction fails, revert the optimistic UI update
            setUserHasReacted(hadAlreadyReacted);
            setCount(originalReactions[reactionType]?.length || 0);
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
