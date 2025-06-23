'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CheckCircle2, 
  UserPlus, 
  Loader2,
  GraduationCap,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  BookOpen,
  Trophy
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
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateTimeChange = (date: Date | undefined, time: string) => {
    if (date && time) {
      const [hours, minutes] = time.split(':');
      const dateTime = new Date(date);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      
      setFormData(prev => ({
        ...prev,
        tour_datetime: dateTime.toISOString().slice(0, 16)
      }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      handleDateTimeChange(date, selectedTime);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && time) {
      handleDateTimeChange(selectedDate, time);
    }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-8">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
            <GraduationCap className="h-7 w-7 text-primary" />
            Campus Tour Registration
          </CardTitle>
          <CardDescription className="text-base mt-2 max-w-2xl mx-auto">
            Register for a personalized campus tour experience. We'll match you with a tour guide who shares your interests and background.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-12">
              <Alert className="border-green-200 bg-green-50 max-w-md mx-auto">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-700 font-medium">
                  Registration successful! We'll be in touch soon with tour details.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="school" className="text-sm font-medium">School *</Label>
                    <Select name="school" value={formData.school} onValueChange={(value) => { setFormData({...formData, school: value}); }} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your school" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="310680">The Lawrenceville School</SelectItem>
                        <SelectItem value="311265">Princeton Day School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender *</Label>
                    <Select name="gender" value={formData.gender} onValueChange={(value) => { setFormData({...formData, gender: value}); }} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tour Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Tour Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex gap-4 md:col-span-2">
                    <div className="flex flex-col gap-3 flex-1">
                      <Label htmlFor="date-picker" className="text-sm font-medium">
                        Preferred Date *
                      </Label>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date-picker"
                            className="h-11 justify-between font-normal"
                          >
                            {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              handleDateChange(date);
                              setDateOpen(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      <Label htmlFor="time-picker" className="text-sm font-medium">
                        Preferred Time *
                      </Label>
                      <Input
                        type="time"
                        id="time-picker"
                        value={selectedTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="h-11 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">Current Grade *</Label>
                    <Select name="grade" value={formData.grade} onValueChange={(value) => { setFormData({...formData, grade: value}); }} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">9th Grade (Freshman)</SelectItem>
                        <SelectItem value="10">10th Grade (Sophomore)</SelectItem>
                        <SelectItem value="11">11th Grade (Junior)</SelectItem>
                        <SelectItem value="12">12th Grade (Senior)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="residential_status" className="text-sm font-medium">Residential Preference *</Label>
                    <Select name="residential_status" value={formData.residential_status} onValueChange={(value) => { setFormData({...formData, residential_status: value}); }} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Boarding">Boarding Student</SelectItem>
                        <SelectItem value="Day Student">Day Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city_country" className="text-sm font-medium">Location *</Label>
                    <Input
                      type="text"
                      name="city_country"
                      value={formData.city_country}
                      onChange={handleChange}
                      placeholder="e.g., New York, USA"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="race" className="text-sm font-medium">Race/Ethnicity</Label>
                    <Input
                      type="text"
                      name="race"
                      value={formData.race}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Interests Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Interests & Activities</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sports" className="text-sm font-medium">Sports Interests</Label>
                    <Input
                      type="text"
                      name="sports"
                      value={formData.sports}
                      onChange={handleChange}
                      placeholder="e.g., Soccer, Basketball, Swimming"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extracurricular_activities" className="text-sm font-medium">Extracurricular Activities</Label>
                    <Input
                      type="text"
                      name="extracurricular_activities"
                      value={formData.extracurricular_activities}
                      onChange={handleChange}
                      placeholder="e.g., Debate Club, Student Government"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="academic_interests" className="text-sm font-medium">Academic Interests</Label>
                    <Input
                      type="text"
                      name="academic_interests"
                      value={formData.academic_interests}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science, Biology, Literature"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="additional_information" className="text-sm font-medium">Additional Information</Label>
                    <Input
                      type="text"
                      name="additional_information"
                      value={formData.additional_information}
                      onChange={handleChange}
                      placeholder="Anything else you'd like us to know to help match you with the perfect tour guide?"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="h-12 px-8 text-base font-medium min-w-[200px]"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Register for Tour
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 