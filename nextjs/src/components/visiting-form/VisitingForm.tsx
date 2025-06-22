'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  UserPlus, 
  Loader2,
  GraduationCap,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type VisitingStudentForm = {
  school: string;
  name: string;
  email: string;
  gender: string;
  grade: string;
  residential_status: string;
  city_country: string;
  sports: string;
  extracurricular_activities: string;
  academic_interests: string;
  additional_information: string;
  race: string;
  tour_datetime: string;
};

export default function VisitingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<VisitingStudentForm>({
    school: '',
    name: '',
    email: '',
    gender: '',
    grade: '',
    residential_status: '',
    city_country: '',
    sports: '',
    extracurricular_activities: '',
    academic_interests: '',
    additional_information: '',
    race: '',
    tour_datetime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    // Validate required fields
    const requiredFields = ['school','name', 'email', 'gender', 'grade', 'tour_datetime'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof VisitingStudentForm]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/visiting-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        setError(errorData.detail || 'Failed to submit form');
        setIsSubmitting(false);
        return;
      }
  
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Visiting Student Registration
        </CardTitle>
        <CardDescription>
          Please fill out this form to register for a campus tour. We'll match you with the perfect tour guide based on your interests and background.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {success ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Registration successful! Redirecting you to the homepage...
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select name="school" value={formData.school} onValueChange={(value) => { setFormData({...formData, school: value}); }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="310680">Lawrenceville</SelectItem>
                    <SelectItem value="311265">PDS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tour_datetime">Tour Date & Time</Label>
                <Input
                  type="datetime-local"
                  name="tour_datetime"
                  value={formData.tour_datetime}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" value={formData.gender} onValueChange={(value) => { setFormData({...formData, gender: value}); }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select name="grade" value={formData.grade} onValueChange={(value) => { setFormData({...formData, grade: value}); }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">Freshman</SelectItem>
                    <SelectItem value="10">Sophomore</SelectItem>
                    <SelectItem value="11">Junior</SelectItem>
                    <SelectItem value="12">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="residential_status">Residential Status</Label>
                <Select name="residential_status" value={formData.residential_status} onValueChange={(value) => { setFormData({...formData, residential_status: value}); }} required>
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
                  placeholder="e.g., New York, USA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sports">Sports Interests</Label>
                <Input
                  type="text"
                  name="sports"
                  value={formData.sports}
                  onChange={handleChange}
                  placeholder="e.g., Soccer, Basketball, Swimming"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extracurricular_activities">Extracurricular Activities</Label>
                <Input
                  type="text"
                  name="extracurricular_activities"
                  value={formData.extracurricular_activities}
                  onChange={handleChange}
                  placeholder="e.g., Debate Club, Student Government"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academic_interests">Academic Interests</Label>
                <Input
                  type="text"
                  name="academic_interests"
                  value={formData.academic_interests}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Biology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="race">Race/Ethnicity</Label>
                <Input
                  type="text"
                  name="race"
                  value={formData.race}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="additional_information">Additional Information</Label>
                <Input
                  type="text"
                  name="additional_information"
                  value={formData.additional_information}
                  onChange={handleChange}
                  placeholder="Anything else you'd like us to know?"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    Register for Tour
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 