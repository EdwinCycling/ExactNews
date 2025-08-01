import { Chat } from "@google/genai";

export interface Article {
  title: string;
  summary: string;
  url: string;
  rating: number;
  publicationDate: string; // ISO 8601 date string
  sourceName: string;
}

export interface TurnoverDataPoint {
  period: string; // e.g., "Q1 2022"
  turnoverIndex: number;
}

export type Language = 'en' | 'nl';

export interface Category {
  key: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  searchQuery?: { [key in Language]: string };
  isReviewCategory?: boolean;
  isDataCategory?: boolean;
  persona?: { [key in Language]: string };
}

export type AppState = 'idle' | 'loading' | 'success' | 'error';

export type SortOrder = 'date' | 'rating' | null;

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  parts: [{ text: string }];
}