'use client';

import React, { useState, useEffect } from 'react';
import { matchTourGuidesFromDatabase } from '@/services/api';

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
  const [studentMatches, setStudentMatches] = useState<Record<string, MatchResult[]>>({});
  const [matchStatuses, setMatchStatuses] = useState<Record<string, 'success' | 'warning' | 'error' | ''>>({});
  const [matchMessages, setMatchMessages] = useState<Record<string, string>>({});
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchVisitingStudents();
  }, []);

  const fetchVisitingStudents = async () => {
    try {
      console.log('Fetching visiting students from API');
      const response = await fetch('/api/visiting-students');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch visiting students');
      }
      
      const data = await response.json();
      console.log('Success response:', data);
      
      if (data.students) {
        setVisitingStudents(data.students);
        console.log(`Loaded ${data.students.length} visiting students`);
      } else {
        console.warn('No students array in response:', data);
        setVisitingStudents([]);
      }
    } catch (err) {
      console.error('Error fetching visiting students:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (student: VisitingStudent) => {
    try {
      console.log('Matching student:', student);
      
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
      
      console.log('Match data:', matchData);

      const result = await matchTourGuidesFromDatabase(matchData);
      console.log('Match result:', result);
      
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

  const filteredStudents = visitingStudents.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.tour_datetime.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="card bg-white shadow-md border border-base-300 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-normal text-base-content mb-2">Find Matches from Database</h2>
        <p className="text-sm text-base-content/70 mb-6">Connect to the visiting students database and find optimal tour guide matches.</p>
        
        <div className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-base-content/80 font-normal">Search Criteria</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search by name, email, or tour date..." 
                className="input input-bordered flex-1 bg-base-100 border-base-300 text-base-content placeholder:text-base-content/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary transition-all duration-200 hover:scale-103">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
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
              <p>No visiting students found in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-white">
                    <th className="text-base-content/70 font-normal">Name</th>
                    <th className="text-base-content/70 font-normal">Email</th>
                    <th className="text-base-content/70 font-normal">Tour Date</th>
                    <th className="text-base-content/70 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-base-200 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm">
                        <td className="text-base-content">{student.name}</td>
                        <td className="text-base-content/70">{student.email}</td>
                        <td className="text-base-content/70">{new Date(student.tour_datetime).toLocaleString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-success transition-all duration-200 hover:scale-103"
                            onClick={() => handleMatch(student)}
                          >
                            Match
                          </button>
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
                                      <div className="text-right">
                                        <p className="text-success font-medium">Match Score: {formatSimilarity(1 - (match.distance || 0))}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex justify-end">
                              <button 
                                className="btn btn-ghost btn-sm"
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
              className="btn btn-primary transition-all duration-200 hover:scale-103"
              onClick={() => filteredStudents.forEach(handleMatch)}
            >
              Match All Pending
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 