import React, { useState } from 'react';
import { User } from 'lucide-react';
import CommentForm from './CommentForm'; // Import CommentForm

const Comment = ({ comment, postAuthorId, postId }) => { // Add postId prop
    const [showReplyForm, setShowReplyForm] = useState(false);
    const isOriginalPoster = comment.authorId === postAuthorId;
    const authorProfile = comment.authorProfile || {};

    return (
        <div>
            <div className={`flex items-start gap-3 p-3 rounded-lg ${isOriginalPoster ? 'bg-cyan-900/30' : 'bg-gray-700/30'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    {authorProfile.photoURL ? (
                        <img src={authorProfile.photoURL} alt="Author" className="w-full h-full rounded-full" />
                    ) : (
                        <User className="w-4 h-4 text-gray-400" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold text-sm ${isOriginalPoster ? 'text-cyan-300' : 'text-gray-300'}`}>
                            {authorProfile.name} {isOriginalPoster && <span className="text-xs font-normal text-cyan-400">(OP)</span>}
                        </p>
                        <p className="text-xs text-gray-500">{comment.createdAt?.toDate().toLocaleTimeString()}</p>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                    {/* --- Add Reply button --- */}
                    <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-cyan-400 font-semibold mt-2">
                        Reply
                    </button>
                </div>
            </div>
            {/* --- Conditionally render the reply form --- */}
            {showReplyForm && (
                <div className="ml-8 mt-2">
                    <CommentForm
                        postId={postId}
                        parentCommentId={comment.id}
                        onCommentPosted={() => setShowReplyForm(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default Comment;