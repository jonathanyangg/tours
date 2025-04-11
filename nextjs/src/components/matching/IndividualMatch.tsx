'use client';

import { useState } from 'react';
import { matchTourGuides } from '@/services/api';

type MatchingFormData = {
  student_id: string;
  gender: string;
  grade: string;
  residential_status: string;
  domestic_or_international: string;
  sports: string;
  extracurricular_activities: string;
  academic_interests: string;
  other_notes: string;
};

type MatchResult = {
  student_id: string;
  gender: string;
  grade: string;
  similarity_score: number;
  id: string;
};

export default function IndividualMatch() {
  const [formData, setFormData] = useState<MatchingFormData>({
    student_id: '',
    gender: '',
    grade: '',
    residential_status: '',
    domestic_or_international: '',
    sports: '',
    extracurricular_activities: '',
    academic_interests: '',
    other_notes: ''
  });
  
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'success' | 'warning' | 'error' | ''>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.student_id || !formData.gender || !formData.grade) {
      setStatus('error');
      setMessage('Student ID, Gender, and Grade are required');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('');
      setMessage('');
      setMatches([]);
      
      const result = await matchTourGuides(formData);
      
      if (result.status === 'success') {
        setMatches(result.matches);
        setStatus('success');
        setMessage(result.message);
      } else if (result.status === 'warning') {
        setStatus('warning');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage('Unknown error occurred during matching');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to match tour guides');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to format similarity score as percentage
  const formatSimilarity = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-light text-gray-200 mb-2">Individual Student Matching</h2>
        <p className="text-sm text-gray-400 mb-6">Enter student information manually to find the best tour guide match.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Student ID</span>
              </label>
              <input 
                type="text" 
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="Enter student ID" 
                className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 placeholder:text-gray-400 w-full" 
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Gender</span>
              </label>
              <select 
                className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Application Grade</span>
              </label>
              <select 
                className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
              >
                <option value="" disabled>Select grade</option>
                <option value="9">Freshman</option>
                <option value="10">Sophomore</option>
                <option value="11">Junior</option>
                <option value="12">Senior/PG</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Residential Status</span>
              </label>
              <select 
                className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="residential_status"
                value={formData.residential_status}
                onChange={handleChange}
              >
                <option value="" disabled>Select status</option>
                <option value="Boarder">Boarder</option>
                <option value="Day Student">Day Student</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Domestic or International</span>
              </label>
              <select 
                className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="domestic_or_international"
                value={formData.domestic_or_international}
                onChange={handleChange}
              >
                <option value="" disabled>Select status</option>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Sports</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter sports interests..." 
                className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="sports"
                value={formData.sports}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Extracurricular Activities</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter extracurricular activities..." 
                className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full max-w-full truncate"
                maxLength={50}
                name="extracurricular_activities"
                value={formData.extracurricular_activities}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Academic Interests</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter academic interests..." 
                className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="academic_interests"
                value={formData.academic_interests}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300 font-light">Other Notes</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter any additional notes..." 
                className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
                name="other_notes"
                value={formData.other_notes}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              type="submit" 
              className={`btn ${isLoading ? 'loading bg-gray-500' : 'bg-gray-600'} text-white hover:bg-gray-500 border-none`}
              disabled={isLoading}
            >
              {isLoading ? 'Finding Matches...' : 'Find Match'}
            </button>
          </div>
        </form>

        {/* Results section */}
        {status && (
          <div className={`mt-8 p-4 rounded-lg ${
            status === 'success' ? 'bg-green-900/30 border border-green-700' : 
            status === 'warning' ? 'bg-yellow-900/30 border border-yellow-700' : 
            'bg-red-900/30 border border-red-700'
          }`}>
            <p className={`font-medium ${
              status === 'success' ? 'text-green-400' : 
              status === 'warning' ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {message}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Top Matches</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {matches.map((match, index) => (
                <div key={match.id} className="bg-gray-700 rounded-lg p-5 border border-gray-600">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium text-gray-200">Match #{index + 1}</span>
                    <span className="px-2 py-1 bg-gray-600 rounded text-gray-200 text-sm">
                      {formatSimilarity(match.similarity_score)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Student ID:</span> {match.student_id}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Gender:</span> {match.gender}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Grade:</span> {match.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 