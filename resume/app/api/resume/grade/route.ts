import { NextRequest, NextResponse } from 'next/server';
import { ollamaService } from '../../../../services/ollama';
import { GradingResult } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    // Check Ollama connection
    const isConnected = await ollamaService.checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Ollama service is not available' },
        { status: 503 }
      );
    }

    // Grade the resume
    const response = await ollamaService.gradeResume(resume, jobDescription);
    
    // Parse the JSON response
    let gradingResult: GradingResult;
    try {
      const parsedResponse = JSON.parse(response);
      gradingResult = {
        ...parsedResponse,
        gradedAt: new Date(),
      };
    } catch (parseError) {
      console.error('Error parsing grading response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json(gradingResult);
  } catch (error) {
    console.error('Error grading resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 