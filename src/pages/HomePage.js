import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import PostCard from '../components/PostCard';

const HomePage = ({ navigate }) => {
    const { currentUser, userProfile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
        const q = query(collection(db, "posts"), where("createdAt", ">", twentyFourHoursAgo));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            postsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
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
        return <div className="text-center text-gray-400">Loading posts...</div>;
    }

    return (
        <div className="space-y-5">
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
                    <p className="text-gray-500 text-lg">It's quiet here...</p>
                    <p className="text-gray-400 mt-2">Be the first to post.</p>
                    <button onClick={() => navigate('create')} className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Create a Post
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;
