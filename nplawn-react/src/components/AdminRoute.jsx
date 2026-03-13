import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so only authenticated admins can access it.
 * - Not logged in  → redirect to /login
 * - Logged in, not admin → redirect to /
 * - Admin → render children
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for session hydration

  if (!user) return <Navigate to="/login" replace />;

  // Accept role set via Supabase app_metadata OR the known admin email as fallback
  // (covers accounts created before app_metadata.role was set in the Supabase dashboard).
  const isAdmin = user.role === 'admin' || user.email === 'admin@admin.com';
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
