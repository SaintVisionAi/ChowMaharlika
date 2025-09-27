import { RequestHandler } from "express";
import { ChatRequest, ChatResponse, ChatMessage } from "@shared/api";

const OPENAI_BASE =
  process.env.OPENAI_BASE_URL ||
  process.env.OPENAI_ENDPOINT ||
  "https://api.openai.com/v1";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AZURE_DEPLOYMENT = process.env.OPENAI_DEPLOYMENT_NAME;
const AZURE_API_VERSION =
  process.env.OPENAI_API_VERSION || "2024-02-15-preview";

const IS_AZURE = /azure\.com/.test(OPENAI_BASE) || Boolean(AZURE_DEPLOYMENT);

const systemMessage: ChatMessage = {
  role: "system",
  content:
    "You are SaintChow, a helpful, concise assistant for Maharlika Seafood Mart & Chow. Tone: professional, warm, and efficient. Keep answers short unless asked for detail. Never reveal secrets. If asked about inventory/orders, answer generally unless the backend provides data.",
};

export const chatHandler: RequestHandler = async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res
      .status(503)
      .json({
        message: "Assistant not configured. Add OPENAI_API_KEY.",
      } satisfies ChatResponse);
    return;
  }

  const body = (req.body || {}) as ChatRequest;
  const model = body.model || DEFAULT_MODEL;
  const messages = [systemMessage, ...(body.messages || [])];

  try {
    const url = IS_AZURE
      ? `${OPENAI_BASE.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(AZURE_DEPLOYMENT || "")}/chat/completions?api-version=${encodeURIComponent(AZURE_API_VERSION)}`
      : `${OPENAI_BASE.replace(/\/$/, "")}/chat/completions`;

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (IS_AZURE) headers["api-key"] = apiKey;
    else headers["authorization"] = `Bearer ${apiKey}`;

    const payload: any = IS_AZURE
      ? { messages, temperature: 0.3 }
      : { model, messages, temperature: 0.3 };

    const r = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      res
        .status(502)
        .json({ message: `Upstream error: ${text}` } satisfies ChatResponse);
      return;
    }
    const data: any = await r.json();
    const content: string =
      data.choices?.[0]?.message?.content ?? "Sorry, I had trouble responding.";
    res.json({ message: content } satisfies ChatResponse);
  } catch (err: any) {
    res
      .status(500)
      .json({
        message: `Server error: ${err?.message || err}`,
      } satisfies ChatResponse);
  }
};
