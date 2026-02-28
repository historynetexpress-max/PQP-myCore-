
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  topic: string;
  score: number;
  total: number;
  date: number;
  timeTaken: string;
  answers: { qIdx: number, selected: number, isCorrect: boolean }[];
  questions: QuizQuestion[];
}

export type QuizDifficulty = 'beginner' | 'intermediate' | 'expert';

export type AIModelId = 
  | 'gemini-flash' | 'gemini-pro' 
  | 'gpt-4' | 'gpt-5' 
  | 'grok' 
  | 'plx-lite' | 'plx-pro' 
  | 'deepseek' | 'kimi' 
  | 'studio-flash' | 'studio-pro';

export interface ChatAttachment {
  data: string;
  mimeType: string;
  name?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: ChatAttachment[];
  sources?: { title: string, uri: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: AIModelId;
  history: ChatMessage[];
  updatedAt: number;
}

export interface AIResponse {
  modelId: AIModelId;
  history: ChatMessage[];
  loading: boolean;
}

export type AppView = 'dashboard' | 'tasks' | 'notes' | 'ai' | 'education';
