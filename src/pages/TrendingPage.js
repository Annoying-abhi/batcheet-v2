import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import PostCard from '../components/PostCard';
import { Zap } from 'lucide-react';

const TrendingPage = ({ navigate }) => {
    const { currentUser, userProfile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
        const q = query(collection(db, "posts"), where("createdAt", ">", twentyFourHoursAgo));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                // Calculate trending score: each reaction is 1 point, each comment is 2 points
                const reactionCount = Object.values(data.reactions || {}).reduce((acc, reactors) => acc + reactors.length, 0);
                const commentCount = data.commentCount || 0;
                const score = reactionCount + (commentCount * 2);
                return { id: doc.id, ...data, score };
            });
            
            // Sort posts by score, descending
            postsData.sort((a, b) => b.score - a.score);
            
            setPosts(postsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const deletePost = async (postId) => {
        if(!currentUser) return;
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists() && postSnap.data().authorId === currentUser.uid) {
            await deleteDoc(postRef).catch(e => console.error("Error deleting post:", e));
        }
    };

    const filteredPosts = userProfile?.blockedUsers 
        ? posts.filter(post => !userProfile.blockedUsers.includes(post.authorId))
        : posts;

    if (loading) {
        return <div className="text-center text-gray-400">Loading trending posts...</div>;
    }

    return (
        <div className="space-y-5">
            <div className="bg-gray-800/50 border border-cyan-500/20 p-4 rounded-lg mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-300">Trending Posts</h1>
            </div>
            {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        navigate={navigate} 
                        onDelete={deletePost}
                    />
                ))
            ) : (
                <div className="text-center py-16 bg-gray-800/50 border border-dashed border-gray-700/80 rounded-lg">
                    <p className="text-gray-500 text-lg">Nothing is trending right now.</p>
                    <p className="text-gray-400 mt-2">Be the first to create a popular post!</p>
                </div>
            )}
        </div>
    );
};

export default TrendingPage;
