import { Chat } from "@google/genai";

export interface Article {
  title: string;
  summary: string;
  url: string;
  rating: number;
  publicationDate: string; // ISO 8601 date string
  sourceName: string;
}

export type Language = 'en' | 'nl';

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

export interface ChatSummary {
  summary: string;
  actions: string[];
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
