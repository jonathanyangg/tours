'use client';

import { useState, useEffect } from 'react';
import { getTourGuides } from '@/services/api';

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
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="pb-5">
        <h1 className="text-3xl font-bold text-primary">Tour Guides</h1>
        <p className="mt-2 text-base text-base-content/70">View and manage all available tour guides in the system.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 border-b border-base-200 flex justify-between items-center flex-wrap gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-base-content/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-base-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-lg bg-white text-base-content/80 placeholder-base-content/50 w-full sm:w-64 transition-all duration-200"
              placeholder="Search tour guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="rounded-md bg-base-200 px-1 py-1 inline-flex">
            <span className="px-3 py-1.5 text-sm font-medium text-base-content/60">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'guide' : 'guides'} available
            </span>
          </div>
        </div>
      
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-t-primary border-b-base-200 border-l-base-200 border-r-base-200 animate-spin"></div>
                <div className="absolute top-[6px] left-[6px] h-12 w-12 rounded-full border-4 border-t-transparent border-b-accent-content/50 border-l-accent-content/50 border-r-accent-content/50 animate-spin"></div>
              </div>
              <p className="text-base-content/60 mt-4 font-medium">Loading tour guides...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-error/5 border-l-4 border-error text-error-content p-4 rounded-r-md">
              <div className="flex">
                <svg className="h-6 w-6 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error Loading Data</h3>
                  <p className="mt-1 text-sm opacity-80">{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : status === 'empty' || students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="rounded-full bg-base-200 p-4 mb-4">
              <svg className="h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">No tour guides available</h3>
            <p className="text-base-content/60 max-w-md">The tour guide database is currently empty. Please upload a CSV file to populate the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-base-200">
              <thead className="bg-base-200/50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider cursor-pointer hover:text-primary"
                    onClick={() => handleSort('student_id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Student ID</span>
                      {renderSortIcon('student_id')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider cursor-pointer hover:text-primary"
                    onClick={() => handleSort('residential_status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Residential Status</span>
                      {renderSortIcon('residential_status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider cursor-pointer hover:text-primary"
                    onClick={() => handleSort('gender')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Gender</span>
                      {renderSortIcon('gender')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider cursor-pointer hover:text-primary"
                    onClick={() => handleSort('grade')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Grade</span>
                      {renderSortIcon('grade')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-base-200">
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={index} 
                    className="group hover:bg-base-200/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-base-200 flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors duration-200">
                          <span className="text-xs text-base-content/70 group-hover:text-primary">{student.student_id.charAt(0).toUpperCase()}</span>
                        </div>
                        {student.student_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success-content">
                        {student.residential_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/90">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-info/10 text-info-content">
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