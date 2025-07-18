import { NextRequest, NextResponse } from 'next/server';
import { fileParserService } from '../../../../services/file-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file type is supported
    if (!fileParserService.isSupported(file)) {
      return NextResponse.json(
        { 
          error: `Unsupported file type. Supported types: ${fileParserService.getSupportedExtensions().join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Parse the file
    const parsedFile = await fileParserService.parseFile(file);

    // Return the parsed content
    return NextResponse.json({
      content: parsedFile.content,
      metadata: parsedFile.metadata,
      filename: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Error parsing file:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to parse file: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    supportedExtensions: fileParserService.getSupportedExtensions(),
    supportedMimeTypes: fileParserService.getSupportedMimeTypes(),
    maxFileSize: '10MB',
  });
} 