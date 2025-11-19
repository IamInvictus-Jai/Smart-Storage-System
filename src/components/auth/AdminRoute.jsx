import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};
