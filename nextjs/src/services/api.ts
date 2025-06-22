// API service for communicating with the FastAPI backend

import { getToken } from "@/utils/auth";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Upload a CSV file to the backend
 * @param file The CSV file to upload
 * @returns The response from the server
 */
export async function uploadTourGuides(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/upload-tour-guides`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload tour guides');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading tour guides:', error);
    throw error;
  }
}

/**
 * Get all tour guides from the backend
 * @returns The tour guides data
 */
export async function getTourGuides() {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/tour-guides`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch tour guides');
    }

    const data = await response.json();
    return {
      status: data.status || 'success',
      message: data.message || 'Tour guides retrieved successfully',
      students: data.students || []
    };
  } catch (error) {
    console.error('Error fetching tour guides:', error);
    throw error;
  }
}

/**
 * Match student with tour guides based on criteria
 * @param matchData The matching criteria
 * @returns The matching results
 */
export async function matchTourGuides(matchData: {
  student_id: string;
  gender: string;
  grade: string;
  residential_status?: string;
  city_country?: string;
  sports?: string;
  extracurricular_activities?: string;
  academic_interests?: string;
  additional_information?: string;
  race?: string;
  time_period?: string;
}) {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/match-tour-guides-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to match tour guides');
    }

    return await response.json();
  } catch (error) {
    console.error('Error matching tour guides:', error);
    throw error;
  }
}

/**
 * Match student with tour guides based on a visiting student from the database
 * @param matchData The matching criteria
 * @returns The matching results
 */
export async function matchTourGuidesFromDatabase(matchData: {
  student_id: string;
  gender: string;
  grade: string;
  residential_status?: string;
  city_country?: string;
  sports?: string;
  extracurricular_activities?: string;
  academic_interests?: string;
  additional_information?: string;
  race?: string;
  time_period?: string;
}) {
  try {
    console.log('Making request to match tour guides from database:', {
      url: `${API_BASE_URL}/match-tour-guides-from-database`,
      method: 'POST',
      data: JSON.stringify(matchData, null, 2),
    });
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/match-tour-guides-from-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(matchData),
    });

    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response data:', errorData);
      throw new Error(errorData.detail || 'Failed to match tour guides from database');
    }

    const data = await response.json();
    console.log('Success response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error matching tour guides from database:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Check the health of the backend
 * @returns The health status
 */
export async function checkHealth() {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Backend health check failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking backend health:', error);
    throw error;
  }
}

/**
 * Test the Weaviate connection
 * @returns The test result
 */
export async function testWeaviateConnection() {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/test-weaviate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Weaviate connection test failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error testing Weaviate connection:', error);
    throw error;
  }
}

/**
 * Get unmatched visiting students
 * @returns List of unmatched visiting students
 */
export async function getUnmatchedStudents() {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/visiting-students/unmatched`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get unmatched students');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting unmatched students:', error);
    throw error;
  }
}

/**
 * Get matched visiting students
 * @returns List of matched visiting students
 */
export async function getMatchedStudents() {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/visiting-students/matched`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get matched students');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting matched students:', error);
    throw error;
  }
}

/**
 * Update a student's match status with a tour guide
 * @param studentEmail The email of the student to match
 * @param tourGuideId The ID of the tour guide to match with
 * @returns The result of the match update
 */
export async function updateStudentMatch(studentEmail: string, tourGuideId: string) {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/visiting-students/${studentEmail}/match?tour_guide_id=${tourGuideId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update student match');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating student match:', error);
    throw error;
  }
}

/**
 * Unmatch a student, moving them back to the unmatched list
 * @param studentEmail The email of the student to unmatch
 * @returns The response from the server
 */
export async function unmatchStudent(studentEmail: string) {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/visiting-students/${encodeURIComponent(studentEmail)}/unmatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to unmatch student');
    }

    return await response.json();
  } catch (error) {
    console.error('Error unmatching student:', error);
    throw error;
  }
}



/**
 * Delete a visiting student
 * @param email The email of the student to delete
 * @returns The response from the server
 */
export async function deleteVisitingStudent(email: string) {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/visiting-students/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete visiting student');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting visiting student:', error);
    throw error;
  }
}

/**
 * Get the current user's email
 * @returns The user's email
 */
export async function getUserEmail() {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/test-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch user email');
    }

    const data = await response.json();
    return data.email;
  } catch (error) {
    console.error('Error fetching user email:', error);
    throw error;
  }
} 

