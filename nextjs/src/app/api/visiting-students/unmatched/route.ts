import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function GET() {
  try {
    console.log('Proxying GET request to visiting-students/unmatched endpoint');
    
    const response = await fetch(`${API_BASE_URL}/api/visiting-students/unmatched`);
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend error response:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch unmatched students' },
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