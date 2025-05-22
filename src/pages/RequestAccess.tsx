
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { softwareApi, requestApi } from '../services/api';
import { Software, AccessLevel } from '../types';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const RequestAccess = () => {
  const [software, setSoftware] = useState<Software[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string>('');
  const [selectedAccessType, setSelectedAccessType] = useState<AccessLevel | ''>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get available access levels for the selected software
  const getAvailableAccessLevels = () => {
    if (!selectedSoftwareId) return [];
    const selected = software.find(s => s.id === parseInt(selectedSoftwareId));
    return selected ? selected.accessLevels : [];
  };

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const data = await softwareApi.getAll();
        setSoftware(data);
      } catch (error) {
        console.error('Error fetching software:', error);
        toast({
          title: "Error",
          description: "Failed to load available software",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoftware();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSoftwareId || !selectedAccessType || !reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to request access",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await requestApi.create({
        userId: user.id,
        softwareId: parseInt(selectedSoftwareId),
        accessType: selectedAccessType as AccessLevel,
        reason
      });

      toast({
        title: "Request Submitted",
        description: "Your access request has been submitted for approval",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout requiredRole="Employee">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Request Software Access</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Access Request Form</CardTitle>
              <CardDescription>
                Request access to software systems based on your job requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="software">Software</Label>
                <Select 
                  value={selectedSoftwareId} 
                  onValueChange={setSelectedSoftwareId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select software" />
                  </SelectTrigger>
                  <SelectContent>
                    {software.map((sw) => (
                      <SelectItem key={sw.id} value={sw.id.toString()}>
                        {sw.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="access-type">Access Type</Label>
                <Select 
                  value={selectedAccessType} 
                  onValueChange={(value) => setSelectedAccessType(value as AccessLevel)}
                  disabled={!selectedSoftwareId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableAccessLevels().map((level) => (
                      <SelectItem key={level} value={level}>
                        {level} Access
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Business Justification</Label>
                <Textarea 
                  id="reason"
                  placeholder="Please explain why you need access to this software"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoading || !selectedSoftwareId || !selectedAccessType || !reason}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RequestAccess;
