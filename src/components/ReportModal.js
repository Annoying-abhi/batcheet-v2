import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ReportModal = ({ isOpen, onCancel, post }) => {
    const { currentUser } = useAuth();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim() || !currentUser) return;
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'reports'), {
                postId: post.id,
                reportedBy: currentUser.uid,
                reason: reason,
                postContent: post.text,
                postAuthorId: post.authorId,
                createdAt: serverTimestamp(),
            });
            setShowSuccess(true); // Show success message instead of alert
        } catch (error) {
            console.error("Error submitting report:", error);
            alert('Failed to submit report. Please try again.'); // Fallback alert for errors
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-gray-800 border border-yellow-500/50 rounded-lg shadow-xl p-6 max-w-md mx-4 w-full">
                {showSuccess ? (
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Report Submitted</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Thank you for your feedback. We will review this post shortly.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Report Post</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Please provide a reason for reporting this post.
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., spam, harassment, inappropriate content..."
                                className="w-full h-24 p-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-300 shadow-inner"
                                required
                            />
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-semibold transition-colors disabled:bg-gray-500">
                                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
