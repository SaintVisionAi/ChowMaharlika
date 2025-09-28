import { RequestHandler } from "express";
import { ChatRequest, ChatResponse, ChatMessage } from "@shared/api";

// OpenAI/Azure config
const OPENAI_BASE = process.env.OPENAI_BASE_URL || process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AZURE_DEPLOYMENT = process.env.OPENAI_DEPLOYMENT_NAME;
const AZURE_API_VERSION = process.env.OPENAI_API_VERSION || "2024-02-15-preview";
const IS_AZURE = /azure\.com/.test(OPENAI_BASE) || Boolean(AZURE_DEPLOYMENT);

// Anthropic config
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_ENDPOINT = process.env.ANTHROPIC_URL_ENDPOINT || "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || "2023-06-01";
const MAX_TOKENS = Number(process.env.MAX_TOKENS || 1024);

const systemMessage: ChatMessage = {
  role: "system",
  content:
    "You are SaintChow, a helpful, concise assistant for Maharlika Seafood Mart & Chow. Tone: professional, warm, and efficient. Keep answers short unless asked for detail. Never reveal secrets. If asked about inventory/orders, answer generally unless the backend provides data.",
};

export const chatHandler: RequestHandler = async (req, res) => {
  const body = (req.body || {}) as ChatRequest;

  try {
    // Prefer Anthropic if configured
    if (ANTHROPIC_KEY) {
      const messagesForAnthropic = (body.messages || []).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const r = await fetch(ANTHROPIC_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemMessage.content,
          messages: messagesForAnthropic.length ? messagesForAnthropic : [{ role: "user", content: "Hello" }],
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        res.status(502).json({ message: `Anthropic error: ${text}` } satisfies ChatResponse);
        return;
      }
      const data: any = await r.json();
      const content: string = data?.content?.[0]?.text ?? "Sorry, I had trouble responding.";
      res.json({ message: content } satisfies ChatResponse);
      return;
    }

    // Otherwise fallback to OpenAI/Azure
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      res.status(503).json({ message: "Assistant not configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY." } satisfies ChatResponse);
      return;
    }

    const model = body.model || DEFAULT_OPENAI_MODEL;
    const messages = [systemMessage, ...(body.messages || [])];

    const url = IS_AZURE
      ? `${OPENAI_BASE.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(AZURE_DEPLOYMENT || "")}/chat/completions?api-version=${encodeURIComponent(AZURE_API_VERSION)}`
      : `${OPENAI_BASE.replace(/\/$/, "")}/chat/completions`;

    const headers: Record<string, string> = { "content-type": "application/json" };
    if (IS_AZURE) headers["api-key"] = openaiKey;
    else headers["authorization"] = `Bearer ${openaiKey}`;

    const payload: any = IS_AZURE ? { messages, temperature: 0.3 } : { model, messages, temperature: 0.3 };

    const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!r.ok) {
      const text = await r.text();
      res.status(502).json({ message: `OpenAI error: ${text}` } satisfies ChatResponse);
      return;
    }
    const data: any = await r.json();
    const content: string = data.choices?.[0]?.message?.content ?? "Sorry, I had trouble responding.";
    res.json({ message: content } satisfies ChatResponse);
  } catch (err: any) {
    res.status(500).json({ message: `Server error: ${err?.message || err}` } satisfies ChatResponse);
  }
};
