'use client';

import React, { useState, useEffect } from 'react';
import { getMatchedStudents, unmatchStudent } from '@/services/api';
import { toast } from 'react-hot-toast';

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

  const handleUnmatchStudent = async (email: string) => {
    if (!confirm(`Are you sure you want to unmatch this student? They will be moved back to the unmatched list.`)) {
      return;
    }
    
    setUnmatchingStudent(email);
    try {
      const response = await unmatchStudent(email);
      if (response.status === 'success') {
        toast.success('Student unmatched successfully');
        // Remove the student from the matched list
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
    <div className="card bg-white shadow-md border border-base-300">
      <div className="p-6">
        <h2 className="text-xl font-normal text-base-content mb-6">Recent Matches</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="p-4 bg-error/20 text-error-content rounded-md">
            <p>{error}</p>
          </div>
        ) : matchedStudents.length === 0 ? (
          <div className="p-4 bg-base-100 text-base-content/70 rounded-md">
            <p>No matched students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-white">
                  <th className="text-base-content/70 font-normal">Student</th>
                  <th className="text-base-content/70 font-normal">Tour Guide</th>
                  <th className="text-base-content/70 font-normal">Match Date</th>
                  <th className="text-base-content/70 font-normal">Status</th>
                  <th className="text-base-content/70 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matchedStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-base-200 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm">
                    <td className="text-base-content">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.matched_tour_guide_name || student.matched_tour_guide}
                    </td>
                    <td className="text-base-content/70">{new Date(student.tour_datetime).toLocaleString()}</td>
                    <td><button className="btn btn-sm btn-success">Confirmed</button></td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleUnmatchStudent(student.email)}
                        disabled={unmatchingStudent === student.email}
                      >
                        {unmatchingStudent === student.email ? 'Unmatching...' : 'Move to Unmatched'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 