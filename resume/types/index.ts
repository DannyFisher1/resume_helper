export interface Resume {
  id: string;
  name: string;
  content: string;
  parsedContent?: ParsedResume;
  uploadedAt: Date;
  lastModified: Date;
}

export interface ParsedResume {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
}

export interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
  languages: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Language {
  name: string;
  proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface GradingResult {
  overallScore: number;
  categories: GradingCategory[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  gradedAt: Date;
}

export interface GradingCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  suggestions: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  content: string;
  parsedContent?: ParsedJobDescription;
  url?: string;
  createdAt: Date;
}

export interface ParsedJobDescription {
  title: string;
  company: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  qualifications: Qualification[];
  benefits?: string[];
  salary?: SalaryRange;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
}

export interface JobRequirement {
  category: 'technical' | 'soft' | 'education' | 'experience';
  requirement: string;
  priority: 'required' | 'preferred' | 'nice-to-have';
}

export interface Qualification {
  type: 'education' | 'experience' | 'certification' | 'skill';
  description: string;
  required: boolean;
}

export interface SalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
}

export interface MatchResult {
  overallMatch: number;
  categoryMatches: CategoryMatch[];
  missingSkills: string[];
  recommendations: string[];
  strengths: string[];
  gaps: string[];
}

export interface CategoryMatch {
  category: string;
  score: number;
  maxScore: number;
  matchedItems: string[];
  missingItems: string[];
}

export interface OptimizationSuggestion {
  type: 'add' | 'modify' | 'remove' | 'reorder';
  section: string;
  content: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MarketResearch {
  position: string;
  industry: string;
  location: string;
  salaryRange: SalaryRange;
  demandLevel: 'high' | 'medium' | 'low';
  keySkills: string[];
  trends: string[];
  companies: string[];
  growthOutlook: string;
  researchedAt: Date;
} 