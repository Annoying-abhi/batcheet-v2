import React from 'react';
import { Sparkles, Bell } from 'lucide-react'; // Import Bell icon
import { useAuth } from '../contexts/AuthContext';

// Accept navigate and totalUnreadCount as props
const Header = ({ navigate, totalUnreadCount }) => { 
  const { userProfile } = useAuth();

  return (
    <header className="bg-gray-900/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-700/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div 
            onClick={() => navigate('home')}
            className="text-2xl font-bold tracking-wider text-cyan-400 cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-cyan-300" />
            Batcheet
          </div>
          {userProfile && (
            <div className="flex items-center gap-4">
              {/* --- Start of Change: Notification Bell --- */}
              <button onClick={() => navigate('chats')} className="relative text-gray-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                {totalUnreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></div>
                )}
              </button>
              {/* --- End of Change --- */}
              <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-200">{userProfile.displayName}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-700">
                      {userProfile.photoURL && <img src={userProfile.photoURL} alt="Profile" className="w-full h-full rounded-full" />}
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;