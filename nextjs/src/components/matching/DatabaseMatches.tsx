'use client';

import React, { useState, useEffect } from 'react';
import { 
  matchTourGuidesFromDatabase, 
  updateStudentMatch, 
  getUnmatchedStudents,
  deleteVisitingStudent 
} from '@/services/api';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '@/app/supabase/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Calendar, 
  RefreshCw, 
  Users, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  UserCheck,
  AlertCircle,

} from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom styles for the date picker to match shadcn theme
const datePickerStyles = `
  .react-datepicker {
    font-family: inherit;
    border-radius: 0.5rem;
    border: 1px solid hsl(var(--border));
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: hsl(var(--popover));
  }
  .react-datepicker__header {
    background-color: hsl(var(--muted));
    border-bottom: 1px solid hsl(var(--border));
  }
  .react-datepicker__current-month,
  .react-datepicker-time__header,
  .react-datepicker-year-header {
    color: hsl(var(--foreground));
    font-weight: 500;
  }
  .react-datepicker__day-name,
  .react-datepicker__day,
  .react-datepicker__time-name {
    color: hsl(var(--foreground));
  }
  .react-datepicker__day:hover {
    background-color: hsl(var(--accent));
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }
  .react-datepicker__day--keyboard-selected {
    background-color: hsl(var(--primary) / 50%);
  }
  .react-datepicker__input-container input {
    font-size: 0.875rem;
  }
`;

