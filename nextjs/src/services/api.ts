// API service for communicating with the FastAPI backend

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
    const response = await fetch(`${API_BASE_URL}/upload-tour-guides`, {
      method: 'POST',
      body: formData,
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
    const response = await fetch(`${API_BASE_URL}/tour-guides`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch tour guides');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tour guides:', error);
    throw error;
  }
}

/**
 * Check the health of the backend
 * @returns The health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

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
    const response = await fetch(`${API_BASE_URL}/test-weaviate`);

    if (!response.ok) {
      throw new Error('Weaviate connection test failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error testing Weaviate connection:', error);
    throw error;
  }
} 