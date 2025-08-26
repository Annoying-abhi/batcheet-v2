import React, { createContext, useContext } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const UserSearchContext = createContext();

export const useUserSearch = () => useContext(UserSearchContext);

export const UserSearchProvider = ({ children }) => {
    
    /**
     * Finds a user by their username and returns their user document ID.
     * @param {string} username - The username to search for.
     * @returns {string|null} The user's ID if found, otherwise null.
     */
    const findUserByUsername = async (username) => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Return the document ID of the first user found
                return querySnapshot.docs[0].id;
            }
            return null;
        } catch (error) {
            console.error("Error finding user by username:", error);
            return null;
        }
    };

    return (
        <UserSearchContext.Provider value={{ findUserByUsername }}>
            {children}
        </UserSearchContext.Provider>
    );
};
