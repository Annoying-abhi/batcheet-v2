import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Router from './router/Router';
import Header from './components/Header';
import UserCard from './components/UserCard';
import BottomNav from './components/BottomNav';
import NavMenu from './components/NavMenu';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import PostPage from './pages/PostPage';
import ChatsListPage from './pages/ChatsListPage';
import ChatPage from './pages/ChatPage';
import TrendingPage from './pages/TrendingPage';
import NewPostButton from './components/NewPostButton';
import { Feather } from 'lucide-react';

const ProfilePage = () => <div className="lg:hidden"><UserCard /></div>;

function App() {
  const [page, setPage] = useState({ name: 'home' });
  const navigate = (pageName, params = {}) => setPage({ name: pageName, ...params });

  const renderPage = () => {
    switch (page.name) {
      case 'create': return <CreatePostPage navigate={navigate} />;
      case 'post': return <PostPage navigate={navigate} postId={page.postId} />;
      case 'chats': return <ChatsListPage navigate={navigate} />;
      case 'chat': return <ChatPage navigate={navigate} chatId={page.chatId} />;
      case 'trending': return <TrendingPage navigate={navigate} />;
      case 'profile': return <ProfilePage />;
      case 'home': default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-900 text-gray-200 font-sans min-h-screen antialiased">
          <Header />
          <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-4">
                  <UserCard />
                  <NewPostButton navigate={navigate} />
                  <NavMenu navigate={navigate} currentPage={page.name} />
                </div>
              </aside>
              <div className="col-span-12 lg:col-span-9 xl:col-span-6">{renderPage()}</div>
              <aside className="hidden xl:block xl:col-span-3">
                <div className="sticky top-24">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-lg text-cyan-400 mb-2">About Batcheet</h3>
                    <p className="text-sm text-gray-400">Fleeting thoughts, 24-hour lifespan. Be kind.</p>
                  </div>
                </div>
              </aside>
            </div>
          </main>
          <button onClick={() => navigate('create')} className="lg:hidden fixed bottom-20 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-full shadow-lg z-50">
            <Feather className="w-6 h-6" />
          </button>
          <BottomNav navigate={navigate} currentPage={page.name} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
