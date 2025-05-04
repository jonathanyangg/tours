'use client';

import { useState, useEffect } from 'react';
import { getTourGuides } from '@/services/api';

export default function TourGuides() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

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

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-3xl font-medium text-neutral-900">Tour Guides</h1>
        <p className="mt-2 text-base text-neutral-600">View and manage all available tour guides in the system.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-card border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <p className="text-neutral-500 mt-3">Loading tour guide data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-error/5 border-l-4 border-error rounded-r-md">
            <div className="flex">
              <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error">Error Loading Data</h3>
                <p className="mt-1 text-sm text-neutral-600">{error}</p>
              </div>
            </div>
          </div>
        ) : status === 'empty' || students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <svg className="h-12 w-12 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No tour guides available</h3>
            <p className="text-neutral-600 max-w-md">No tour guide information found in the database. Please upload a CSV file to populate the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-neutral-900 font-medium text-xs uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="text-neutral-900 font-medium text-xs uppercase tracking-wider">
                    Residential Status
                  </th>
                  <th className="text-neutral-900 font-medium text-xs uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="text-neutral-900 font-medium text-xs uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr 
                    key={index} 
                    className="hover"
                  >
                    <td className="font-medium text-neutral-900">
                      {student.student_id}
                    </td>
                    <td className="text-neutral-600">
                      <span className="badge badge-success text-xs">
                        {student.residential_status}
                      </span>
                    </td>
                    <td className="text-neutral-600">
                      {student.gender}
                    </td>
                    <td className="text-neutral-600">
                      <span className="badge badge-info text-xs">
                        Grade {student.grade}
                      </span>
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