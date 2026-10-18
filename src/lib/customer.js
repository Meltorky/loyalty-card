// Turns whatever the backend returns into the shape the card needs:
// { id, name, phoneNumber, stamps, level, qrCodeIdentifier }
// Your API answers with GlobalResponse<Carlos> (the customer is wrapped inside),
// so we unwrap it. It also tolerates alternative field names.

const looksLikeCustomer = (o) =>
  !!o && typeof o === "object" && ("stamps" in o || "qrCodeIdentifier" in o || "phoneNumber" in o);

function unwrap(raw) {
  let o = raw;
  for (let i = 0; i < 3; i++) {
    if (!o || typeof o !== "object" || Array.isArray(o) || looksLikeCustomer(o)) break;
    const inner = Object.values(o).filter((v) => v && typeof v === "object" && !Array.isArray(v));
    o = inner.find(looksLikeCustomer) ?? inner[0];
  }
  return o;
}

const pick = (o, keys) => {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
  return undefined;
};

export function normalizeCustomer(raw, fallbackPhone = "") {
  const o = unwrap(raw);
  if (!o || typeof o !== "object") return null;

  const name = pick(o, ["name", "fullName", "customerName"]) ?? [o.firstName, o.lastName].filter(Boolean).join(" ");
  const stamps = Number(pick(o, ["stamps", "stampCount", "stampsCount", "visits"]));
  const level = Number(pick(o, ["level", "tier"]));

  return {
    id: o.id,
    name: String(name || ""),
    phoneNumber: String(pick(o, ["phoneNumber", "phone"]) ?? fallbackPhone ?? ""),
    stamps: Number.isFinite(stamps) ? stamps : 0,
    level: Number.isFinite(level) && level > 0 ? level : 1,
    qrCodeIdentifier: String(pick(o, ["qrCodeIdentifier", "qrCode", "qrIdentifier", "qr"]) ?? ""),
  };
}

// A customer is usable only if the server really sent us something about them
export const isUsable = (c) => !!c && (!!c.name || !!c.qrCodeIdentifier);