import { Navigate, Outlet } from 'react-router-dom';
import { getAuthUser } from '../services/auth';

function AdminRoute() {
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  if (authUser.role !== 'ADMIN') {
    return <Navigate to="/modules" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
