
import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { requestApi } from '@/services/api';
import { AccessRequest, RequestStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Search } from 'lucide-react';

type FilterStatus = 'All' | RequestStatus;

const PendingRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await requestApi.getAll();
        setRequests(data);
        setFilteredRequests(data);
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

    fetchRequests();
  }, [toast]);

  useEffect(() => {
    // Apply filters whenever filter state changes
    let result = [...requests];
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        request => 
          request.user?.username.toLowerCase().includes(lowerCaseSearch) ||
          request.software?.name.toLowerCase().includes(lowerCaseSearch) ||
          request.reason.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    setFilteredRequests(result);
  }, [statusFilter, searchTerm, requests]);

  const handleApprove = async (requestId: number) => {
    try {
      const updatedRequest = await requestApi.updateStatus(requestId, 'Approved');
      if (updatedRequest) {
        // Update the list
        setRequests(current => 
          current.map(req => req.id === requestId ? updatedRequest : req)
        );
        
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
        // Update the list
        setRequests(current => 
          current.map(req => req.id === requestId ? updatedRequest : req)
        );
        
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

  return (
    <AppLayout requiredRole="Manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Access Requests</h1>
          <p className="text-muted-foreground">
            Review and manage all software access requests.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Access Requests</CardTitle>
            <CardDescription>
              View and filter all access requests across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, software or reason..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select 
                  value={statusFilter} 
                  onValueChange={(value) => setStatusFilter(value as FilterStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Requests</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">User</th>
                        <th className="px-4 py-3 text-left font-medium">Software</th>
                        <th className="px-4 py-3 text-left font-medium">Access Type</th>
                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3">{request.user?.username}</td>
                          <td className="px-4 py-3">{request.software?.name}</td>
                          <td className="px-4 py-3">{request.accessType}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate">{request.reason}</td>
                          <td className="px-4 py-3">{formatDate(request.createdAt)}</td>
                          <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                          <td className="px-4 py-3">
                            {request.status === 'Pending' ? (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleApprove(request.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleReject(request.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No access requests found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PendingRequests;
