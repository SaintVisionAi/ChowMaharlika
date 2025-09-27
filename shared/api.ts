/** Shared types */
export interface DemoResponse {
  message: string;
}

export interface CloverStatusResponse {
  connected: boolean;
  missing: string[];
}

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}
export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}
export interface ChatResponse {
  message: string;
}

export interface CloverCategory {
  id: string;
  name: string;
}
export interface CloverItem {
  id: string;
  name: string;
  price: number | null;
  code?: string;
  category?: string;
  imageUrl?: string;
  stock?: number | null;
}
export interface CloverStock {
  itemId: string;
  quantity: number | null;
}
export interface CloverCatalogResponse {
  categories: CloverCategory[];
  items: CloverItem[];
}
