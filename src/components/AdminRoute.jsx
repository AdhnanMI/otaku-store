import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function AdminRoute({ children }) {
  const { user, authLoading } = useStore();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}