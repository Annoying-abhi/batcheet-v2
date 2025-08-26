import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SignOutModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center">
            <div className="bg-gray-800 border border-red-500/50 rounded-lg shadow-xl p-6 max-w-sm mx-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Are you sure?</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            You are signed in anonymously. If you sign out, you will lose access to this account and your chats forever.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignOutModal;