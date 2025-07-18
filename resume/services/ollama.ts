export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection error:', error);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  async generateResponse(request: OllamaRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async gradeResume(resume: string, jobDescription?: string): Promise<string> {
    const prompt = `
You are an expert resume reviewer. Please grade this resume on a scale of 1-100 and provide detailed feedback.

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Resume:
${resume}

Please provide your response in the following JSON format:
{
  "overallScore": number,
  "categories": [
    {
      "name": "Content Quality",
      "score": number,
      "maxScore": 20,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2"]
    },
    {
      "name": "Formatting & Structure",
      "score": number,
      "maxScore": 20,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2"]
    },
    {
      "name": "Relevance to Job",
      "score": number,
      "maxScore": 20,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2"]
    },
    {
      "name": "Skills & Experience",
      "score": number,
      "maxScore": 20,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2"]
    },
    {
      "name": "Achievement Focus",
      "score": number,
      "maxScore": 20,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2"]
    }
  ],
  "suggestions": ["overall suggestion1", "overall suggestion2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}
`;

    return this.generateResponse({
      model: 'llama3.2',
      prompt,
      options: {
        temperature: 0.3,
      },
    });
  }

  async optimizeResume(resume: string, jobDescription: string): Promise<string> {
    const prompt = `
You are an expert resume optimizer. Please provide specific suggestions to optimize this resume for the given job description.

Job Description:
${jobDescription}

Resume:
${resume}

Please provide your response in the following JSON format:
{
  "suggestions": [
    {
      "type": "add|modify|remove|reorder",
      "section": "section name",
      "content": "specific content suggestion",
      "reason": "why this change is needed",
      "priority": "high|medium|low"
    }
  ],
  "overallRecommendations": ["recommendation1", "recommendation2"],
  "keywordSuggestions": ["keyword1", "keyword2"],
  "missingSkills": ["skill1", "skill2"]
}
`;

    return this.generateResponse({
      model: 'llama3.2',
      prompt,
      options: {
        temperature: 0.3,
      },
    });
  }

  async parseJobDescription(jobDescription: string): Promise<string> {
    const prompt = `
You are an expert job description analyzer. Please parse this job description and extract key information.

Job Description:
${jobDescription}

Please provide your response in the following JSON format:
{
  "title": "job title",
  "company": "company name",
  "requirements": [
    {
      "category": "technical|soft|education|experience",
      "requirement": "specific requirement",
      "priority": "required|preferred|nice-to-have"
    }
  ],
  "responsibilities": ["responsibility1", "responsibility2"],
  "qualifications": [
    {
      "type": "education|experience|certification|skill",
      "description": "qualification description",
      "required": true/false
    }
  ],
  "benefits": ["benefit1", "benefit2"],
  "salary": {
    "min": number,
    "max": number,
    "currency": "USD",
    "period": "yearly"
  },
  "location": "location",
  "jobType": "full-time|part-time|contract",
  "experienceLevel": "entry|mid|senior"
}
`;

    return this.generateResponse({
      model: 'llama3.2',
      prompt,
      options: {
        temperature: 0.2,
      },
    });
  }

  async matchResumeToJob(resume: string, jobDescription: string): Promise<string> {
    const prompt = `
You are an expert at matching resumes to job descriptions. Please analyze how well this resume matches the job requirements.

Job Description:
${jobDescription}

Resume:
${resume}

Please provide your response in the following JSON format:
{
  "overallMatch": number (0-100),
  "categoryMatches": [
    {
      "category": "Technical Skills",
      "score": number,
      "maxScore": 100,
      "matchedItems": ["item1", "item2"],
      "missingItems": ["missing1", "missing2"]
    }
  ],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"]
}
`;

    return this.generateResponse({
      model: 'llama3.2',
      prompt,
      options: {
        temperature: 0.3,
      },
    });
  }
}

export const ollamaService = new OllamaService(); 