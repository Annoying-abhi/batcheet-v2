import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { processMentions } from '../firebase/helpers';
import { Feather, Sun, Wind, Hash, Moon, Coffee, Send } from 'lucide-react';

const moodIcons = {
    'Reflective': <Feather className="w-4 h-4" />,
    'Joyful': <Sun className="w-4 h-4" />,
    'Vent': <Wind className="w-4 h-4" />,
    'Curious': <Hash className="w-4 h-4" />,
    'Tired': <Moon className="w-4 h-4" />,
    'Chill': <Coffee className="w-4 h-4" />,
};

const CreatePostPage = ({ navigate }) => {
    const { currentUser, userProfile } = useAuth();
    const [text, setText] = useState('');
    const [mood, setMood] = useState('Reflective');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const moods = Object.keys(moodIcons);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUser || !userProfile) return;
        setIsSubmitting(true);
        
        try {
            const postDocRef = await addDoc(collection(db, "posts"), {
                text, 
                mood, 
                authorId: currentUser.uid,
                authorProfile: {
                    name: userProfile.displayName,
                    photoURL: userProfile.photoURL,
                    username: userProfile.username
                },
                createdAt: serverTimestamp(), 
                commentCount: 0,
                reactions: { fire: [], mindblown: [], funny: [], wholesome: [], relatable: [] }
            });

            await processMentions(
                text,
                currentUser.uid,
                userProfile.displayName,
                postDocRef.id,
                text.substring(0, 50),
                'post' // Provide the context here
            );

            navigate('home');
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 p-6 rounded-lg shadow-lg animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-cyan-300">Share Your Thoughts</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's on your mind? Mention friends with @username..."
                    className="w-full h-40 p-4 bg-gray-900/70 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all duration-300 shadow-inner text-lg"
                    maxLength="500"
                />
                <p className="text-right text-sm text-gray-500 mt-1">{text.length} / 500</p>
                
                <div className="my-6">
                    <label className="block mb-3 text-sm font-medium text-gray-300">Select a mood:</label>
                    <div className="flex flex-wrap gap-2">
                        {moods.map(m => (
                            <button key={m} type="button" onClick={() => setMood(m)}
                                className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-2 transition-all duration-300 border ${mood === m ? 'bg-cyan-500 text-white border-cyan-400 font-semibold shadow-md' : 'bg-gray-700/80 border-gray-600 hover:bg-gray-600/80 hover:border-gray-500'}`}>
                                {moodIcons[m]}
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 border-t border-gray-700/50 pt-6">
                    <button type="button" onClick={() => navigate('home')}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting || !text.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-px disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Sending...' : 'Send Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostPage;
