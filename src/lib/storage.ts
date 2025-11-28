// LocalStorage-based database for DeployBridge

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  fileName: string;
  fileSize: number;
  provider: 'vercel' | 'netlify' | 'firebase' | null;
  status: 'uploaded' | 'building' | 'deploying' | 'deployed' | 'failed';
  liveUrl: string | null;
  createdAt: string;
  deployedAt: string | null;
  buildLogs: string[];
}

export interface Feedback {
  id: string;
  userId: string;
  type: 'suggestion' | 'bug' | 'other';
  subject: string;
  message: string;
  rating: number | null;
  createdAt: string;
}

const USERS_KEY = 'deploybridge_users';
const PROJECTS_KEY = 'deploybridge_projects';
const FEEDBACK_KEY = 'deploybridge_feedback';
const SESSION_KEY = 'deploybridge_session';

// Users
export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const createUser = (email: string, name: string, password: string): User => {
  const users = getUsers();
  const existing = users.find(u => u.email === email);
  if (existing) throw new Error('User already exists');
  
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    password,
    createdAt: new Date().toISOString(),
  };
  
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password) || null;
};

// Session
export const setSession = (userId: string) => {
  localStorage.setItem(SESSION_KEY, userId);
};

export const getSession = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const userId = getSession();
  if (!userId) return null;
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

// Projects
export const getProjects = (userId: string): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  const projects: Project[] = data ? JSON.parse(data) : [];
  return projects.filter(p => p.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const createProject = (userId: string, name: string, fileName: string, fileSize: number): Project => {
  const data = localStorage.getItem(PROJECTS_KEY);
  const projects: Project[] = data ? JSON.parse(data) : [];
  
  const project: Project = {
    id: crypto.randomUUID(),
    userId,
    name,
    fileName,
    fileSize,
    provider: null,
    status: 'uploaded',
    liveUrl: null,
    createdAt: new Date().toISOString(),
    deployedAt: null,
    buildLogs: [],
  };
  
  projects.push(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return project;
};

export const updateProject = (projectId: string, updates: Partial<Project>): Project | null => {
  const data = localStorage.getItem(PROJECTS_KEY);
  const projects: Project[] = data ? JSON.parse(data) : [];
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index === -1) return null;
  
  projects[index] = { ...projects[index], ...updates };
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects[index];
};

export const getProjectById = (projectId: string): Project | null => {
  const data = localStorage.getItem(PROJECTS_KEY);
  const projects: Project[] = data ? JSON.parse(data) : [];
  return projects.find(p => p.id === projectId) || null;
};

// Feedback
export const getFeedback = (): Feedback[] => {
  const data = localStorage.getItem(FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
};

export const createFeedback = (
  userId: string, 
  type: Feedback['type'], 
  subject: string, 
  message: string, 
  rating: number | null
): Feedback => {
  const feedback: Feedback = {
    id: crypto.randomUUID(),
    userId,
    type,
    subject,
    message,
    rating,
    createdAt: new Date().toISOString(),
  };
  
  const allFeedback = getFeedback();
  allFeedback.push(feedback);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  return feedback;
};
