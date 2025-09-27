/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse { message: string }

export interface CloverStatusResponse { connected: boolean; missing: string[] }

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage { role: ChatRole; content: string }
export interface ChatRequest { messages: ChatMessage[]; model?: string }
export interface ChatResponse { message: string }