type VisitingStudent = {
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

type MatchResult = {
  student_id: string;
  gender: string;
  grade: string;
  residential_status: string;
  distance: number | null;
  id: string;
};

export default function DatabaseMatches() {
  const [visitingStudents, setVisitingStudents] = useState<VisitingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'date'>('text');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [studentMatches, setStudentMatches] = useState<Record<string, MatchResult[]>>({});
  const [matchStatuses, setMatchStatuses] = useState<Record<string, 'success' | 'warning' | 'error' | ''>>({});
  const [matchMessages, setMatchMessages] = useState<Record<string, string>>({});
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [matchingStudent, setMatchingStudent] = useState<string | null>(null);
  const [isMatchingAll, setIsMatchingAll] = useState(false);
  const [choosingMatch, setChoosingMatch] = useState<{studentId: string, guideId: string} | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchVisitingStudents();
    } else {
      setVisitingStudents([]);
    }
  }, [user]);

  // Helper function to check if a date string is within the selected range
  const isInDateRange = (dateString: string): boolean => {
    if (!startDate && !endDate) return true;
    
    const tourDate = new Date(dateString);
    
    if (startDate && endDate) {
      return tourDate >= startDate && tourDate <= endDate;
    } else if (startDate) {
      return tourDate >= startDate;
    } else if (endDate) {
      return tourDate <= endDate;
    }
    
    return true;
  };

  const fetchVisitingStudents = async () => {
    try {
      console.log('Fetching unmatched visiting students from API');
      const data = await getUnmatchedStudents();
      console.log('Success response:', data);
      
      if (data.students) {
        setVisitingStudents(data.students);
        console.log(`Loaded ${data.students.length} unmatched visiting students`);
      } else {
        console.warn('No students array in response:', data);
        setVisitingStudents([]);
      }
    } catch (err) {
      console.error('Error fetching visiting students:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVisitingStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVisitingStudents();
      toast.success('Unmatched students refreshed');
    } catch (err) {
      console.error('Error refreshing unmatched students:', err);
      toast.error('Failed to refresh unmatched students');
    } finally {
      setRefreshing(false);
    }
  };

  const handleMatch = async (student: VisitingStudent) => {
    setMatchingStudent(student.email);
    try {
      console.log('Matching student with details:', {
        name: student.name,
        email: student.email,
        gender: student.gender,
        grade: student.grade,
        residential_status: student.residential_status,
        tour_datetime: student.tour_datetime
      });
      
      const matchData = {
        student_id: student.email,
        gender: student.gender,
        grade: student.grade,
        residential_status: student.residential_status,
        city_country: student.city_country,
        sports: student.sports,
        extracurricular_activities: student.extracurricular_activities,
        academic_interests: student.academic_interests,
        additional_information: student.additional_information,
        race: student.race,
        time_period: student.tour_datetime
      };
      
      console.log('Sending match request with data:', JSON.stringify(matchData, null, 2));

      const result = await matchTourGuidesFromDatabase(matchData);
      console.log('Match result:', JSON.stringify(result, null, 2));
      
      if (result.status === 'success') {
        setStudentMatches(prev => ({
          ...prev,
          [student.email]: result.matches.slice(0, 3)
        }));
        setMatchStatuses(prev => ({
          ...prev,
          [student.email]: 'success'
        }));
        setMatchMessages(prev => ({
          ...prev,
          [student.email]: result.message
        }));
        setExpandedStudents(prev => new Set([...prev, student.email]));
      } else {
        setMatchStatuses(prev => ({
          ...prev,
          [student.email]: 'warning'
        }));
        setMatchMessages(prev => ({
          ...prev,
          [student.email]: result.message
        }));
        setExpandedStudents(prev => new Set([...prev, student.email]));
      }
    } catch (err) {
      console.error('Error matching student:', err);
      setMatchStatuses(prev => ({
        ...prev,
        [student.email]: 'error'
      }));
      setMatchMessages(prev => ({
        ...prev,
        [student.email]: err instanceof Error ? err.message : 'Unknown error'
      }));
      setExpandedStudents(prev => new Set([...prev, student.email]));
    } finally {
      setMatchingStudent(null);
    }
  };

  const handleChooseMatch = async (studentEmail: string, tourGuideId: string) => {
    setChoosingMatch({studentId: studentEmail, guideId: tourGuideId});
    try {
      console.log('Choosing match for student:', studentEmail, 'with tour guide:', tourGuideId);
      await updateStudentMatch(studentEmail, tourGuideId);
      
      setVisitingStudents(prev => prev.filter(student => student.email !== studentEmail));
      
      setMatchMessages(prev => ({
        ...prev,
        [studentEmail]: 'Successfully matched with tour guide!'
      }));
      
      setTimeout(() => {
        setExpandedStudents(prev => {
          const newSet = new Set(prev);
          newSet.delete(studentEmail);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Error choosing match:', err);
      setMatchMessages(prev => ({
        ...prev,
        [studentEmail]: err instanceof Error ? err.message : 'Failed to choose match'
      }));
    } finally {
      setChoosingMatch(null);
    }
  };

  const formatSimilarity = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const toggleExpanded = (studentEmail: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentEmail)) {
        newSet.delete(studentEmail);
      } else {
        newSet.add(studentEmail);
      }
      return newSet;
    });
  };

  const handleDeleteStudent = async (email: string) => {
    const student = visitingStudents.find(s => s.email === email);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete ${student.name} (${email})? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(email);
    try {
      console.log('Attempting to delete student:', email);
      const data = await deleteVisitingStudent(email);
      
      if (data.status === 'success') {
        toast.success(data.message || 'Student deleted successfully');
        setVisitingStudents(prev => prev.filter(student => student.email !== email));
      } else {
        console.error('Delete failed:', data);
        toast.error(data.detail || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('An error occurred while deleting the student');
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter students based on search query and date range
  const filteredStudents = visitingStudents.filter(student => {
    if (!searchQuery.trim() && !startDate && !endDate) return true;
    
    if (searchType === 'text' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesText = 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);
      
      if (startDate || endDate) {
        return matchesText && isInDateRange(student.tour_datetime);
      }
      
      return matchesText;
    }
    
    if (searchType === 'date' && (startDate || endDate)) {
      return isInDateRange(student.tour_datetime);
    }
    
    return true;
  });

  const handleMatchAll = async () => {
    setIsMatchingAll(true);
    try {
      for (const student of filteredStudents) {
        try {
          const matchData = {
            student_id: student.email,
            gender: student.gender,
            grade: student.grade,
            residential_status: student.residential_status,
            city_country: student.city_country,
            sports: student.sports,
            extracurricular_activities: student.extracurricular_activities,
            academic_interests: student.academic_interests,
            additional_information: student.additional_information,
            race: student.race,
            time_period: student.tour_datetime
          };

          const result = await matchTourGuidesFromDatabase(matchData);
          
          if (result.status === 'success' && result.matches.length > 0) {
            const bestMatch = result.matches[0];
            await handleChooseMatch(student.email, bestMatch.student_id);
            toast.success(`Matched ${student.name} with best tour guide`);
          } else {
            toast.error(`No matches found for ${student.name}`);
          }
        } catch (err) {
          console.error(`Error matching student ${student.name}:`, err);
          toast.error(`Failed to match ${student.name}`);
        }
      }
      
      await fetchVisitingStudents();
    } catch (err) {
      console.error('Error in match all process:', err);
      toast.error('An error occurred while matching all students');
    } finally {
      setIsMatchingAll(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Database Matches
            </CardTitle>
            <CardDescription>
              Connect to the visiting students database and find optimal tour guide matches.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('text')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Name/Email
            </Button>
            <Button
              variant={searchType === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('date')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
          
          {searchType === 'text' ? (
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-40">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="Start date"
                  dateFormat="MM/dd/yyyy"
                />
                <style jsx global>{datePickerStyles}</style>
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="w-40">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="End date" 
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending matches found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Students Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visiting Student</TableHead>
                    <TableHead>Tour Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <React.Fragment key={index}>
                      <TableRow className="group">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(student.tour_datetime).toLocaleDateString()}
                            <div className="text-muted-foreground">
                              {new Date(student.tour_datetime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleMatch(student)}
                              disabled={matchingStudent === student.email}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {matchingStudent === student.email ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Matching...
                                </>
                              ) : (
                                'Match'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteStudent(student.email)}
                              disabled={isDeleting === student.email}
                            >
                              {isDeleting === student.email ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                            {(studentMatches[student.email] || matchMessages[student.email]) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleExpanded(student.email)}
                              >
                                {expandedStudents.has(student.email) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Matches */}
                      {expandedStudents.has(student.email) && (
                        <TableRow>
                          <TableCell colSpan={3} className="p-0">
                            <div className="border-t bg-muted/20 p-4">
                              {matchStatuses[student.email] === 'error' ? (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{matchMessages[student.email]}</AlertDescription>
                                </Alert>
                              ) : matchStatuses[student.email] === 'warning' ? (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{matchMessages[student.email]}</AlertDescription>
                                </Alert>
                              ) : (
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm">Potential Matches</h4>
                                  <div className="grid gap-3">
                                    {studentMatches[student.email]?.map((match, matchIndex) => (
                                      <Card key={match.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-2">
                                            <div className="font-medium">Tour Guide {matchIndex + 1}</div>
                                            <div className="text-sm text-muted-foreground">ID: {match.student_id}</div>
                                            <div className="flex gap-4 text-sm">
                                              <Badge variant="outline">Grade {match.grade}</Badge>
                                              <Badge variant="outline">{match.gender}</Badge>
                                              <Badge variant="outline">{match.residential_status}</Badge>
                                            </div>
                                          </div>
                                          <div className="text-right space-y-2">
                                            <div className="text-sm font-medium">
                                              {formatSimilarity(1 - (match.distance || 0))} match
                                            </div>
                                            <Button
                                              size="sm"
                                              onClick={() => handleChooseMatch(student.email, match.student_id)}
                                              disabled={choosingMatch?.studentId === student.email && choosingMatch?.guideId === match.student_id}
                                              className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              {choosingMatch?.studentId === student.email && choosingMatch?.guideId === match.student_id ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                  Matching...
                                                </>
                                              ) : (
                                                'Choose Match'
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Match All Button - Bottom Right */}
            <div className="flex justify-end">
              <Button
                onClick={handleMatchAll}
                disabled={isMatchingAll || filteredStudents.length === 0}
                className="flex items-center gap-2"
              >
                {isMatchingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Matching All...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Match All ({filteredStudents.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 