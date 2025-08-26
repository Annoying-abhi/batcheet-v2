import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({ type: null, props: {} });

    const openModal = (type, props = {}) => setModalState({ type, props });
    const closeModal = () => setModalState({ type: null, props: {} });

    const value = { modalState, openModal, closeModal };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
