// Improved LocalStorage-based database for DeployBridge
// Safe JSON parsing, hashed passwords, validation, and data integrity checks

import { sha256 } from "js-sha256";

// -------------------------
// Type Interfaces
// -------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // hashed
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  fileName: string;
  fileSize: number;
  provider: "vercel" | "netlify" | "firebase" | null;
  status: "uploaded" | "building" | "deploying" | "deployed" | "failed";
  liveUrl: string | null;
  createdAt: string;
  deployedAt: string | null;
  buildLogs: string[];
}

export interface Feedback {
  id: string;
  userId: string;
  type: "suggestion" | "bug" | "other";
  subject: string;
  message: string;
  rating: number | null;
  createdAt: string;
}

// -------------------------
// LocalStorage Keys
// -------------------------

const USERS_KEY = "deploybridge_users";
const PROJECTS_KEY = "deploybridge_projects";
const FEEDBACK_KEY = "deploybridge_feedback";
const SESSION_KEY = "deploybridge_session";

// -------------------------
// Safe JSON Parser
// -------------------------

function safeParse<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`⚠️ Corrupted localStorage key "${key}", resetting...`);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// -------------------------
// Users
// -------------------------

export const getUsers = (): User[] => {
  return safeParse<User[]>(USERS_KEY, []);
};

export const createUser = (
  email: string,
  name: string,
  password: string
): User => {
  const users = getUsers();

  const existing = users.find((u) => u.email === email);
  if (existing) throw new Error("User already exists");

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    password: sha256(password), // hashed password
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  save(USERS_KEY, users);

  return user;
};

export const authenticateUser = (
  email: string,
  password: string
): User | null => {
  const users = getUsers();
  const hashed = sha256(password);
  return users.find((u) => u.email === email && u.password === hashed) || null;
};

// -------------------------
// Session
// -------------------------

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
  return users.find((u) => u.id === userId) || null;
};

// -------------------------
// Projects
// -------------------------

export const getProjects = (userId: string): Project[] => {
  const projects = safeParse<Project[]>(PROJECTS_KEY, []);
  const filtered = projects.filter((p) => p.userId === userId);

  return filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const createProject = (
  userId: string,
  name: string,
  fileName: string,
  fileSize: number
): Project => {
  const projects = safeParse<Project[]>(PROJECTS_KEY, []);

  const project: Project = {
    id: crypto.randomUUID(),
    userId,
    name,
    fileName,
    fileSize,
    provider: null,
    status: "uploaded",
    liveUrl: null,
    createdAt: new Date().toISOString(),
    deployedAt: null,
    buildLogs: [],
  };

  projects.push(project);
  save(PROJECTS_KEY, projects);

  return project;
};

const MAX_LOGS = 50; // prevent localStorage overflow

export const updateProject = (
  projectId: string,
  updates: Partial<Project>
): Project | null => {
  const projects = safeParse<Project[]>(PROJECTS_KEY, []);

  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const updated = {
    ...projects[index],
    ...updates,
  };

  // Limit build logs
  if (updated.buildLogs && updated.buildLogs.length > MAX_LOGS) {
    updated.buildLogs = updated.buildLogs.slice(-MAX_LOGS);
  }

  projects[index] = updated;
  save(PROJECTS_KEY, projects);

  return updated;
};

export const getProjectById = (projectId: string): Project | null => {
  const projects = safeParse<Project[]>(PROJECTS_KEY, []);
  return projects.find((p) => p.id === projectId) || null;
};

// -------------------------
// Feedback
// -------------------------

export const getFeedback = (): Feedback[] => {
  return safeParse<Feedback[]>(FEEDBACK_KEY, []);
};

export const createFeedback = (
  userId: string,
  type: Feedback["type"],
  subject: string,
  message: string,
  rating: number | null
): Feedback => {
  const allFeedback = safeParse<Feedback[]>(FEEDBACK_KEY, []);

  const feedback: Feedback = {
    id: crypto.randomUUID(),
    userId,
    type,
    subject,
    message,
    rating,
    createdAt: new Date().toISOString(),
  };

  allFeedback.push(feedback);
  save(FEEDBACK_KEY, allFeedback);

  return feedback;
};
