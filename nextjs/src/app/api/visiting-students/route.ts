import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    console.log('Received visiting student submission request');
    
    const formData = await request.json();
    console.log('Form data received:', formData);

    // Validate required fields
    const requiredFields = ['name', 'email', 'gender', 'grade', 'tour_datetime'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Make request to the backend API
    const response = await fetch('http://localhost:8000/api/visiting-students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('Backend API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to submit form' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully submitted visiting student:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing visiting student submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Proxying GET request to visiting-students endpoint');
    
    const response = await fetch(`${API_BASE_URL}/api/visiting-students`);
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend error response:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch visiting students' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Backend success response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 