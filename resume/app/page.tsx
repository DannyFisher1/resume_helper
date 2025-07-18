'use client';

import { useState, useEffect } from 'react';
import { useResumeStore } from '../stores/resume-store';
import { Upload, FileText, Target, BarChart3, Settings, Zap } from 'lucide-react';

export default function Home() {
  const [isOllamaConnected, setIsOllamaConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'grade' | 'optimize' | 'match'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    currentResume,
    jobDescription,
    gradingResult,
    matchResult,
    optimizationSuggestions,
    isGrading,
    isOptimizing,
    isMatching,
    setCurrentResume,
    setJobDescription,
    setGradingResult,
    setMatchResult,
    setOptimizationSuggestions,
    setIsGrading,
    setIsOptimizing,
    setIsMatching,
  } = useResumeStore();

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('/api/ollama/connection');
      const data = await response.json();
      setIsOllamaConnected(data.connected);
      setAvailableModels(data.models || []);
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      setIsOllamaConnected(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      try {
        // For text files, read directly
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            const resume = {
              id: Date.now().toString(),
              name: file.name,
              content,
              uploadedAt: new Date(),
              lastModified: new Date(),
            };
            setCurrentResume(resume);
            setActiveTab('grade');
            setIsUploading(false);
          };
          reader.readAsText(file);
        } else {
          // For other file types (PDF, DOC, DOCX), use the API
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/file/parse', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            const resume = {
              id: Date.now().toString(),
              name: file.name,
              content: result.content,
              uploadedAt: new Date(),
              lastModified: new Date(),
            };
            setCurrentResume(resume);
            setActiveTab('grade');
          } else {
            const error = await response.json();
            alert(`Error parsing file: ${error.error}`);
          }
          setIsUploading(false);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
        setIsUploading(false);
      }
    }
  };

  const handleGradeResume = async () => {
    if (!currentResume) return;
    
    setIsGrading(true);
    try {
      const response = await fetch('/api/resume/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: currentResume.content,
          jobDescription: jobDescription?.content,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setGradingResult(result);
      } else {
        console.error('Error grading resume:', await response.text());
      }
    } catch (error) {
      console.error('Error grading resume:', error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleOptimizeResume = async () => {
    if (!currentResume || !jobDescription) return;
    
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: currentResume.content,
          jobDescription: jobDescription.content,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setOptimizationSuggestions(result.suggestions || []);
      } else {
        console.error('Error optimizing resume:', await response.text());
      }
    } catch (error) {
      console.error('Error optimizing resume:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Resume Grader & Optimizer
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Enhance your resume with AI-powered insights and optimization
          </p>
          
          {/* Ollama Connection Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${isOllamaConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${isOllamaConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isOllamaConnected ? 'Ollama Connected' : 'Ollama Disconnected'}
            </span>
            {isOllamaConnected && (
              <span className="text-sm text-gray-500">
                ({availableModels.length} models available)
              </span>
            )}
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Upload size={20} />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('grade')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'grade' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={!currentResume}
            >
              <BarChart3 size={20} />
              Grade
            </button>
            <button
              onClick={() => setActiveTab('optimize')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'optimize' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={!currentResume}
            >
              <Zap size={20} />
              Optimize
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'match' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={!currentResume}
            >
              <Target size={20} />
              Match
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">Upload Your Resume</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Upload your resume in supported formats
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: PDF, DOC, DOCX, TXT, MD
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="resume-upload"
                  className={`px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block ${
                    isUploading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isUploading ? 'Processing...' : 'Choose File'}
                </label>
              </div>
              
              {currentResume && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    ✓ Resume uploaded: {currentResume.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grade' && currentResume && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Grade Your Resume</h2>
              
              {/* Job Description Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Paste the job description here for more targeted feedback..."
                  value={jobDescription?.content || ''}
                  onChange={(e) => setJobDescription({
                    id: Date.now().toString(),
                    title: 'Job Description',
                    company: 'Unknown',
                    content: e.target.value,
                    createdAt: new Date(),
                  })}
                />
              </div>

              <button
                onClick={handleGradeResume}
                disabled={isGrading || !isOllamaConnected}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGrading ? 'Grading...' : 'Grade Resume'}
              </button>

              {gradingResult && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Grading Results</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {gradingResult.overallScore}/100
                      </div>
                      <p className="text-gray-600">Overall Score</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {gradingResult.categories.map((category, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{category.name}</h4>
                            <span className="text-sm text-gray-600">
                              {category.score}/{category.maxScore}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{category.feedback}</p>
                        </div>
                      ))}
                    </div>

                    {gradingResult.suggestions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Suggestions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {gradingResult.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-700">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'optimize' && currentResume && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Optimize Your Resume</h2>
              
              {!jobDescription && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    Please provide a job description for targeted optimization.
                  </p>
                </div>
              )}

              {/* Job Description Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Paste the job description here..."
                  value={jobDescription?.content || ''}
                  onChange={(e) => setJobDescription({
                    id: Date.now().toString(),
                    title: 'Job Description',
                    company: 'Unknown',
                    content: e.target.value,
                    createdAt: new Date(),
                  })}
                />
              </div>

              <button
                onClick={handleOptimizeResume}
                disabled={isOptimizing || !isOllamaConnected || !jobDescription}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOptimizing ? 'Optimizing...' : 'Optimize Resume'}
              </button>

              {optimizationSuggestions.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Optimization Suggestions</h3>
                  <div className="space-y-4">
                    {optimizationSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            suggestion.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : suggestion.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {suggestion.priority}
                          </span>
                          <span className="font-medium">{suggestion.section}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{suggestion.content}</p>
                        <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'match' && currentResume && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Match Analysis</h2>
              <p className="text-gray-600 mb-6">
                Analyze how well your resume matches a specific job description.
              </p>
              
              <div className="text-center py-12">
                <Target size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Match analysis feature coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
