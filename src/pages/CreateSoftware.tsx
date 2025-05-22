
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { softwareApi } from '@/services/api';
import { AccessLevel } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const CreateSoftware = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const availableAccessLevels: { value: AccessLevel; label: string }[] = [
    { value: 'Read', label: 'Read Access' },
    { value: 'Write', label: 'Write Access' },
    { value: 'Admin', label: 'Admin Access' }
  ];

  const handleAccessLevelChange = (value: AccessLevel, checked: boolean) => {
    if (checked) {
      setAccessLevels(prev => [...prev, value]);
    } else {
      setAccessLevels(prev => prev.filter(level => level !== value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || accessLevels.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one access level",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await softwareApi.create({
        name,
        description,
        accessLevels
      });

      toast({
        title: "Success",
        description: "Software has been added to the system",
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error creating software:', error);
      toast({
        title: "Error",
        description: "Failed to create software. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout requiredRole="Admin">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Software</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Software Details</CardTitle>
              <CardDescription>
                Add a new software system to the access management platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Software Name</Label>
                <Input
                  id="name"
                  placeholder="Enter software name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the software and its purpose"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Available Access Levels</Label>
                <div className="space-y-3">
                  {availableAccessLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`level-${level.value}`}
                        checked={accessLevels.includes(level.value)}
                        onCheckedChange={(checked) => 
                          handleAccessLevelChange(level.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`level-${level.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {accessLevels.length === 0 && (
                  <p className="text-sm text-red-500">
                    Please select at least one access level
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !name || !description || accessLevels.length === 0}
              >
                {isSubmitting ? 'Adding Software...' : 'Add Software'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateSoftware;
