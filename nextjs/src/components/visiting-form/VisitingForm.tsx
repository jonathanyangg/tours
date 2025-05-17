'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type VisitingStudentForm = {
  school: string;
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

export default function VisitingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<VisitingStudentForm>({
    school: '',
    name: '',
    email: '',
    gender: '',
    grade: '',
    residential_status: '',
    city_country: '',
    sports: '',
    extracurricular_activities: '',
    academic_interests: '',
    additional_information: '',
    race: '',
    tour_datetime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    // Validate required fields
    const requiredFields = ['school','name', 'email', 'gender', 'grade', 'tour_datetime'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof VisitingStudentForm]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/visiting-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        setError(errorData.detail || 'Failed to submit form');
        setIsSubmitting(false);
        return;
      }
  
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-white shadow-lg">
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-base-content mb-4">Visiting Student Registration</h1>
        <p className="text-sm text-base-content/70 mb-8">Please fill out this form to register for a campus tour. We'll match you with the perfect tour guide based on your interests and background.</p>

        {success ? (
          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Registration successful! Redirecting you to the homepage...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">School</span>
                </label>
                <select
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="select select-bordered bg-base-100 border-base-300 text-sm text-base-content w-full"
                  required
                >
                  <option value="">Select School</option>
                  <option value="310680">Lawrenceville</option>
                  <option value="311265">PDS</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Tour Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  name="tour_datetime"
                  value={formData.tour_datetime}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content w-full"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Gender</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="select select-bordered bg-base-100 border-base-300 text-sm text-base-content w-full"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Grade</span>
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="select select-bordered bg-base-100 border-base-300 text-sm text-base-content w-full"
                  required
                >
                  <option value="">Select grade</option>
                  <option value="9">Freshman</option>
                  <option value="10">Sophomore</option>
                  <option value="11">Junior</option>
                  <option value="12">Senior</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Residential Status</span>
                </label>
                <select
                  name="residential_status"
                  value={formData.residential_status}
                  onChange={handleChange}
                  className="select select-bordered bg-base-100 border-base-300 text-sm text-base-content w-full"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Day Student">Day Student</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">City/Country</span>
                </label>
                <input
                  type="text"
                  name="city_country"
                  value={formData.city_country}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="e.g., New York, USA"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Sports Interests</span>
                </label>
                <input
                  type="text"
                  name="sports"
                  value={formData.sports}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="e.g., Soccer, Basketball, Swimming"
                />
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Extracurricular Activities</span>
                </label>
                <input
                  type="text"
                  name="extracurricular_activities"
                  value={formData.extracurricular_activities}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="e.g., Debate Club, Student Government"
                />
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Academic Interests</span>
                </label>
                <input
                  type="text"
                  name="academic_interests"
                  value={formData.academic_interests}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="e.g., Computer Science, Biology"
                />
              </div>

              <div className="form-control">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Race/Ethnicity</span>
                </label>
                <input
                  type="text"
                  name="race"
                  value={formData.race}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="e.g., Asian, Hispanic, Caucasian"
                />
              </div>

              

              <div className="form-control col-span-1 md:col-span-2 lg:col-span-3">
                <label className="label mb-1">
                  <span className="text-sm font-medium text-base-content/80">Additional Information</span>
                </label>
                <input
                  type="text"
                  name="additional_information"
                  value={formData.additional_information}
                  onChange={handleChange}
                  className="input input-bordered bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/50 w-full"
                  placeholder="Any other information you'd like to share"
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className={`btn btn-primary/90 text-sm ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 