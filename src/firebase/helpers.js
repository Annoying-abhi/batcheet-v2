import { db } from './config';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Parses text for @username mentions, finds the corresponding user IDs,
 * and creates a 'mention' notification for each valid user found.
 */
export const processMentions = async (text, fromUserId, fromUserName, postId, postTextSnippet, mentionContext) => {
    const mentionRegex = /@([a-z0-9_]+)/g;
    const mentions = text.match(mentionRegex);

    if (!mentions || mentions.length === 0) {
        return;
    }

    const uniqueUsernames = [...new Set(mentions)].map(u => u.substring(1));

    if (uniqueUsernames.length === 0) {
        return;
    }

    try {
        const usersQuery = query(collection(db, 'users'), where('username', 'in', uniqueUsernames));
        const usersSnapshot = await getDocs(usersQuery);

        usersSnapshot.forEach(userDoc => {
            const mentionedUserId = userDoc.id;
            if (mentionedUserId !== fromUserId) {
                const notificationRef = collection(db, 'users', mentionedUserId, 'notifications');
                addDoc(notificationRef, {
                    type: 'mention',
                    fromUserId: fromUserId,
                    fromUserName: fromUserName,
                    postId: postId,
                    postTextSnippet: postTextSnippet,
                    context: mentionContext, // 'post' or 'comment'
                    createdAt: serverTimestamp(),
                    read: false
                });
            }
        });
    } catch (error) {
        console.error("Error processing mentions:", error);
    }
};
