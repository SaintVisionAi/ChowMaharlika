import { RequestHandler } from "express";
import { CloverStatusResponse } from "@shared/api";

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
