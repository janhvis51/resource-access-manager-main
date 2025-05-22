
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  requiredRole?: 'Employee' | 'Manager' | 'Admin' | 'Any';
}

const AppLayout = ({ children, requiredRole = 'Any' }: AppLayoutProps) => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for role permissions
  if (requiredRole !== 'Any') {
    if (
      requiredRole === 'Admin' && user.role !== 'Admin' ||
      requiredRole === 'Manager' && user.role !== 'Manager' && user.role !== 'Admin' ||
      requiredRole === 'Employee' && user.role !== 'Employee' && user.role !== 'Manager' && user.role !== 'Admin'
    ) {
      // Redirect based on user's role
      if (user.role === 'Employee') {
        return <Navigate to="/dashboard" replace />;
      } else if (user.role === 'Manager') {
        return <Navigate to="/pending-requests" replace />;
      } else if (user.role === 'Admin') {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
        <footer className="py-4 px-6 border-t bg-background">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Access Manager. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
