
import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { userApi } from '@/services/api';
import { User, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Search, User as UserIcon, Shield, Users as UsersIcon } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userApi.getAll();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  useEffect(() => {
    // Apply filters whenever filter state changes
    let result = [...users];
    
    // Apply role filter
    if (roleFilter !== 'All') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        user => user.username.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    setFilteredUsers(result);
  }, [roleFilter, searchTerm, users]);

  // Role icon mapping
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'Manager':
        return <UsersIcon className="h-4 w-4 text-blue-500" />;
      case 'Employee':
        return <UserIcon className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Role badge styling
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">Admin</span>;
      case 'Manager':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Manager</span>;
      case 'Employee':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Employee</span>;
      default:
        return null;
    }
  };

  return (
    <AppLayout requiredRole="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users in the system.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>
              All registered users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select 
                  value={roleFilter} 
                  onValueChange={(value) => setRoleFilter(value as 'All' | UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    <SelectItem value="Admin">Admins</SelectItem>
                    <SelectItem value="Manager">Managers</SelectItem>
                    <SelectItem value="Employee">Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">User</th>
                        <th className="px-4 py-3 text-left font-medium">Username</th>
                        <th className="px-4 py-3 text-left font-medium">User ID</th>
                        <th className="px-4 py-3 text-left font-medium">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{user.username}</td>
                          <td className="px-4 py-3 text-muted-foreground">#{user.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <span>{getRoleBadge(user.role)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              Total: {filteredUsers.length} users (of {users.length})
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Users;
