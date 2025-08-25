import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';

const Router = ({ children }) => {
  const { currentUser } = useAuth();

  // If a user is logged in, show the main app (the "children").
  // If not, show the LoginPage.
  return currentUser ? children : <LoginPage />;
};

export default Router;
