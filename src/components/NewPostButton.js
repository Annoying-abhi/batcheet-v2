import React from 'react';
import { Feather } from 'lucide-react';

const NewPostButton = ({ navigate }) => {
    return (
        <button
            onClick={() => navigate('create')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-px flex items-center justify-center gap-2"
        >
            <Feather className="w-5 h-5" />
            <span>New Post</span>
        </button>
    );
};

export default NewPostButton;
