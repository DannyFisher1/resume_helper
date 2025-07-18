import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedFile {
  content: string;
  metadata?: {
    pages?: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export class FileParserService {
  /**
   * Parse a file and extract text content based on file type
   */
  async parseFile(file: File): Promise<ParsedFile> {
    const fileType = this.getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return this.parsePDF(file);
      case 'docx':
        return this.parseDOCX(file);
      case 'doc':
        return this.parseDOC(file);
      case 'txt':
      case 'md':
        return this.parseText(file);
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  /**
   * Parse a file buffer and extract text content based on file extension
   */
  async parseFileBuffer(buffer: Buffer, filename: string): Promise<ParsedFile> {
    const fileType = this.getFileTypeFromName(filename);
    
    switch (fileType) {
      case 'pdf':
        return this.parsePDFBuffer(buffer);
      case 'docx':
        return this.parseDOCXBuffer(buffer);
      case 'doc':
        return this.parseDOCBuffer(buffer);
      case 'txt':
      case 'md':
        return this.parseTextBuffer(buffer);
      default:
        throw new Error(`Unsupported file type: ${filename}`);
    }
  }

  private getFileType(file: File): string {
    // Check MIME type first
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (file.type === 'application/msword') return 'doc';
    if (file.type === 'text/plain') return 'txt';
    if (file.type === 'text/markdown') return 'md';
    
    // Fall back to file extension
    return this.getFileTypeFromName(file.name);
  }

  private getFileTypeFromName(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
        return 'docx';
      case 'doc':
        return 'doc';
      case 'txt':
        return 'txt';
      case 'md':
        return 'md';
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  private async parsePDF(file: File): Promise<ParsedFile> {
    const buffer = await file.arrayBuffer();
    return this.parsePDFBuffer(Buffer.from(buffer));
  }

  private async parsePDFBuffer(buffer: Buffer): Promise<ParsedFile> {
    try {
      const data = await pdf(buffer);
      
      return {
        content: data.text,
        metadata: {
          pages: data.numpages,
          title: data.info?.Title,
          author: data.info?.Author,
          subject: data.info?.Subject,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate,
          modificationDate: data.info?.ModDate,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseDOCX(file: File): Promise<ParsedFile> {
    const buffer = await file.arrayBuffer();
    return this.parseDOCXBuffer(Buffer.from(buffer));
  }

  private async parseDOCXBuffer(buffer: Buffer): Promise<ParsedFile> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      return {
        content: result.value,
        metadata: {
          // DOCX metadata could be extracted here if needed
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseDOC(file: File): Promise<ParsedFile> {
    const buffer = await file.arrayBuffer();
    return this.parseDOCBuffer(Buffer.from(buffer));
  }

  private async parseDOCBuffer(buffer: Buffer): Promise<ParsedFile> {
    try {
      // For older DOC files, mammoth can still handle some of them
      const result = await mammoth.extractRawText({ buffer });
      
      return {
        content: result.value,
        metadata: {},
      };
    } catch (error) {
      throw new Error(`Failed to parse DOC: ${error instanceof Error ? error.message : 'Unknown error'}. Note: Some older DOC formats may not be supported.`);
    }
  }

  private async parseText(file: File): Promise<ParsedFile> {
    const text = await file.text();
    return {
      content: text,
      metadata: {},
    };
  }

  private async parseTextBuffer(buffer: Buffer): Promise<ParsedFile> {
    return {
      content: buffer.toString('utf-8'),
      metadata: {},
    };
  }

  /**
   * Check if a file type is supported
   */
  isSupported(file: File): boolean {
    try {
      this.getFileType(file);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['pdf', 'docx', 'doc', 'txt', 'md'];
  }

  /**
   * Get supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
    ];
  }
}

export const fileParserService = new FileParserService(); 