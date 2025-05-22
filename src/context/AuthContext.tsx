
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { userApi } from '../services/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// TODO: Replace with actual TypeORM and PostgreSQL backend
// Example AuthService with TypeORM:
// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(UserEntity)
//     private userRepository: Repository<UserEntity>,
//   ) {}
//
//   async validateUser(username: string, password: string): Promise<any> {
//     const user = await this.userRepository.findOne({ where: { username } });
//     if (user && await bcrypt.compare(password, user.password)) {
//       const { password, ...result } = user;
//       return result;
//     }
//     return null;
//   }
// }

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user info in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Try to use Supabase, fall back to mock API if not available
      // Note: In a real app with Supabase, you would use Supabase Auth directly
      // This is just a simplified implementation for demo purposes
      try {
        // Check if supabase is properly configured
        if (!isSupabaseConfigured()) {
          console.warn('Supabase client is not properly configured, falling back to mock API');
          throw new Error('Supabase not configured');
        }

        // For demonstration purposes, we'll check if the user exists in the 'users' table
        // and validate with the provided password
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
          
        if (error) {
          console.log('Supabase query error:', error);
          throw error;
        }
        
        // In a real app, you would never store plain text passwords
        // This is just for demonstration purposes
        // The mock system allows any password for the demo users
        if (data) {
          // For demo accounts (employee, manager, admin), accept "password" as the password
          if (['employee', 'manager', 'admin'].includes(data.username) && password === 'password') {
            const validatedUser = {
              id: data.id,
              username: data.username,
              role: data.role as UserRole
            };
            
            setUser(validatedUser);
            localStorage.setItem('user', JSON.stringify(validatedUser));
            return true;
          }
          
          // For all other users, just accept any password in this demo
          // In a real app, you would use proper password hashing and comparison
          // Check if the entered password matches what we have (simple equality for demo)
          if (password === data.password) {
            const validatedUser = {
              id: data.id,
              username: data.username,
              role: data.role as UserRole
            };
            
            setUser(validatedUser);
            localStorage.setItem('user', JSON.stringify(validatedUser));
            return true;
          }
        }
        
        console.log('Invalid credentials for user:', username);
        throw new Error('Invalid credentials');
      } catch (supabaseError) {
        console.log('Supabase auth failed, using mock auth:', supabaseError);
        
        // Fall back to mock API if Supabase is not available
        // Check if the user is one of our hard-coded users
        const demoUsers = [
          { username: 'employee', password: 'password', role: 'Employee' as UserRole },
          { username: 'manager', password: 'password', role: 'Manager' as UserRole },
          { username: 'admin', password: 'password', role: 'Admin' as UserRole },
          { username: '2101640100151', password: '12345678', role: 'Manager' as UserRole }, // Add your user here for mock data
        ];
        
        const mockUser = demoUsers.find(
          user => user.username === username && user.password === password
        );
        
        if (mockUser) {
          const validatedUser = {
            id: demoUsers.indexOf(mockUser) + 1,
            username: mockUser.username,
            role: mockUser.role
          };
          
          setUser(validatedUser);
          localStorage.setItem('user', JSON.stringify(validatedUser));
          return true;
        }
        
        // Try the mock API as a last resort
        const validatedUser = await userApi.validateCredentials(username, password);
        
        if (!validatedUser) {
          throw new Error('Invalid credentials');
        }
        
        // Save user to state and localStorage
        setUser(validatedUser);
        localStorage.setItem('user', JSON.stringify(validatedUser));
        
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, role: UserRole = 'Employee'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simple validation
      if (!username || !password) {
        throw new Error('Username and password are required');
      }
      
      // Try to use Supabase, fall back to mock API if not available
      // Note: In a real app with Supabase, you would use Supabase Auth directly
      try {
        if (!isSupabaseConfigured()) {
          console.warn('Supabase client is not properly configured, falling back to mock API');
          throw new Error('Supabase not configured');
        }

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
          
        if (existingUser) {
          throw new Error('Username already exists');
        }
        
        // Create new user - in a real app, you would never store passwords in plain text
        // This is just for demonstration purposes
        const { data, error } = await supabase
          .from('users')
          .insert({
            username,
            role,
            password, // For demo only - in real app use Supabase Auth
          })
          .select()
          .single();
          
        if (error) throw error;
        
        const newUser = {
          id: data.id,
          username: data.username,
          role: data.role as UserRole
        };
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return true;
      } catch (supabaseError) {
        console.log('Supabase registration failed, using mock API:', supabaseError);
        
        // Fall back to mock API if Supabase is not available
        const newUser = await userApi.create({
          username,
          role,
          password, // Adding password for mock API
        });
        
        // Save user to state and localStorage
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // In a real app with Supabase Auth, you would call supabase.auth.signOut()
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
