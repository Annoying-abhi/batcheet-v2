import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { db } from '../firebase/config';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import PostCard from '../components/PostCard';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';

const PostPage = ({ navigate, postId }) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const postRef = doc(db, "posts", postId);
        const unsubPost = onSnapshot(postRef, (doc) => {
            setPost(doc.exists() ? { id: doc.id, ...doc.data() } : null);
            setLoading(false);
        });

        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
        const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            commentsData.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
            setComments(commentsData);
        });

        return () => { unsubPost(); unsubComments(); };
    }, [postId]);

    // --- New logic to create comment threads ---
    const commentThreads = useMemo(() => {
        const commentMap = {};
        const topLevelComments = [];

        // First pass: map all comments by their ID
        comments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        // Second pass: link replies to their parents
        comments.forEach(comment => {
            if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
                commentMap[comment.parentCommentId].replies.push(commentMap[comment.id]);
            } else {
                topLevelComments.push(commentMap[comment.id]);
            }
        });
        return topLevelComments;
    }, [comments]);
    
    // --- Recursive component to render comments and their replies ---
    const CommentThread = ({ commentsList }) => {
        return commentsList.map(comment => (
            <div key={comment.id} className="ml-4 border-l-2 border-gray-700/50 pl-4">
                <Comment comment={comment} postAuthorId={post.authorId} postId={postId} />
                {comment.replies.length > 0 && <CommentThread commentsList={comment.replies} />}
            </div>
        ));
    };

    if (loading) { /* ... loading UI ... */ }
    if (!post) { /* ... post not found UI ... */ }

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate('home')} className="text-cyan-400 mb-4 hover:underline">&larr; Back to all posts</button>
            <PostCard post={post} navigate={navigate} />

            <div className="my-8">
                <h3 className="text-xl font-semibold mb-4 border-b border-gray-700/50 pb-2 text-gray-300">Conversation</h3>
                <div className="space-y-4 mt-4">
                    {/* --- Render top-level comments and their threads --- */}
                    {commentThreads.map(comment => (
                        <div key={comment.id}>
                            <Comment comment={comment} postAuthorId={post.authorId} postId={postId} />
                            {comment.replies.length > 0 && <CommentThread commentsList={comment.replies} />}
                        </div>
                    ))}
                </div>
                {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No replies yet. Start the conversation!</p>
                )}
            </div>
            {/* --- The main comment form for top-level comments --- */}
            <CommentForm postId={postId} />
        </div>
    );
};

export default PostPage;