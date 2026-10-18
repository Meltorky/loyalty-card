"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createCafeApi } from "../../lib/api";
import { isUsable, normalizeCustomer } from "../../lib/customer";
import { clearSession, loadSession, saveSession } from "../../lib/session";
import config from "./config";
import { fontVars } from "./fonts";
import LoginForm from "./LoginForm";
import LoyaltyCard from "./LoyaltyCard";
import Toast from "./Toast";
import styles from "./CarlosApp.module.css";

const api = createCafeApi(config.apiPath);
const POLL_MS = 8000; // how often an open card checks for news (simple polling, no real-time framework)

// The whole Carlos customer experience: loading -> LoginForm -> LoyaltyCard (+ notifications)
export default function CarlosApp() {
  const [status, setStatus] = useState("loading"); // loading | login | card
  const [customer, setCustomer] = useState(null);
  const [toast, setToast] = useState(null);
  const customerRef = useRef(null);
  const phoneRef = useRef(null);

  const update = useCallback((c) => {
    customerRef.current = c;
    setCustomer(c);
  }, []);

  // Auto-hide the notification
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  // Fetch the latest customer data and tell the customer if something changed
  const refresh = useCallback(async () => {
    const phone = phoneRef.current;
    if (!phone) return;
    try {
      const raw = await api.getCustomer(phone);
      const fresh = normalizeCustomer(raw, phone);
      if (!isUsable(fresh)) {
        console.warn("Unexpected get-customer response:", raw);
        return;
      }

      const prev = customerRef.current;
      if (prev && JSON.stringify(prev) === JSON.stringify(fresh)) return;

      if (prev) {
        const max = config.maxStamps;
        const redeemed = fresh.level > prev.level || (prev.stamps >= max && fresh.stamps < prev.stamps);
        if (redeemed) {
          setToast({
            id: Date.now(),
            type: "gift",
            title: "Gift redeemed!",
            text: `Enjoy! You're now Level ${fresh.level}.`,
          });
        } else if (fresh.stamps > prev.stamps) {
          setToast({
            id: Date.now(),
            type: "visit",
            title: "Visit added!",
            text:
              fresh.stamps >= max
                ? "You've collected every visit. Your gift is ready!"
                : `You're at ${fresh.stamps} / ${max} visits.`,
          });
        }
      }

      saveSession(config.slug, { phoneNumber: phone, carlos: fresh });
      update(fresh);
    } catch (err) {
      // Customer no longer exists -> back to login. Network error -> keep the saved card.
      if (err.status === 404) {
        clearSession(config.slug);
        phoneRef.current = null;
        update(null);
        setStatus("login");
      }
    }
  }, [update]);

  // On open: show the saved card instantly, then refresh it (this also triggers the "Visit added!" toast
  // if the cashier scanned the customer while the page was closed)
  useEffect(() => {
    const saved = loadSession(config.slug);
    const cached = saved && normalizeCustomer(saved.carlos, saved.phoneNumber);

    if (!saved || !isUsable(cached)) {
      clearSession(config.slug);
      setStatus("login");
      return;
    }

    phoneRef.current = saved.phoneNumber;
    update(cached);
    setStatus("card");
    refresh();
  }, [refresh, update]);

  // While the card is open and visible, check for news every few seconds
  useEffect(() => {
    if (status !== "card") return;
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [status, refresh]);

  const handleLogin = (phoneNumber, carlos) => {
    saveSession(config.slug, { phoneNumber, carlos });
    phoneRef.current = phoneNumber;
    update(carlos);
    setStatus("card");
  };

  const handleLogout = () => {
    clearSession(config.slug);
    phoneRef.current = null;
    update(null);
    setStatus("login");
  };

  return (
    <div className={`${styles.root} ${fontVars}`}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {status === "loading" && <div className={styles.loading} aria-busy="true" aria-label="Loading" />}
      {status === "login" && <LoginForm config={config} api={api} onSuccess={handleLogin} />}
      {status === "card" && customer && (
        <LoyaltyCard customer={customer} config={config} onLogout={handleLogout} />
      )}
    </div>
  );
}