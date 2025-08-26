import React from 'react';
import { useModal } from '../contexts/ModalContext';

import ConfirmModal from './ConfirmModal';
import DeleteModal from './DeleteModal';
import ReportModal from './ReportModal';
import SignOutModal from './SignOutModal'; // Import the new modal

const ModalManager = () => {
    const { modalState, closeModal } = useModal();
    const { type, props } = modalState;

    if (!type) {
        return null;
    }

    switch (type) {
        case 'delete':
            return <DeleteModal isOpen={true} onConfirm={props.onConfirm} onCancel={closeModal} />;
        case 'confirm':
            return <ConfirmModal isOpen={true} {...props} onCancel={closeModal} />;
        case 'report':
            return <ReportModal isOpen={true} post={props.post} onCancel={closeModal} />;
        // --- Add the new case for the sign-out modal ---
        case 'sign-out':
            return <SignOutModal isOpen={true} onConfirm={props.onConfirm} onCancel={closeModal} />;
        default:
            return null;
    }
};

export default ModalManager;