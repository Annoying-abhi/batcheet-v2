import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = "Confirm", confirmColor = "red" }) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-500 border-red-500/50',
        yellow: 'bg-yellow-600 hover:bg-yellow-500 border-yellow-500/50',
    };

    const iconColorClasses = {
        red: 'bg-red-500/20 text-red-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className={`bg-gray-800 border ${colorClasses[confirmColor]} rounded-lg shadow-xl p-6 max-w-sm mx-4`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${iconColorClasses[confirmColor]} flex items-center justify-center flex-shrink-0`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded-lg ${colorClasses[confirmColor]} text-white font-semibold transition-colors`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
