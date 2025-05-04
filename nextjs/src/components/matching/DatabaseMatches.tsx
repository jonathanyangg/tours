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
      setVisitingStudents([]); // Clear the students list on error
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
        student_id: student.email, // Using email as ID
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
      
      // Remove the student from the list
      setVisitingStudents(prev => prev.filter(student => student.email !== studentEmail));
      
      // Show success message
      setMatchMessages(prev => ({
        ...prev,
        [studentEmail]: 'Successfully matched with tour guide!'
      }));
      
      // Hide the matches after a short delay
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
    // If both search query and date range are empty, show all students
    if (!searchQuery.trim() && !startDate && !endDate) return true;
    
    // Text search (name or email)
    if (searchType === 'text' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesText = 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);
      
      // If date range is also set, check both conditions
      if (startDate || endDate) {
        return matchesText && isInDateRange(student.tour_datetime);
      }
      
      return matchesText;
    }
    
    // Date range search
    if (searchType === 'date' && (startDate || endDate)) {
      return isInDateRange(student.tour_datetime);
    }
    
    return true;
  });

  const handleMatchAll = async () => {
    setIsMatchingAll(true);
    try {
      // Process each student sequentially to avoid overwhelming the server
      for (const student of filteredStudents) {
        try {
          // First, get the matches for the student
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
            // Get the best match (first one has the highest score)
            const bestMatch = result.matches[0];
            
            // Automatically choose the best match
            await handleChooseMatch(student.email, bestMatch.student_id);
            
            // Show success message
            toast.success(`Matched ${student.name} with best tour guide`);
          } else {
            toast.error(`No matches found for ${student.name}`);
          }
        } catch (err) {
          console.error(`Error matching student ${student.name}:`, err);
          toast.error(`Failed to match ${student.name}`);
        }
      }
      
      // Refresh the list after all matches are processed
      await fetchVisitingStudents();
    } catch (err) {
      console.error('Error in match all process:', err);
      toast.error('An error occurred while matching all students');
    } finally {
      setIsMatchingAll(false);
    }
  };

  return (
    <div className="card bg-white shadow-md border border-base-300 mb-8">
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-normal text-base-content">Find Matches from Database</h2>
          <button 
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="loading loading-spinner loading-xs mr-2"></span>
                Refreshing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-base-content/70 mb-6">Connect to the visiting students database and find optimal tour guide matches.</p>
        
        <div className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-base-content/80 font-normal">Search Criteria</span>
            </label>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <button 
                    className={`btn ${searchType === 'text' ? 'bg-base-300 text-base-content' : 'btn-ghost'} flex items-center gap-2 transition-all duration-200 hover:scale-105`}
                    onClick={() => setSearchType('text')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Name/Email Search
                  </button>
                  <button 
                    className={`btn ${searchType === 'date' ? 'bg-base-300 text-base-content' : 'btn-ghost'} flex items-center gap-2 transition-all duration-200 hover:scale-105`}
                    onClick={() => setSearchType('date')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date Range Search
                  </button>
                </div>
              </div>
              
              {searchType === 'text' ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="input input-bordered flex-1 bg-base-100 border-base-300 text-base-content placeholder:text-base-content/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="input input-bordered bg-base-100 border-base-300 text-base-content flex-1"
                      placeholderText="Start date"
                      dateFormat="MM/dd/yy"
                    />
                    <span className="text-base-content/50 px-1">to</span>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate || undefined}
                        className="input input-bordered bg-base-100 border-base-300 text-base-content flex-1"
                        placeholderText="End date"
                        dateFormat="MM/dd/yy"
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="p-4 bg-error/20 text-error-content rounded-md">
              <h3 className="font-medium mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-4 bg-base-100 text-base-content/70 rounded-md">
              <p>No pending matches</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="font-medium">Name</th>
                    <th className="font-medium">Email</th>
                    <th className="font-medium">Tour Date</th>
                    <th className="font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <React.Fragment key={index}>
                      <tr className="hover">
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{new Date(student.tour_datetime).toLocaleString()}</td>
                        <td>
                          <div className="flex justify-between gap-2">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleMatch(student)}
                              disabled={matchingStudent === student.email}
                            >
                              {matchingStudent === student.email ? (
                                <>
                                  <span className="loading loading-spinner loading-xs mr-2"></span>
                                  Matching...
                                </>
                              ) : (
                                'Match'
                              )}
                            </button>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() => handleDeleteStudent(student.email)}
                              disabled={isDeleting === student.email}
                            >
                              {isDeleting === student.email ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedStudents.has(student.email) && (
                        <tr>
                          <td colSpan={4} className="p-4 bg-base-100">
                            {matchStatuses[student.email] === 'error' ? (
                              <div className="p-4 bg-error/20 text-error-content rounded-md">
                                <p>{matchMessages[student.email]}</p>
                              </div>
                            ) : matchStatuses[student.email] === 'warning' ? (
                              <div className="p-4 bg-warning/20 text-warning-content rounded-md">
                                <p>{matchMessages[student.email]}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {studentMatches[student.email]?.map((match, matchIndex) => (
                                  <div key={match.id} className="p-4 bg-base-100 rounded-lg border border-base-300">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium text-base-content">Tour Guide {matchIndex + 1}</h4>
                                        <p className="text-base-content/70">ID: {match.student_id}</p>
                                        <p className="text-base-content/70">Grade: {match.grade}</p>
                                        <p className="text-base-content/70">Gender: {match.gender}</p>
                                        <p className="text-base-content/70">Residential Status: {match.residential_status}</p>
                                      </div>
                                      <div className="text-right space-y-2">
                                        <p className="text-success font-medium">Match Score: {formatSimilarity(1 - (match.distance || 0))}</p>
                                        <button
                                          className="btn btn-primary"
                                          onClick={() => handleChooseMatch(student.email, match.student_id)}
                                          disabled={choosingMatch?.studentId === student.email && choosingMatch?.guideId === match.student_id}
                                        >
                                          {choosingMatch?.studentId === student.email && choosingMatch?.guideId === match.student_id ? (
                                            <>
                                              <span className="loading loading-spinner loading-xs mr-2"></span>
                                              Matching...
                                            </>
                                          ) : (
                                            'Choose Match'
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex justify-end">
                              <button 
                                className="btn btn-ghost"
                                onClick={() => toggleExpanded(student.email)}
                              >
                                {expandedStudents.has(student.email) ? 'Hide Matches' : 'Show Matches'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              className="btn btn-primary"
              onClick={handleMatchAll}
              disabled={isMatchingAll}
            >
              {isMatchingAll ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                  Matching All...
                </>
              ) : (
                'Match All'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 