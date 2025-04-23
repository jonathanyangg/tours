import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  context: { params: { email: string } }
) {
  try {
    const { email } = context.params;
    const decodedEmail = decodeURIComponent(email);
    console.log('Deleting visiting student with email:', decodedEmail);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visiting-students/${decodedEmail}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Delete response:', { status: response.status, data });

    if (!response.ok) {
      return NextResponse.json(
        { 
          detail: data.detail || 'Failed to delete visiting student',
          status: 'error'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Student deleted successfully',
      ...data
    });
  } catch (error) {
    console.error('Error in delete visiting student route:', error);
    return NextResponse.json(
      { 
        detail: 'Internal server error',
        status: 'error'
      },
      { status: 500 }
    );
  }
} 