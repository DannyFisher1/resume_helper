import { NextRequest, NextResponse } from 'next/server';
import { ollamaService } from '../../../../services/ollama';
import { OptimizationSuggestion } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
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

    // Optimize the resume
    const response = await ollamaService.optimizeResume(resume, jobDescription);
    
    // Parse the JSON response
    let optimizationResult;
    try {
      optimizationResult = JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing optimization response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json(optimizationResult);
  } catch (error) {
    console.error('Error optimizing resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 