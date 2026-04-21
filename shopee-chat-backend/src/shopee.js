import crypto from "node:crypto";
import axios from "axios";

const ENV = (process.env.SHOPEE_ENV || "live").toLowerCase();
const BASE_URL =
  ENV === "test"
    ? "https://partner.test-stable.shopeemobile.com"
    : "https://partner.shopeemobile.com";

export function getBaseUrl() {
  return BASE_URL;
}

export function shopeeSign(baseString) {
  const key = String(process.env.SHOPEE_PARTNER_KEY || "");
  if (!key) throw new Error("SHOPEE_PARTNER_KEY belum diisi");
  return crypto.createHmac("sha256", key).update(baseString).digest("hex");
}

export function buildSignedQuery(path, timestamp, opts = {}) {
  const partnerId = String(process.env.SHOPEE_PARTNER_ID || "");
  if (!partnerId) throw new Error("SHOPEE_PARTNER_ID belum diisi");

  const parts = [partnerId, path, String(timestamp)];
  if (opts.accessToken && opts.shopId) {
    parts.push(String(opts.accessToken), String(opts.shopId));
  }

  const sign = shopeeSign(parts.join(""));
  const query = new URLSearchParams({
    partner_id: partnerId,
    timestamp: String(timestamp),
    sign
  });

  if (opts.accessToken && opts.shopId) {
    query.set("access_token", String(opts.accessToken));
    query.set("shop_id", String(opts.shopId));
  }

  return query.toString();
}

export function buildAuthUrl({ redirectUrl }) {
  const path = "/api/v2/shop/auth_partner";
  const ts = Math.floor(Date.now() / 1000);
  const query = buildSignedQuery(path, ts);
  const u = new URL(`${BASE_URL}${path}?${query}`);
  u.searchParams.set("redirect", redirectUrl);
  return u.toString();
}

export async function callShopee(path, method = "GET", { query = {}, body } = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await axios.request({
    url,
    method,
    params: query,
    data: body,
    timeout: 25000,
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
}

export async function callShopeeAuth(
  path,
  method = "GET",
  { shopId, accessToken, query = {}, body } = {}
) {
  const ts = Math.floor(Date.now() / 1000);
  const signed = buildSignedQuery(path, ts, { shopId, accessToken });
  const signedQuery = Object.fromEntries(new URLSearchParams(signed));
  const finalQuery = { ...signedQuery, ...query };
  return callShopee(path, method, { query: finalQuery, body });
}

export function verifyLivePushSignature(rawBody, headers = {}) {
  const key = String(process.env.LIVE_PUSH_PARTNER_KEY || "");
  if (!key) return true;

  const expected = crypto.createHmac("sha256", key).update(rawBody).digest("hex");
  const candidates = [
    headers["x-shopee-hmac-sha256"],
    headers["x-shopee-signature"],
    headers.authorization
  ]
    .filter(Boolean)
    .map((x) => String(x).replace(/^Bearer\s+/i, "").trim().toLowerCase());

  return candidates.includes(expected.toLowerCase());
}
