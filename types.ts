import { Chat } from "@google/genai";

export interface Article {
  title: string;
  summary: string;
  url: string;
  rating: number;
  publicationDate: string; // ISO 8601 date string
  sourceName: string;
}

export type Language = 'en' | 'nl' | 'de';

export interface Category {
  key: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  searchQuery?: { [key in Language]: string };
  persona?: { [key in Language]: string };
}

export interface RoleTemplate {
  key: string;
  title: { [key in Language]: string };
  text: { [key in Language]: string };
}

export interface Department {
  key: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  roles: RoleTemplate[];
}

export interface ActionItem {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ChatSummary {
  summary: string;
  actions: ActionItem[];
  suggestedQuestion: string;
}

export type AppState = 'idle' | 'loading' | 'success' | 'error';

export type SortOrder = 'date' | 'rating' | null;

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  parts: [{ text: string }];
}

export interface ReadingLink {
  title: string;
  url: string;
}

export interface Book {
  title: string;
  author: string;
  amazonSearchUrl: string;
}

export interface TedTalk {
  title: string;
  speaker: string;
  publicationDate: string;
  summary: string;
  youtubeSearchUrl: string;
}

export interface TedTalkResponse {
  talks: TedTalk[];
  relatedSuggestions?: string[];
}

export interface LinkedInLearningCourse {
  title: string;
  description: string;
  url: string;
}

export interface ChatMemory {
  id: string;
  userId: string;
  extensiveSummary: string; // Detailed summary to give AI a starting point for a new chat
  categoryKey: string; // Only store the category key, not the full object
  roleKey?: string; // Only store the role key, not the full object
  createdAt: string;
  updatedAt: string;
}