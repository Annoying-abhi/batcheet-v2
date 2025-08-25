import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import PostCard from '../components/PostCard';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';

const PostPage = ({ navigate, postId }) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        const postRef = doc(db, "posts", postId);
        const unsubPost = onSnapshot(postRef, (doc) => {
            setPost(doc.exists() ? { id: doc.id, ...doc.data() } : null);
            setLoading(false);
        });

        // Query without ordering to avoid needing a composite index
        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
        const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort the comments by date here in the code
            commentsData.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
            setComments(commentsData);
        });

        return () => { 
            unsubPost(); 
            unsubComments(); 
        };
    }, [postId]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    if (loading) {
        return <div className="text-center text-gray-400">Loading post...</div>;
    }

    if (!post) {
        return (
            <div className="text-center py-20 bg-gray-800/50 rounded-lg animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-300">Post Not Found</h2>
                <p className="text-gray-400 mt-2">This post may have faded away or been deleted.</p>
                <button onClick={() => navigate('home')}
                    className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate('home')} className="text-cyan-400 mb-4 hover:underline">&larr; Back to all posts</button>
            <PostCard post={post} navigate={navigate} />

            <div className="my-8">
                <h3 className="text-xl font-semibold mb-4 border-b border-gray-700/50 pb-2 text-gray-300">Conversation</h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mt-4">
                    {comments.map(comment => <Comment key={comment.id} comment={comment} postAuthorId={post.authorId} />)}
                    <div ref={commentsEndRef} />
                </div>
                 {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No replies yet. Start the conversation!</p>
                )}
            </div>

            <CommentForm postId={postId} />
        </div>
    );
};

export default PostPage;
