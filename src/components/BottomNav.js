import React from 'react';
import { Home, Zap, MessageCircle, User } from 'lucide-react';

const BottomNav = ({ navigate, currentPage, unreadChatCount }) => {
    const navItems = [
        { name: 'Home', page: 'home', icon: <Home /> },
        { name: 'Trending', page: 'trending', icon: <Zap /> },
        { name: 'Messages', page: 'chats', icon: <MessageCircle />, count: unreadChatCount },
        { name: 'Profile', page: 'my-profile', icon: <User /> },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-lg border-t border-gray-700/50 shadow-t-lg z-50">
            <ul className="flex justify-around items-center h-16">
                 {navItems.map(item => (
                     <li key={item.name}>
                         <button 
                             onClick={() => navigate(item.page)}
                             className={`relative flex flex-col items-center gap-1 p-2 rounded-md transition-colors duration-200 w-16 ${currentPage === item.page ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                         >
                             {item.count > 0 && (
                                 <span className="absolute top-1 right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                                     {item.count}
                                 </span>
                             )}
                             {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                             <span className="text-xs font-semibold">{item.name}</span>
                         </button>
                     </li>
                 ))}
            </ul>
        </nav>
    );
};

export default BottomNav;
