import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Share, AlertTriangle, UserX, Trash2 } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const PostMenu = ({ post, onBlock, onDelete, isAuthor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { openModal } = useModal();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/#post/${post.id}`;
        try {
            await navigator.share({
                title: 'Check out this post on Batcheet',
                text: `"${post.text}"`,
                url: shareUrl,
            });
        } catch (error) {
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        }
        setIsOpen(false);
    };

    const handleReport = () => {
        openModal('report', { post });
        setIsOpen(false);
    };

    const handleBlock = () => {
        openModal('confirm', {
            onConfirm: () => onBlock(post.authorId),
            title: "Block User?",
            message: `Are you sure you want to block ${post.authorProfile.name}? You will no longer see their posts.`,
            confirmText: "Block",
            confirmColor: "red"
        });
        setIsOpen(false);
    };

    const handleDelete = () => {
        openModal('delete', { onConfirm: onDelete });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-white transition-colors p-1">
                <MoreVertical className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20">
                    <ul className="divide-y divide-gray-600">
                        <li>
                            <button onClick={handleShare} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-3">
                                <Share className="w-4 h-4" /> Share Post
                            </button>
                        </li>
                        {isAuthor && (
                            <li>
                                <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center gap-3">
                                    <Trash2 className="w-4 h-4" /> Delete Post
                                </button>
                            </li>
                        )}
                        {!isAuthor && (
                            <>
                                <li>
                                    <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-600 flex items-center gap-3">
                                        <AlertTriangle className="w-4 h-4" /> Report
                                    </button>
                                </li>
                                <li>
                                    <button onClick={handleBlock} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center gap-3">
                                        <UserX className="w-4 h-4" /> Block User
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PostMenu;
