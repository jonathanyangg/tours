'use client';

import React, { useState, useEffect } from 'react';
import { getMatchedStudents, unmatchStudent } from '@/services/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  UserCheck, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchedStudent {
  name: string;
  email: string;
  gender: string;
  grade: string;
  residential_status: string;
  city_country: string;
  sports: string[];
  extracurricular_activities: string[];
  academic_interests: string[];
  additional_information: string;
  race: string;
  tour_datetime: string;
  is_matched: boolean;
  matched_tour_guide: string;
  matched_tour_guide_name?: string;
}

export default function RecentMatches() {
  const [matchedStudents, setMatchedStudents] = useState<MatchedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unmatchingStudent, setUnmatchingStudent] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMatchedStudents();
  }, []);

  const fetchMatchedStudents = async () => {
    try {
      setLoading(true);
      const response = await getMatchedStudents();
      if (response.status === 'success') {
        setMatchedStudents(response.students || []);
      } else {
        setError('Failed to fetch matched students');
      }
    } catch (err) {
      console.error('Error fetching matched students:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMatchedStudents();
      toast.success('Recent matches refreshed');
    } catch (err) {
      console.error('Error refreshing matched students:', err);
      toast.error('Failed to refresh matches');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnmatchStudent = async (email: string) => {
    if (!confirm(`Are you sure you want to unmatch this student? They will be moved back to the unmatched list.`)) {
      return;
    }
    
    setUnmatchingStudent(email);
    try {
      const response = await unmatchStudent(email);
      if (response.status === 'success') {
        toast.success('Student unmatched successfully');
        setMatchedStudents(prev => prev.filter(student => student.email !== email));
      } else {
        toast.error('Failed to unmatch student');
      }
    } catch (err) {
      console.error('Error unmatching student:', err);
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUnmatchingStudent(null);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recent Matches
            </CardTitle>
            <CardDescription>
              View and manage recently matched students with their assigned tour guides.
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

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : matchedStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No matched students found</p>
            <p className="text-sm mt-1">Matched students will appear here once tours are assigned</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {matchedStudents.length} matched student{matchedStudents.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Matches Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Tour Guide</TableHead>
                    <TableHead>Tour Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchedStudents.map((student, index) => (
                    <TableRow key={index} className="group">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {student.matched_tour_guide_name || 'Tour Guide'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {student.matched_tour_guide}
                          </div>
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
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Confirmed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUnmatchStudent(student.email)}
                          disabled={unmatchingStudent === student.email}
                          className="flex items-center gap-2"
                        >
                          {unmatchingStudent === student.email ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Moving...
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4" />
                              Unmatch
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 