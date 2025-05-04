import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Repository {
  url: string;
  indexingStatus: 'idle' | 'indexing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface RepoState {
  repository: Repository | null;
  messages: Message[];
  isProcessing: boolean;
  
  setRepository: (repo: Repository) => void;
  updateIndexingStatus: (status: Repository['indexingStatus'], progress?: number, error?: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  resetChat: () => void;
  resetAll: () => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repository: null,
  messages: [],
  isProcessing: false,
  
  setRepository: (repo) => set({ repository: repo }),
  
  updateIndexingStatus: (status, progress = 0, error) => 
    set((state) => ({ 
      repository: state.repository 
        ? { ...state.repository, indexingStatus: status, progress, ...(error ? { error } : {}) } 
        : null 
    })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }]
  })),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  resetChat: () => set({ messages: [] }),
  
  resetAll: () => set({ repository: null, messages: [], isProcessing: false }),
}));