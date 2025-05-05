import axios from 'axios';

const API_URL = 'https://gitrag-api.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface IndexRepoRequest {
  repo_url: string;
}

export interface IndexRepoResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface IndexingStatusResponse {
  status: string;
  progress: number;
  message: string;
  error?: string;
}

export interface QueryRequest {
  repo_url: string;
  query: string;
}

export interface QueryResponse {
  answer: string;
  sources: {
    content: string;
    path: string;
    similarity: number;
  }[];
}

export const repoApi = {
  indexRepo: async (repoUrl: string): Promise<IndexRepoResponse> => {
    const response = await api.post<IndexRepoResponse>('/index-repo', { repo_url: repoUrl });
    return response.data;
  },
  
  getIndexingStatus: async (taskId: string): Promise<IndexingStatusResponse> => {
    const response = await api.get<IndexingStatusResponse>(`/indexing-status/${taskId}`);
    return response.data;
  },
  
  queryRepo: async (repoUrl: string, query: string): Promise<QueryResponse> => {
    const response = await api.post<QueryResponse>('/query', { repo_url: repoUrl, query });
    return response.data;
  }
};