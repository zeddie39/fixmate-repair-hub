
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { TechnicianDashboard } from '@/components/TechnicianDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const role = profile?.role || 'customer';

  return (
    <div className="min-h-screen bg-background">
      {role === 'admin' || role === 'super_admin' ? (
        <AdminDashboard />
      ) : role === 'technician' ? (
        <TechnicianDashboard />
      ) : (
        <CustomerDashboard />
      )}
    </div>
  );
};

export default Dashboard;
