'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  email: string;
  gender: string;
  grade: string;
  residential_status: string;
  city_country: string;
  sports?: string;
  extracurricular_activities?: string;
  academic_interests?: string;
  additional_information?: string;
  race?: string;
  tour_datetime: string;
};

export default function VisitingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    tour_datetime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('Starting form submission with data:', formData);

    try {
      const response = await fetch('/api/visiting-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Form submission failed:', errorData);
        throw new Error(errorData.error || 'Failed to submit form');
      }

      const data = await response.json();
      console.log('Form submitted successfully:', data);

      // Reset form
      setFormData({
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
        tour_datetime: '',
      });

      // Redirect to success page
      router.push('/success');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Updating form field ${name} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          required
          value={formData.gender}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
          Grade
        </label>
        <select
          id="grade"
          name="grade"
          required
          value={formData.grade}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select grade</option>
          <option value="9">9th Grade</option>
          <option value="10">10th Grade</option>
          <option value="11">11th Grade</option>
          <option value="12">12th Grade</option>
        </select>
      </div>

      <div>
        <label htmlFor="residential_status" className="block text-sm font-medium text-gray-700">
          Residential Status
        </label>
        <select
          id="residential_status"
          name="residential_status"
          required
          value={formData.residential_status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select status</option>
          <option value="day">Day Student</option>
          <option value="boarding">Boarding Student</option>
        </select>
      </div>

      <div>
        <label htmlFor="city_country" className="block text-sm font-medium text-gray-700">
          City/Country
        </label>
        <input
          type="text"
          id="city_country"
          name="city_country"
          required
          value={formData.city_country}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="tour_datetime" className="block text-sm font-medium text-gray-700">
          Preferred Tour Date and Time
        </label>
        <input
          type="datetime-local"
          id="tour_datetime"
          name="tour_datetime"
          required
          value={formData.tour_datetime}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="sports" className="block text-sm font-medium text-gray-700">
          Sports Interests (Optional)
        </label>
        <input
          type="text"
          id="sports"
          name="sports"
          value={formData.sports}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="extracurricular_activities" className="block text-sm font-medium text-gray-700">
          Extracurricular Activities (Optional)
        </label>
        <input
          type="text"
          id="extracurricular_activities"
          name="extracurricular_activities"
          value={formData.extracurricular_activities}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="academic_interests" className="block text-sm font-medium text-gray-700">
          Academic Interests (Optional)
        </label>
        <input
          type="text"
          id="academic_interests"
          name="academic_interests"
          value={formData.academic_interests}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="race" className="block text-sm font-medium text-gray-700">
          Race/Ethnicity (Optional)
        </label>
        <input
          type="text"
          id="race"
          name="race"
          value={formData.race}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="additional_information" className="block text-sm font-medium text-gray-700">
          Additional Information (Optional)
        </label>
        <textarea
          id="additional_information"
          name="additional_information"
          value={formData.additional_information}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
} 