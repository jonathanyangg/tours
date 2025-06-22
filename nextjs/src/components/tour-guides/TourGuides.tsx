'use client';

import { useState, useEffect } from 'react';
import { getTourGuides } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Users, 
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TourGuide = {
  student_id: string;
  residential_status: string;
  gender: string;
  grade: string;
};

export default function TourGuides() {
  const [students, setStudents] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TourGuide>('student_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getTourGuides();
        setStudents(response.students || []);
        setStatus(response.status);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch student information');
        setError(error.message);
        setStudents([]);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSort = (field: keyof TourGuide) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredStudents = sortedStudents.filter(student => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_id.toLowerCase().includes(searchLower) ||
      student.residential_status.toLowerCase().includes(searchLower) ||
      student.gender.toLowerCase().includes(searchLower) ||
      student.grade.toString().includes(searchLower)
    );
  });

  const renderSortIcon = (field: keyof TourGuide) => {
    if (field !== sortField) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'residential':
        return 'default';
      case 'commuter':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getGradeBadgeColor = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum <= 2) return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    if (gradeNum <= 4) return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    return 'bg-green-100 text-green-800 hover:bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tour Guides</h1>
        <p className="text-muted-foreground">
          View and manage all available tour guides in the system.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Tour Guides
              </CardTitle>
              <CardDescription>
                Browse and search through the tour guide database.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'guide' : 'guides'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tour guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading tour guides...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Error Loading Data</div>
                  <div className="text-sm">{error}</div>
                </div>
              </AlertDescription>
            </Alert>
          ) : status === 'empty' || students.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tour guides available</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                The tour guide database is currently empty. Please upload a CSV file to populate the database.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('student_id')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Student ID</span>
                        {renderSortIcon('student_id')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('residential_status')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Residential Status</span>
                        {renderSortIcon('residential_status')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('gender')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Gender</span>
                        {renderSortIcon('gender')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('grade')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Grade</span>
                        {renderSortIcon('grade')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={index} className="group">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">
                              {student.student_id.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.student_id}</span>
                        </div>
                      </TableCell>
                                             <TableCell>
                         <span className="text-sm text-muted-foreground">{student.residential_status}</span>
                       </TableCell>
                       <TableCell>
                         <span className="text-sm text-muted-foreground">{student.gender}</span>
                       </TableCell>
                       <TableCell>
                         <span className="text-sm text-muted-foreground">Grade {student.grade}</span>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 