import { NextRequest, NextResponse } from 'next/server';
import { ollamaService } from '../../../../services/ollama';

export async function GET() {
  try {
    const isConnected = await ollamaService.checkConnection();
    const models = isConnected ? await ollamaService.listModels() : [];
    
    return NextResponse.json({
      connected: isConnected,
      models,
    });
  } catch (error) {
    console.error('Error checking Ollama connection:', error);
    return NextResponse.json(
      { 
        connected: false, 
        models: [],
        error: 'Failed to check connection' 
      },
      { status: 500 }
    );
  }
} 