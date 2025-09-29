import { RequestHandler } from "express";

export const getEcommConfig: RequestHandler = (_req, res) => {
  const url = process.env.CLOVER_ECOMM_URL || null;
  const pub = process.env.CLOVER_ECOMM_PUBLIC ? true : false;
  const hasPrivate = process.env.CLOVER_ECOMM_PRIVATE ? true : false;
  res.json({ url, enabled: Boolean(url), hasPublic: pub, hasPrivate });
};
