import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { Bell, MessageSquare, AtSign, Heart } from 'lucide-react';

// Helper component to render the correct icon for each notification type
const NotificationIcon = ({ type }) => {
    const iconProps = { className: "w-6 h-6 flex-shrink-0" };
    switch (type) {
        case 'comment': return <MessageSquare {...iconProps} />;
        case 'reaction': return <Heart {...iconProps} />;
        case 'mention': return <AtSign {...iconProps} />;
        default: return <Bell {...iconProps} />;
    }
};

const NotificationsPage = ({ navigate }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'users', currentUser.uid, 'notifications'),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // This function marks all unread notifications as read
    const handleMarkAllAsRead = async () => {
        if (!currentUser || notifications.length === 0) return;
        const unreadNotifs = notifications.filter(n => !n.read);
        if (unreadNotifs.length === 0) return;

        const batch = writeBatch(db);
        unreadNotifs.forEach(notif => {
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notif.id);
            batch.update(notifRef, { read: true });
        });
        await batch.commit().catch(e => console.error("Error marking notifications as read:", e));
    };

    const getNotificationMessage = (notif) => {
        const fromUserName = notif?.fromUserName || 'Someone';
        switch (notif.type) {
            case 'reaction':
                return <p><span className="font-bold">{fromUserName}</span> reacted to your post.</p>;
            case 'comment':
                return <p><span className="font-bold">{fromUserName}</span> commented on your post.</p>;
            case 'mention':
                 return <p><span className="font-bold">{fromUserName}</span> mentioned you in a {notif.context || 'post'}.</p>;
            default:
                return <p>You have a new notification.</p>;
        }
    };

    const handleNotificationClick = (notif) => {
        // Mark as read if it's unread
        if (!notif.read) {
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notif.id);
            updateDoc(notifRef, { read: true }).catch(e => console.error("Error marking notification as read:", e));
        }
        // Navigate to the post
        navigate('post', { postId: notif.postId });
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-cyan-300">Notifications</h1>
                <button 
                    onClick={handleMarkAllAsRead} 
                    className="text-sm text-cyan-400 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={notifications.every(n => n.read)}
                >
                    Mark all as read
                </button>
            </div>
            <div className="space-y-3">
                {loading && <p className="text-gray-400">Loading notifications...</p>}
                {!loading && notifications.length === 0 && (
                    <div className="text-center py-16 bg-gray-800/50 border border-dashed border-gray-700/80 rounded-lg">
                        <Bell className="mx-auto w-12 h-12 text-gray-600" />
                        <p className="text-gray-500 text-lg mt-4">It's quiet in here.</p>
                        <p className="text-gray-400 mt-1">Notifications about reactions, comments, and mentions will show up here.</p>
                    </div>
                )}
                {notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-lg flex items-start gap-4 cursor-pointer transition-all duration-200 ${notif.read ? 'bg-gray-800/50 hover:bg-gray-800/80' : 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20'}`}
                    >
                        <div className={`mt-1 ${notif.read ? 'text-gray-500' : 'text-cyan-400'}`}>
                            <NotificationIcon type={notif.type} />
                        </div>
                        <div className="flex-grow">
                            <div className="text-gray-200">{getNotificationMessage(notif)}</div>
                            <p className="text-xs text-gray-400 mt-1">{notif.createdAt?.toDate().toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsPage;
