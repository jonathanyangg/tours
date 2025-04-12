'use client';

import { useState, useEffect } from 'react';
import { getTourGuides } from '@/services/api';

export default function TourGuides() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getTourGuides();
        setStudents(data || []);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch student information');
        setError(error.message);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="card bg-base-200 shadow-md border border-base-300">
      <div className="p-8">
        <h1 className="text-2xl font-normal text-base-content mb-4">Student Information</h1>
        <p className="text-base-content mb-8">View student information from the database.</p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="p-4 bg-error/20 text-error-content rounded-md">
            <h3 className="font-medium mb-2">Error</h3>
            <p>{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-4 bg-base-100 text-base-content/70 rounded-md">
            <p>No student information found in the database. Please upload a CSV file to populate the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="text-base-content font-medium text-xs uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="text-base-content font-medium text-xs uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="text-base-content font-medium text-xs uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="hover:bg-base-300">
                    <td className="text-base-content/80">
                      {student.student_id}
                    </td>
                    <td className="text-base-content/80">
                      {student.gender}
                    </td>
                    <td className="text-base-content/80">
                      {student.grade}
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