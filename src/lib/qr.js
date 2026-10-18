import { isValidPhone } from "./phone";

// The customer's QR code contains:  <cafe>:<phoneNumber>:<qrCodeIdentifier>
// The cashier app needs the phone number to call get-customer, and the identifier to call add-visit
// (and to make sure the QR is genuine).
export const buildQrValue = (slug, phoneNumber, qrCodeIdentifier) =>
  `${slug}:${phoneNumber}:${qrCodeIdentifier}`;

export function parseQrValue(text) {
  const parts = String(text || "")
    .trim()
    .split(":");
  if (parts.length !== 3) return null;
  const [slug, phoneNumber, qrCodeIdentifier] = parts;
  if (!slug || !isValidPhone(phoneNumber) || !qrCodeIdentifier) return null;
  return { slug, phoneNumber, qrCodeIdentifier };
}
