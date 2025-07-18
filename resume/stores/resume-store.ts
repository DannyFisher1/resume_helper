import { create } from 'zustand';
import { Resume, GradingResult, JobDescription, MatchResult, OptimizationSuggestion } from '../types';

interface ResumeState {
  // Current resume
  currentResume: Resume | null;
  
  // Job description
  jobDescription: JobDescription | null;
  
  // Results
  gradingResult: GradingResult | null;
  matchResult: MatchResult | null;
  optimizationSuggestions: OptimizationSuggestion[];
  
  // Loading states
  isGrading: boolean;
  isOptimizing: boolean;
  isMatching: boolean;
  isParsingJob: boolean;
  
  // Actions
  setCurrentResume: (resume: Resume | null) => void;
  setJobDescription: (jobDescription: JobDescription | null) => void;
  setGradingResult: (result: GradingResult | null) => void;
  setMatchResult: (result: MatchResult | null) => void;
  setOptimizationSuggestions: (suggestions: OptimizationSuggestion[]) => void;
  setIsGrading: (loading: boolean) => void;
  setIsOptimizing: (loading: boolean) => void;
  setIsMatching: (loading: boolean) => void;
  setIsParsingJob: (loading: boolean) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  // Initial state
  currentResume: null,
  jobDescription: null,
  gradingResult: null,
  matchResult: null,
  optimizationSuggestions: [],
  isGrading: false,
  isOptimizing: false,
  isMatching: false,
  isParsingJob: false,
  
  // Actions
  setCurrentResume: (resume) => set({ currentResume: resume }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setGradingResult: (result) => set({ gradingResult: result }),
  setMatchResult: (result) => set({ matchResult: result }),
  setOptimizationSuggestions: (suggestions) => set({ optimizationSuggestions: suggestions }),
  setIsGrading: (loading) => set({ isGrading: loading }),
  setIsOptimizing: (loading) => set({ isOptimizing: loading }),
  setIsMatching: (loading) => set({ isMatching: loading }),
  setIsParsingJob: (loading) => set({ isParsingJob: loading }),
  reset: () => set({
    currentResume: null,
    jobDescription: null,
    gradingResult: null,
    matchResult: null,
    optimizationSuggestions: [],
    isGrading: false,
    isOptimizing: false,
    isMatching: false,
    isParsingJob: false,
  }),
})); 