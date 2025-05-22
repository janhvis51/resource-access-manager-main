
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo credentials
  const demoUsers = [
    { role: 'Employee', username: 'employee', password: 'password' },
    { role: 'Manager', username: 'manager', password: 'password' },
    { role: 'Admin', username: 'admin', password: 'password' }
  ];

  const loginAsDemoUser = (demoUser: typeof demoUsers[0]) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Access Manager</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      
        <div className="mt-8">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
            Demo Accounts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {demoUsers.map((demoUser) => (
              <Button
                key={demoUser.role}
                variant="outline"
                size="sm"
                onClick={() => loginAsDemoUser(demoUser)}
                className="text-xs"
              >
                Login as {demoUser.role}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
