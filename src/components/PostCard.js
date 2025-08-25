import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Feather, MessageCircle } from 'lucide-react';
import ReactionButton from './ReactionButton';
import DeleteModal from './DeleteModal';
import PostMenu from './PostMenu';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const PostCard = ({ post, navigate, onDelete }) => {
    const { currentUser, userProfile, blockUser } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const isAuthor = currentUser && post.authorId === currentUser.uid;
    const authorProfile = post.authorProfile || {};

    const moodIcons = {
        'Reflective': <Feather className="w-4 h-4" />,
        'Joyful': <Feather className="w-4 h-4" />,
        'Vent': <Feather className="w-4 h-4" />,
        'Curious': <Feather className="w-4 h-4" />,
        'Tired': <Feather className="w-4 h-4" />,
        'Chill': <Feather className="w-4 h-4" />,
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(post.id);
        }
        setIsDeleteModalOpen(false);
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
                    [currentUser.uid]: { name: userProfile.displayName, photoURL: userProfile.photoURL },
                    [post.authorId]: { name: authorProfile.name || 'Anonymous User', photoURL: authorProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}` }
                },
                lastMessage: null,
                lastUpdated: serverTimestamp()
            });
        }
        navigate('chat', { chatId });
    };

    return (
        <>
            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onConfirm={confirmDelete} 
                onCancel={() => setIsDeleteModalOpen(false)} 
            />
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg transition-all duration-300">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center flex-shrink-0">
                                {authorProfile.photoURL ? (
                                    <img src={authorProfile.photoURL} alt="Author" className="w-full h-full rounded-full" />
                                ) : (
                                    <User className="w-5 h-5 text-cyan-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white truncate">{authorProfile.name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">
                                    {post.createdAt?.toDate().toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <div className="flex items-center gap-2 bg-gray-700/80 text-gray-300 px-3 py-1 rounded-full text-xs shadow-inner">
                                {moodIcons[post.mood] || <Feather className="w-4 h-4" />}
                                <span>{post.mood}</span>
                            </div>
                            <PostMenu post={post} onBlock={blockUser} onDelete={handleDelete} isAuthor={isAuthor} />
                        </div>
                    </div>
                    <p 
                        className="my-4 text-gray-300 whitespace-pre-wrap text-base md:text-lg cursor-pointer"
                        onClick={() => navigate('post', { postId: post.id })}
                    >
                        {post.text}
                    </p>
                </div>
                {/* --- DEFINITIVE RESPONSIVE FOOTER --- */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-800/30 border-t border-gray-700/50 px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <ReactionButton post={post} reactionType="fire" />
                        <ReactionButton post={post} reactionType="mindblown" />
                        <ReactionButton post={post} reactionType="funny" />
                        <ReactionButton post={post} reactionType="wholesome" />
                        <ReactionButton post={post} reactionType="relatable" />
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center">
                        <button 
                            onClick={() => navigate('post', { postId: post.id })}
                            className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>{post.commentCount || 0}</span>
                        </button>
                        {!isAuthor && (
                             <button onClick={handleStartChat} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostCard;
