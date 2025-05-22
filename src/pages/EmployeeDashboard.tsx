
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requestApi, softwareApi } from '@/services/api';
import { AccessRequest, Software } from '@/types';
import { Link } from 'react-router-dom';
import { Database, Check, X } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const userRequests = await requestApi.getByUser(user.id);
          const availableSoftware = await softwareApi.getAll();
          
          setRequests(userRequests);
          setSoftware(availableSoftware);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Count request statuses
  const pendingCount = requests.filter(req => req.status === 'Pending').length;
  const approvedCount = requests.filter(req => req.status === 'Approved').length;
  const rejectedCount = requests.filter(req => req.status === 'Rejected').length;

  // Get recently requested software
  const recentRequests = [...requests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'Rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
    <AppLayout requiredRole="Employee">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}. Manage your software access requests.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <div className="h-4 w-4 rounded-full bg-yellow-400 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
              <div className="h-4 w-4 rounded-full bg-red-500 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{request.software?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {request.accessType} Access · {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div>{getStatusBadge(request.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  No requests found. Make your first request!
                </p>
              )}
              
              <div className="mt-4">
                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                  <Link to="/request-access">
                    Make New Request
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Available Software</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {software.slice(0, 4).map((sw) => (
                  <div key={sw.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{sw.name}</h4>
                        <p className="text-sm line-clamp-2 text-muted-foreground">
                          {sw.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboard;
