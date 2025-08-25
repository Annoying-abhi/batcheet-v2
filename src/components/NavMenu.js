import React from 'react';
import { Home, MessageCircle, Zap } from 'lucide-react'; // Changed Icon

const NavMenu = ({ navigate, currentPage }) => {
    const navItems = [
        { name: 'Home', page: 'home', icon: <Home /> },
        { name: 'Trending', page: 'trending', icon: <Zap /> }, // Changed "New Post" to "Trending"
        { name: 'Messages', page: 'chats', icon: <MessageCircle /> },
    ];

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 shadow-lg">
            <ul className="space-y-1">
                {navItems.map(item => (
                    <li key={item.name}>
                        <button 
                            onClick={() => navigate(item.page)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-colors duration-200 ${currentPage === item.page ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
                        >
                            {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                            <span className="font-semibold">{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NavMenu;
