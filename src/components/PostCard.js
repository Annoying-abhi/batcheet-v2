import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useUserSearch } from '../contexts/UserSearchContext'; // Import the search hook
import { User, Feather, MessageSquare, Send } from 'lucide-react';
import ReactionButton from './ReactionButton';
import PostMenu from './PostMenu';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// --- Helper Component for rendering text with mentions ---
const RenderTextWithMentions = ({ text, navigate }) => {
    const { findUserByUsername } = useUserSearch(); // Use the search function from our context

    // This function is called when a user clicks on a @mention
    const handleMentionClick = async (e, username) => {
        e.stopPropagation(); // Prevents the click from bubbling up to the post card
        const userId = await findUserByUsername(username);
        if (userId) {
            navigate('profile', { userId: userId });
        } else {
            // You could show a "user not found" toast here if you like
            console.log(`User @${username} not found.`);
        }
    };

    const mentionRegex = /@([a-z0-9_]+)/g;
    const parts = text.split(mentionRegex);

    return (
        <p className="my-5 text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
            {parts.map((part, index) => {
                // Every odd-indexed part is a username
                if (index % 2 === 1) {
                    return (
                        <span
                            key={index}
                            className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                            onClick={(e) => handleMentionClick(e, part)}
                        >
                            @{part}
                        </span>
                    );
                }
                // Even-indexed parts are regular text
                return part;
            })}
        </p>
    );
};


const PostCard = ({ post, navigate, onDelete }) => {
    const { currentUser, userProfile, blockUser } = useAuth();
    const { openModal } = useModal();

    if (!post) {
        return null;
    }

    const isAuthor = currentUser && post.authorId === currentUser.uid;
    const authorProfile = post.authorProfile || {};

    const moodIcons = { 'Reflective': <Feather />, 'Joyful': <Feather />, 'Vent': <Feather />, 'Curious': <Feather />, 'Tired': <Feather />, 'Chill': <Feather /> };
    
    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (post.authorId) navigate('profile', { userId: post.authorId });
    };

    const handleDelete = () => {
        openModal('delete', { onConfirm: () => onDelete(post.id) });
    };

    const handleStartChat = async () => {
        if (!db || !currentUser || !userProfile || currentUser.uid === post.authorId) return;
        const chatId = [currentUser.uid, post.authorId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                participants: [currentUser.uid, post.authorId],
                participantProfiles: {
                    [currentUser.uid]: { name: userProfile.displayName, photoURL: userProfile.photoURL, username: userProfile.username },
                    [post.authorId]: { name: authorProfile.name, photoURL: authorProfile.photoURL, username: authorProfile.username }
                },
                lastMessage: null,
                lastUpdated: serverTimestamp()
             });
        }
        navigate('chat', { chatId });
    };

    return (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="p-5 shadow-inner-top" onClick={() => navigate('post', { postId: post.id })}>
                <div className="flex justify-between items-start">
                    <div onClick={handleProfileClick} className="flex items-center gap-3 min-w-0 cursor-pointer group">
                        <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            {authorProfile.photoURL ? (
                                <img src={authorProfile.photoURL} alt="Author" className="w-full h-full rounded-full" />
                            ) : (
                                <User className="w-5 h-5 text-cyan-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                                <p className="font-extrabold tracking-tight text-lg text-white truncate group-hover:text-cyan-300 transition-colors">{authorProfile.name || 'Anonymous'}</p>
                                <p className="text-sm text-gray-500 truncate">@{authorProfile.username || 'user'}</p>
                            </div>
                            <p className="text-xs text-gray-400">
                                {post.createdAt?.toDate().toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className="flex items-center gap-2 bg-black/20 text-gray-300 px-3 py-1 rounded-full text-xs shadow-inner border border-gray-700">
                            {React.cloneElement(moodIcons[post.mood] || <Feather />, { className: "w-4 h-4" })}
                            <span className="font-semibold">{post.mood}</span>
                        </div>
                        <PostMenu post={post} onBlock={blockUser} onDelete={handleDelete} isAuthor={isAuthor} />
                    </div>
                </div>
                
                <RenderTextWithMentions text={post.text} navigate={navigate} />

            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-black/20 border-t border-gray-700/80 px-5 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <ReactionButton post={post} reactionType="fire" />
                    <ReactionButton post={post} reactionType="mindblown" />
                    <ReactionButton post={post} reactionType="funny" />
                    <ReactionButton post={post} reactionType="wholesome" />
                    <ReactionButton post={post} reactionType="relatable" />
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                    <button onClick={() => navigate('post', { postId: post.id })} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-semibold">{post.commentCount || 0}</span>
                    </button>
                    {!isAuthor && (
                         <button onClick={handleStartChat} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition-colors">
                             <Send className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PostCard);
