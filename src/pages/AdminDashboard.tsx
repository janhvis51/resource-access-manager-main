
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { softwareApi, requestApi, userApi } from '@/services/api';
import { Software, AccessRequest, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Users, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const [software, setSoftware] = useState<Software[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [softwareData, requestsData, usersData] = await Promise.all([
          softwareApi.getAll(),
          requestApi.getAll(),
          userApi.getAll()
        ]);
        
        setSoftware(softwareData);
        setRequests(requestsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Analytics calculations
  const totalSoftware = software.length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;
  
  const totalUsers = users.length;
  const employeeCount = users.filter(u => u.role === 'Employee').length;
  const managerCount = users.filter(u => u.role === 'Manager').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;

  const pendingPercentage = totalRequests > 0 
    ? Math.round((pendingRequests / totalRequests) * 100) 
    : 0;
  
  const approvedPercentage = totalRequests > 0
    ? Math.round((approvedRequests / totalRequests) * 100)
    : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="Admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management for administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Software</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSoftware}</div>
              <p className="text-xs text-muted-foreground">Available in system</p>
              <Button asChild variant="link" className="px-0 h-auto" size="sm">
                <Link to="/create-software">+ Add New</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{employeeCount} Employees</p>
                <p>{managerCount} Managers</p>
                <p>{adminCount} Admins</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-400 rounded-full mr-1"></span>
                  {pendingRequests} Pending ({pendingPercentage}%)
                </p>
                <p className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                  {approvedRequests} Approved ({approvedPercentage}%)
                </p>
                <p className="flex items-center">
                  <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                  {rejectedRequests} Rejected
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start" 
                  asChild
                >
                  <Link to="/create-software">
                    <Database className="mr-2 h-4 w-4" />
                    Add Software
                  </Link>
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start" 
                  asChild
                >
                  <Link to="/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Software</CardTitle>
              <CardDescription>Recently added software systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {software.slice(0, 5).map(sw => (
                  <div key={sw.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                    <div className="mr-4 mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{sw.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{sw.description}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sw.accessLevels.map(level => (
                          <span 
                            key={level} 
                            className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {software.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No software registered yet</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link to="/create-software">Add your first software</Link>
                    </Button>
                  </div>
                )}
                
                {software.length > 0 && (
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/create-software">
                      Add New Software
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Latest access requests across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.slice(0, 5).map(request => (
                  <div key={request.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">
                        {request.user?.username} → {request.software?.name}
                      </h4>
                      {request.status === 'Pending' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      ) : request.status === 'Approved' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Rejected
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Access type: </span>
                      {request.accessType}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      "{request.reason.length > 50 ? request.reason.substring(0, 50) + '...' : request.reason}"
                    </div>
                    
                    {request.status === 'Pending' && (
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs p-0 h-7 px-2">
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs p-0 h-7 px-2">
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {requests.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No access requests yet</p>
                  </div>
                )}
                
                {requests.length > 0 && (
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/pending-requests">
                      View All Requests
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
