
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { requestApi } from '@/services/api';
import { AccessRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X, AlertCircle } from 'lucide-react';

const ManagerDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [recentlyApproved, setRecentlyApproved] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await requestApi.getAll();
        
        // Filter pending and recently approved requests
        const pending = requests.filter(r => r.status === 'Pending');
        const approved = requests
          .filter(r => r.status === 'Approved' || r.status === 'Rejected')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setPendingRequests(pending);
        setRecentlyApproved(approved);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Error",
          description: "Failed to load access requests",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const handleApprove = async (requestId: number) => {
    try {
      const updatedRequest = await requestApi.updateStatus(requestId, 'Approved');
      if (updatedRequest) {
        // Update the lists
        setPendingRequests(current => current.filter(r => r.id !== requestId));
        setRecentlyApproved(current => [updatedRequest, ...current].slice(0, 5));
        
        toast({
          title: "Success",
          description: "Request has been approved",
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve the request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const updatedRequest = await requestApi.updateStatus(requestId, 'Rejected');
      if (updatedRequest) {
        // Update the lists
        setPendingRequests(current => current.filter(r => r.id !== requestId));
        setRecentlyApproved(current => [updatedRequest, ...current].slice(0, 5));
        
        toast({
          title: "Success",
          description: "Request has been rejected",
        });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject the request",
        variant: "destructive"
      });
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
    <AppLayout requiredRole="Manager">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Review and manage software access requests from your team members.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Approval</CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {pendingRequests.length} Pending
                </span>
              </div>
              <CardDescription>Access requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-6">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{request.software?.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p><span className="font-medium">User:</span> {request.user?.username}</p>
                        <p><span className="font-medium">Access:</span> {request.accessType}</p>
                        <p className="text-sm mt-1">"{request.reason}"</p>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleApprove(request.id)}
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Decisions</CardTitle>
              <CardDescription>Recently approved or rejected access requests</CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyApproved.length > 0 ? (
                <div className="space-y-4">
                  {recentlyApproved.map((request) => (
                    <div key={request.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-semibold">{request.software?.name}</h3>
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>
                          <span className="text-muted-foreground mr-1">Requested by:</span>
                          {request.user?.username}
                        </p>
                        <p>
                          <span className="text-muted-foreground mr-1">Access level:</span>
                          {request.accessType}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Processed on {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent decisions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button asChild>
            <Link to="/pending-requests">View All Requests</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;
