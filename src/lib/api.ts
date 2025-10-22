// API client with retry and abort support
import { mockService } from './mock';
import type { 
  OverviewStats, 
  ProjectsResponse, 
  BatchUploadResponse, 
  BatchStatus,
  Project 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0 && !(error instanceof ApiError && error.status < 500)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (USE_MOCK) {
    return handleMockRequest(path, 'GET', undefined) as Promise<T>;
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return response.json();
  } catch (error) {
    console.warn('API call failed, falling back to mock:', path);
    return handleMockRequest(path, 'GET', undefined) as Promise<T>;
  }
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal
): Promise<T> {
  if (USE_MOCK) {
    return handleMockRequest(path, 'POST', body) as Promise<T>;
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    return response.json();
  } catch (error) {
    console.warn('API call failed, falling back to mock:', path);
    return handleMockRequest(path, 'POST', body) as Promise<T>;
  }
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal
): Promise<T> {
  if (USE_MOCK) {
    return handleMockRequest(path, 'UPLOAD', formData) as Promise<T>;
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${path}`, {
      method: 'POST',
      body: formData,
      signal,
    });
    return response.json();
  } catch (error) {
    console.warn('API call failed, falling back to mock:', path);
    return handleMockRequest(path, 'UPLOAD', formData) as Promise<T>;
  }
}

function handleMockRequest(path: string, method: string, body?: unknown): unknown {
  // Stats endpoint
  if (path === '/stats/overview' && method === 'GET') {
    return mockService.getOverviewStats();
  }

  // Projects list
  if (path.startsWith('/projects?') && method === 'GET') {
    const params = new URLSearchParams(path.split('?')[1]);
    return mockService.listProjects({
      search: params.get('search') || undefined,
      discipline: params.get('discipline') || undefined,
      sort: params.get('sort') || undefined,
      page: parseInt(params.get('page') || '1'),
    });
  }

  // Create project
  if (path === '/projects' && method === 'POST') {
    return mockService.createProject(body as { name: string; code: string; client?: string });
  }

  // Upload batch
  if (path.match(/\/projects\/.+\/batches\/uploads/) && method === 'UPLOAD') {
    const projectId = path.split('/')[2];
    const files: File[] = [];
    (body as FormData).forEach((value) => {
      if (value instanceof File) files.push(value);
    });
    return mockService.uploadBatch(projectId, files);
  }

  // Start batch
  if (path.match(/\/projects\/.+\/batches\/.+\/start/) && method === 'POST') {
    const parts = path.split('/');
    const projectId = parts[2];
    const batchId = parts[4];
    mockService.startBatch(projectId, batchId, body as any);
    return { success: true };
  }

  // Batch status
  if (path.match(/\/projects\/.+\/batches\/.+\/status/) && method === 'GET') {
    const parts = path.split('/');
    const projectId = parts[2];
    const batchId = parts[4];
    return mockService.getBatchStatus(projectId, batchId);
  }

  // File log
  if (path.match(/\/projects\/.+\/batches\/.+\/files\/.+\/log/) && method === 'GET') {
    const parts = path.split('/');
    const projectId = parts[2];
    const batchId = parts[4];
    const fileId = parts[6];
    return mockService.getFileLog(projectId, batchId, fileId);
  }

  // Batch report (for download)
  if (path.match(/\/projects\/.+\/batches\/.+\/report/) && method === 'GET') {
    const parts = path.split('/');
    const projectId = parts[2];
    const batchId = parts[4];
    const blob = mockService.getBatchReport(projectId, batchId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${batchId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${path}`);
}

export { API_BASE_URL, ApiError };
