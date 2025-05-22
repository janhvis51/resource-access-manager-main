
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      navigate('/login');
    } else {
      // Redirect based on user role
      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'Manager') {
        navigate('/manager');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="h-12 w-12 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Index;
