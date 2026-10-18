import { apiBase } from "./config";

export class ApiError extends Error {
  constructor(status, message, serverMessage = "") {
    super(message);
    this.status = status; // 0 = network error
    this.serverMessage = serverMessage; // message sent by the backend, if any
  }
}

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new ApiError(0, "network");
  }

  let body = null;
  try {
    const text = await res.text();
    body = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    throw new ApiError(res.status, "request-failed", body?.message || body?.error || body?.detail || "");
  }
  return body;
}

const json = (payload) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

// One API client per cafe: createCafeApi("carlos") -> {API_URL}carlos/...
export function createCafeApi(apiPath) {
  const root = `${apiBase}${apiPath}`;
  return {
    // ---- customer ----
    login: (payload) => request(`${root}/login`, json(payload)),
    getCustomer: (phoneNumber) =>
      request(`${root}/get-customer/${encodeURIComponent(phoneNumber)}`, { cache: "no-store" }),

    // ---- cashier / admin ----
    adminLogin: (payload) => request(`${root}/admin-login`, json(payload)), // { userName, password }
    addVisit: (qrCodeIdentifier) =>
      request(`${root}/add-visit/${encodeURIComponent(qrCodeIdentifier)}`, { method: "POST" }),
    redeemGift: (carlosId) =>
      request(`${root}/redeem-gift/${encodeURIComponent(carlosId)}`, { method: "POST" }),
  };
}