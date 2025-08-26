import React, { useState, useEffect } from 'react';
import { Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Header = ({ navigate }) => { 
  const { currentUser, userProfile } = useAuth();
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [animateBell, setAnimateBell] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // This listener checks for new unread notifications in real-time
    const notifsQuery = query(
        collection(db, 'users', currentUser.uid, 'notifications'),
        where('read', '==', false)
    );

    const unsubscribe = onSnapshot(notifsQuery, (snapshot) => {
        const newCount = snapshot.size;
        
        // Only animate if the count increases
        if (newCount > unreadNotifsCount) {
            setAnimateBell(true);
            // Remove the animation class after it has played
            setTimeout(() => setAnimateBell(false), 1000);
        }
        setUnreadNotifsCount(newCount);
    });

    return () => unsubscribe();
  }, [currentUser, unreadNotifsCount]);

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
              <button 
                onClick={() => navigate('notifications')} 
                className={`relative text-gray-400 hover:text-white transition-colors ${animateBell ? 'animate-shake' : ''}`}
              >
                <Bell className="w-6 h-6" />
                {unreadNotifsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-gray-900">
                      {unreadNotifsCount}
                    </div>
                )}
              </button>
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
