'use client';

import { useState } from 'react';
import { matchTourGuides } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  UserSearch, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Star
} from 'lucide-react';

type MatchingFormData = {
  student_id: string;
  gender: string;
  grade: string;
  residential_status: string;
  city_country: string;
  sports: string;
  extracurricular_activities: string;
  academic_interests: string;
  additional_information: string;
  race: string;
  time_period: string;
};

type MatchResult = {
  student_id: string;
  gender: string;
  grade: string;
  residential_status?: string;
  distance?: number;
  id: string;
};

export default function IndividualMatch() {
  const [formData, setFormData] = useState<MatchingFormData>({
    student_id: '',
    gender: '',
    grade: '9',
    residential_status: 'Boarding',
    city_country: '',
    sports: '',
    extracurricular_activities: '',
    academic_interests: '',
    additional_information: '',
    race: '',
    time_period: ''
  });
  
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'success' | 'warning' | 'error' | ''>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.student_id || !formData.gender || !formData.grade) {
      setStatus('error');
      setMessage('Student ID, Gender, and Grade are required');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('');
      setMessage('');
      setMatches([]);
      
      console.log('Submitting individual match data:', formData);
      const result = await matchTourGuides(formData);
      console.log('Individual match result:', result);
      
      if (result.status === 'success') {
        setMatches(result.matches);
        setStatus('success');
        setMessage(result.message);
      } else if (result.status === 'warning') {
        setStatus('warning');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage('Unknown error occurred during matching');
      }
    } catch (error) {
      console.error('Error in individual matching:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to match tour guides');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to format similarity score as percentage
  const formatSimilarity = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  // Function to format distance score
  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined) return 'N/A';
    // Lower distance means better match, so we convert to a percentage
    // Assuming distance is between 0 and 1, where 0 is perfect match
    const matchPercentage = Math.round((1 - distance) * 100);
    return `${matchPercentage}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Individual Match</h1>
        <p className="text-muted-foreground">
          Enter student information to find the best matching tour guides.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserSearch className="h-5 w-5" />
            Student Information
          </CardTitle>
          <CardDescription>
            Fill out the form below to find matching tour guides based on the student's profile.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="Enter student ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" value={formData.gender} onValueChange={(value) => { setFormData({...formData, gender: value}); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade">Application Grade</Label>
                <Select name="grade" value={formData.grade} onValueChange={(value) => { setFormData({...formData, grade: value}); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">Freshman</SelectItem>
                    <SelectItem value="10">Sophomore</SelectItem>
                    <SelectItem value="11">Junior</SelectItem>
                    <SelectItem value="12">Senior/PG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="residential_status">Residential Status</Label>
                <Select name="residential_status" value={formData.residential_status} onValueChange={(value) => { setFormData({...formData, residential_status: value}); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boarding">Boarding</SelectItem>
                    <SelectItem value="Day Student">Day Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city_country">City/Country</Label>
                <Input
                  type="text"
                  name="city_country"
                  value={formData.city_country}
                  onChange={handleChange}
                  placeholder="Enter city/country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sports">Sports</Label>
                <Input
                  type="text"
                  name="sports"
                  value={formData.sports}
                  onChange={handleChange}
                  placeholder="Enter sports"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extracurricular_activities">Extracurricular Activities</Label>
                <Input
                  type="text"
                  name="extracurricular_activities"
                  value={formData.extracurricular_activities}
                  onChange={handleChange}
                  placeholder="Enter extracurricular activities"
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="academic_interests">Academic Interests</Label>
                <Input
                  type="text"
                  name="academic_interests"
                  value={formData.academic_interests}
                  onChange={handleChange}
                  placeholder="Enter academic interests"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional_information">Additional Information</Label>
                <Input
                  type="text"
                  name="additional_information"
                  value={formData.additional_information}
                  onChange={handleChange}
                  placeholder="Enter additional information"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="race">Race</Label>
                <Input
                  type="text"
                  name="race"
                  value={formData.race}
                  onChange={handleChange}
                  placeholder="Enter race"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Find Matches
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Results section */}
          {status && (
            <Alert variant={status === 'success' ? 'default' : status === 'warning' ? 'default' : 'destructive'}>
              {status === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status === 'warning' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {matches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Matches
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {matches.map((match, index) => (
                  <Card key={match.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-medium">Match #{index + 1}</span>
                        <Badge variant="secondary">
                          Match Score: {formatDistance(match.distance)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Student ID:</span> {match.student_id}</p>
                        <p><span className="text-muted-foreground">Gender:</span> {match.gender}</p>
                        <p><span className="text-muted-foreground">Grade:</span> {match.grade}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 