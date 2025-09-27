import { RequestHandler } from "express";
import type {
  CloverStatusResponse,
  CloverItem,
  CloverCategory,
  CloverCatalogResponse,
} from "@shared/api";

const CLOVER_BASE = "https://api.clover.com/v3"; // Public Clover v3 API

function ensureEnv() {
  const token = process.env.CLOVER_API_KEY;
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  return { token, merchantId };
}

async function cloverFetch(path: string, init?: RequestInit) {
  const { token } = ensureEnv();
  if (!token) throw new Error("Missing CLOVER_API_KEY");
  const url = `${CLOVER_BASE}${path}`;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init?.headers as any) },
  });
  if (!res.ok) throw new Error(`Clover ${res.status}: ${await res.text()}`);
  return res.json();
}

export const getCloverStatus: RequestHandler = (_req, res) => {
  const hasKey = Boolean(process.env.CLOVER_API_KEY);
  const hasMerchant = Boolean(process.env.CLOVER_MERCHANT_ID);
  const response: CloverStatusResponse = {
    connected: hasKey && hasMerchant,
    missing: [
      !hasKey ? "CLOVER_API_KEY" : undefined,
      !hasMerchant ? "CLOVER_MERCHANT_ID" : undefined,
    ].filter(Boolean) as string[],
  };
  res.json(response);
};

export const listCategories: RequestHandler = async (_req, res) => {
  try {
    const { merchantId } = ensureEnv();
    if (!merchantId) throw new Error("Missing CLOVER_MERCHANT_ID");
    const data = await cloverFetch(`/merchants/${merchantId}/categories`);
    const categories: CloverCategory[] = (data?.elements || []).map(
      (c: any) => ({ id: String(c.id), name: String(c.name || "") }),
    );
    res.json({ categories });
  } catch (e: any) {
    res.status(502).json({ error: e?.message || String(e) });
  }
};

export const listItems: RequestHandler = async (req, res) => {
  try {
    const { merchantId } = ensureEnv();
    if (!merchantId) throw new Error("Missing CLOVER_MERCHANT_ID");
    const limit = Math.min(
      parseInt(String(req.query.limit ?? "100"), 10) || 100,
      500,
    );
    const expand = "categories"; // basic enrichment
    const data = await cloverFetch(
      `/merchants/${merchantId}/items?limit=${limit}&expand=${expand}`,
    );
    const items: CloverItem[] = (data?.elements || []).map((it: any) => ({
      id: String(it.id),
      name: String(it.name || ""),
      price: typeof it.price === "number" ? it.price : null,
      code: it.code ? String(it.code) : undefined,
      category: it.categories?.elements?.[0]?.name
        ? String(it.categories.elements[0].name)
        : undefined,
      imageUrl: it.imageUrl ? String(it.imageUrl) : undefined,
    }));
    res.json({ items });
  } catch (e: any) {
    res.status(502).json({ error: e?.message || String(e) });
  }
};

export const getCatalog: RequestHandler = async (_req, res) => {
  try {
    const [catsRes, itemsRes, stockRes] = await Promise.all([
      listCategoriesPromise(),
      listItemsPromise(),
      listStockPromise(),
    ]);
    const stockMap = new Map<string, number | null>(
      stockRes.map((s) => [s.itemId, s.quantity]),
    );
    const items = itemsRes.items.map((it) => ({
      ...it,
      stock: stockMap.get(it.id) ?? null,
    }));
    const payload: CloverCatalogResponse = {
      categories: catsRes.categories,
      items,
    };
    res.json(payload);
  } catch (e: any) {
    res.status(502).json({ error: e?.message || String(e) });
  }
};

export const listStock: RequestHandler = async (_req, res) => {
  try {
    const data = await listStockPromise();
    res.json({ stock: data });
  } catch (e: any) {
    res.status(502).json({ error: e?.message || String(e) });
  }
};

async function listStockPromise() {
  const { merchantId } = ensureEnv();
  if (!merchantId) throw new Error("Missing CLOVER_MERCHANT_ID");
  // Try multiple known paths; return first successful structure
  const candidates = [
    `/merchants/${merchantId}/inventory/item_stocks?limit=1000`,
    `/merchants/${merchantId}/item_stocks?limit=1000`,
    `/merchants/${merchantId}/inventory/items?limit=1000`,
  ];
  for (const path of candidates) {
    try {
      const data: any = await cloverFetch(path);
      const elements = Array.isArray(data) ? data : data?.elements;
      if (!elements) continue;
      // Try to normalize common shapes
      const out = elements
        .map((e: any) => {
          if (e.item && (e.quantity != null || e.stockCount != null)) {
            return {
              itemId: String(e.item.id || e.itemId || e.id),
              quantity: Number(e.quantity ?? e.stockCount ?? 0),
            };
          }
          if (
            (e.itemId || e.id) &&
            (e.quantity != null || e.stockCount != null)
          ) {
            return {
              itemId: String(e.itemId || e.id),
              quantity: Number(e.quantity ?? e.stockCount ?? 0),
            };
          }
          return undefined;
        })
        .filter(Boolean);
      if (out.length)
        return out as Array<{ itemId: string; quantity: number | null }>;
    } catch {
      // try next
    }
  }
  return [] as Array<{ itemId: string; quantity: number | null }>;
}

async function listCategoriesPromise() {
  const { merchantId } = ensureEnv();
  if (!merchantId) throw new Error("Missing CLOVER_MERCHANT_ID");
  const data = await cloverFetch(`/merchants/${merchantId}/categories`);
  const categories: CloverCategory[] = (data?.elements || []).map((c: any) => ({
    id: String(c.id),
    name: String(c.name || ""),
  }));
  return { categories };
}

async function listItemsPromise() {
  const { merchantId } = ensureEnv();
  if (!merchantId) throw new Error("Missing CLOVER_MERCHANT_ID");
  const data = await cloverFetch(
    `/merchants/${merchantId}/items?limit=200&expand=categories`,
  );
  const items: CloverItem[] = (data?.elements || []).map((it: any) => ({
    id: String(it.id),
    name: String(it.name || ""),
    price: typeof it.price === "number" ? it.price : null,
    code: it.code ? String(it.code) : undefined,
    category: it.categories?.elements?.[0]?.name
      ? String(it.categories.elements[0].name)
      : undefined,
    imageUrl: it.imageUrl ? String(it.imageUrl) : undefined,
  }));
  return { items };
}
