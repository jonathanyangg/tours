'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { getTourGuides } from '@/services/api';

export default function TourGuidesPage() {
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
    <div className="flex-1 bg-gray-900 flex flex-col min-h-screen">
      <Navbar />
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="p-8">
            <h1 className="text-2xl font-light text-gray-200 mb-4">Student Information</h1>
            <p className="text-gray-400 mb-8">View student information from the database.</p>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-900 text-red-200 rounded-md">
                <h3 className="font-medium mb-2">Error</h3>
                <p>{error}</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-4 bg-gray-700 text-gray-300 rounded-md">
                <p>No student information found in the database. Please upload a CSV file to populate the database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Gender
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {students.map((student, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {student.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
      </main>
    </div>
  );
} 