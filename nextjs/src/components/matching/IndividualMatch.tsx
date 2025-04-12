'use client';

import { useState } from 'react';
import { matchTourGuides } from '@/services/api';

type MatchingFormData = {
  student_id: string;
  gender: string;
  grade: string;
  residential_status: string;
  city_country: string;
  sports: string;
  extracurricular_activities: string;
  academic_interests: string;
  additional_information: string;
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
    city_country: '',
    sports: '',
    extracurricular_activities: '',
    academic_interests: '',
    additional_information: ''
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
    <div className="card bg-base-200 shadow-md border border-base-300 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-normal text-base-content mb-2">Individual Student Matching</h2>
        <p className="text-sm text-base-content/70 mb-6">Enter student information manually to find the best tour guide match.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">Student ID</span>
              </label>
              <input 
                type="text" 
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="Enter student ID" 
                className="input input-bordered bg-base-100 border-base-300 text-base-content placeholder:text-base-content/50 w-full" 
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">Gender</span>
              </label>
              <select 
                className="select select-bordered bg-base-100 border-base-300 text-base-content w-full"
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
                <span className="label-text text-base-content/80 font-normal">Application Grade</span>
              </label>
              <select 
                className="select select-bordered bg-base-100 border-base-300 text-base-content w-full"
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
                <span className="label-text text-base-content/80 font-normal">Residential Status</span>
              </label>
              <select 
                className="select select-bordered bg-base-100 border-base-300 text-base-content w-full"
                name="residential_status"
                value={formData.residential_status}
                onChange={handleChange}
              >
                <option value="" disabled>Select status</option>
                <option value="Boarding">Boarding</option>
                <option value="Day Student">Day Student</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">City/Country</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter city and country..." 
                className="input input-bordered bg-base-100 border-base-300 text-base-content w-full"
                name="city_country"
                value={formData.city_country}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">Sports</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter sports interests..." 
                className="input input-bordered bg-base-100 border-base-300 text-base-content w-full"
                name="sports"
                value={formData.sports}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">Extracurricular Activities</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter extracurricular activities..." 
                className="input input-bordered bg-base-100 border-base-300 text-base-content w-full max-w-full truncate"
                maxLength={50}
                name="extracurricular_activities"
                value={formData.extracurricular_activities}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">Academic Interests</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter academic interests..." 
                className="input input-bordered bg-base-100 border-base-300 text-base-content w-full"
                name="academic_interests"
                value={formData.academic_interests}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-base-content/80 font-normal">Additional Information</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter any additional information..." 
                className="input input-bordered bg-base-100 border-base-300 text-base-content w-full"
                name="additional_information"
                value={formData.additional_information}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              type="submit" 
              className={`btn ${isLoading ? 'loading' : ''} btn-primary`}
              disabled={isLoading}
            >
              {isLoading ? 'Finding Matches...' : 'Find Match'}
            </button>
          </div>
        </form>

        {/* Results section */}
        {status && (
          <div className={`mt-8 p-4 rounded-lg ${
            status === 'success' ? 'bg-success/20 border border-success' : 
            status === 'warning' ? 'bg-warning/20 border border-warning' : 
            'bg-error/20 border border-error'
          }`}>
            <p className={`font-medium ${
              status === 'success' ? 'text-success-content' : 
              status === 'warning' ? 'text-warning-content' : 
              'text-error-content'
            }`}>
              {message}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-base-content mb-4">Top Matches</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {matches.map((match, index) => (
                <div key={match.id} className="card bg-base-100 rounded-lg p-5 border border-base-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium text-base-content">Match #{index + 1}</span>
                    <span className="badge badge-primary">
                      {formatSimilarity(match.similarity_score)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base-content"><span className="text-base-content/70">Student ID:</span> {match.student_id}</p>
                    <p className="text-base-content"><span className="text-base-content/70">Gender:</span> {match.gender}</p>
                    <p className="text-base-content"><span className="text-base-content/70">Grade:</span> {match.grade}</p>
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