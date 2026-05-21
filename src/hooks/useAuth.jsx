

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';


export const useAuth = () => useAuthStore();


export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export default useAuth;
