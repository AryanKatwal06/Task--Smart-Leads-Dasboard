import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store';

type Props = {
  allowedRoles: Array<'admin' | 'sales'>;
  children: React.ReactElement;
};

const RequireRole: React.FC<Props> = ({ allowedRoles, children }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as 'admin' | 'sales')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireRole;
