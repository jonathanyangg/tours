'use client';

import { useState, useEffect } from 'react';
import { matchTourGuides } from '@/services/api';

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
  similarity_score: number;
  distance: number | null;
  id: string;
};

export default function DatabaseMatches() {
  const [visitingStudents, setVisitingStudents] = useState<VisitingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<VisitingStudent | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'success' | 'warning' | 'error' | ''>('');
  const [matchMessage, setMatchMessage] = useState('');

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

      const result = await matchTourGuides(matchData);
      console.log('Match result:', result);
      
      if (result.status === 'success') {
        setSelectedStudent(student);
        setMatches(result.matches.slice(0, 3)); // Get top 3 matches
        setMatchStatus('success');
        setMatchMessage(result.message);
        setShowMatches(true);
      } else {
        setMatchStatus('warning');
        setMatchMessage(result.message);
        setShowMatches(true);
      }
    } catch (err) {
      console.error('Error matching student:', err);
      setMatchStatus('error');
      setMatchMessage(err instanceof Error ? err.message : 'Unknown error');
      setShowMatches(true);
    }
  };

  const formatSimilarity = (score: number) => {
    return `${Math.round(score * 100)}%`;
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
          
          <div className="card bg-base-100 p-4 rounded-lg border border-base-300 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-normal text-base-content">Recent Visitors</h3>
              <span className="badge badge-primary">{filteredStudents.length} pending</span>
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
                      <tr key={index} className="hover:bg-base-200 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm">
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
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

      {/* Matches Modal */}
      {showMatches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-base-content">
                {selectedStudent ? `Matches for ${selectedStudent.name}` : 'Matching Results'}
              </h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowMatches(false)}
              >
                ✕
              </button>
            </div>

            {matchStatus === 'error' ? (
              <div className="p-4 bg-error/20 text-error-content rounded-md">
                <p>{matchMessage}</p>
              </div>
            ) : matchStatus === 'warning' ? (
              <div className="p-4 bg-warning/20 text-warning-content rounded-md">
                <p>{matchMessage}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div key={match.id} className="p-4 bg-base-100 rounded-lg border border-base-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-base-content">Tour Guide {index + 1}</h4>
                        <p className="text-base-content/70">ID: {match.student_id}</p>
                        <p className="text-base-content/70">Grade: {match.grade}</p>
                        <p className="text-base-content/70">Gender: {match.gender}</p>
                        <p className="text-base-content/70">Residential Status: {match.residential_status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-success font-medium">Match Score: {formatSimilarity(match.similarity_score)}</p>
                        {match.distance !== null && (
                          <p className="text-base-content/70">Distance: {formatSimilarity(1 - match.distance)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 