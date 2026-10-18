"use client";

import { useEffect, useState } from "react";
import { createCafeApi } from "../../../lib/api";
import { isUsable, normalizeCustomer } from "../../../lib/customer";
import { isValidPhone, normalizePhone } from "../../../lib/phone";
import { parseQrValue } from "../../../lib/qr";
import { clearAdminSession, hasAdminSession, saveAdminSession } from "../../../lib/session";
import config from "../config";
import { fontVars } from "../fonts";
import { CameraIcon } from "../icons";
import rootStyles from "../CarlosApp.module.css"; // same theme as the customer card
import AdminLogin from "./AdminLogin";
import CustomerPanel from "./CustomerPanel";
import QrScanner from "./QrScanner";
import styles from "./CarlosAdmin.module.css";

const api = createCafeApi(config.apiPath);

// Turns backend / network errors into friendly messages for the cashier
function friendly(err) {
  const msg = String(err?.serverMessage || "").toLowerCase();
  if (err?.status === 0) return "No connection to the server. Check the internet and try again.";
  if (msg.includes("redeem your gift")) return "This customer needs to redeem their gift first.";
  if (msg.includes("did not reach")) return `This customer hasn't reached ${config.maxStamps} visits yet.`;
  if (msg.includes("not found") || err?.status === 404) return "We couldn't find this customer. Please check the code and try again.";
  return "Something went wrong. Please try again.";
}

// Cashier page: sign in (guarded) -> scan QR -> customer -> add visit / redeem gift -> next customer
export default function CarlosAdmin() {
  const [auth, setAuth] = useState("checking"); // checking | out | in
  const [step, setStep] = useState("idle"); // idle | scanning | manual | loading | customer | error
  const [customer, setCustomer] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }
  const [done, setDone] = useState(null); // null | "visit" | "gift"  (what was done for this customer)
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Route guard: no saved cashier session -> login screen
  useEffect(() => {
    setAuth(hasAdminSession(config.slug) ? "in" : "out");
  }, []);

  const fail = (text) => {
    setNotice({ type: "error", text });
    setStep("error");
  };

  const startScan = () => {
    setCustomer(null);
    setNotice(null);
    setDone(null);
    setBusy(false);
    setStep("scanning");
  };

  const logout = () => {
    clearAdminSession(config.slug);
    setCustomer(null);
    setNotice(null);
    setDone(null);
    setStep("idle");
    setAuth("out");
  };

  // Look the customer up (and, for QR scans, make sure the QR is genuine)
  const loadCustomer = async (phoneNumber, expectedQr) => {
    setStep("loading");
    setNotice(null);
    setDone(null);
    try {
      const raw = await api.getCustomer(phoneNumber);
      const c = normalizeCustomer(raw, phoneNumber);
      if (!isUsable(c)) throw new Error("bad-shape");
      if (expectedQr && c.qrCodeIdentifier !== expectedQr) {
        return fail("This QR code isn't valid anymore. Ask the customer to refresh their card and try again.");
      }
      setCustomer(c);
      setStep("customer");
    } catch (err) {
      fail(friendly(err));
    }
  };

  const handleScan = (text) => {
    const parsed = parseQrValue(text);
    if (!parsed) return fail("That doesn't look like a loyalty card. Please scan the QR code on the customer's card.");
    if (parsed.slug !== config.slug) return fail(`This card belongs to a different cafe, not ${config.name}.`);
    loadCustomer(parsed.phoneNumber, parsed.qrCodeIdentifier);
  };

  const submitPhone = (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return setPhoneError("Enter 11 digits starting with 01");
    setPhoneError("");
    loadCustomer(phone);
  };

  const addVisit = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const raw = await api.addVisit(customer.qrCodeIdentifier);
      let updated = normalizeCustomer(raw, customer.phoneNumber);

      if (!isUsable(updated)) {
        try {
          updated = normalizeCustomer(await api.getCustomer(customer.phoneNumber), customer.phoneNumber);
        } catch {}
      }
      if (!isUsable(updated)) {
        setDone("visit");
        setNotice({ type: "error", text: "The visit was sent, but we couldn't confirm it. Scan the card again to check." });
      } else {
        updated = { ...updated, id: updated.id ?? customer.id };
        setCustomer(updated);
        setDone("visit");
        setNotice({
          type: "success",
          text:
            updated.stamps >= config.maxStamps
              ? `Visit added! ${updated.stamps} / ${config.maxStamps}. The gift is ready to redeem.`
              : `Visit added! ${updated.stamps} / ${config.maxStamps}.`,
        });
      }
    } catch (err) {
      setNotice({ type: "error", text: friendly(err) });
    }
    setBusy(false);
  };

  const redeem = async () => {
    if (customer.id === undefined || customer.id === null || customer.id === "") {
      return setNotice({ type: "error", text: "We couldn't identify this customer. Please scan the card again." });
    }
    setBusy(true);
    setNotice(null);
    try {
      const raw = await api.redeemGift(customer.id);
      let updated = normalizeCustomer(raw, customer.phoneNumber);
      if (!isUsable(updated)) updated = { ...customer, stamps: 0, level: customer.level + 1 };
      updated = { ...updated, id: updated.id ?? customer.id };
      setCustomer(updated);
      setDone("gift");
      setNotice({ type: "success", text: `Gift redeemed! ${updated.name} is now Level ${updated.level}.` });
    } catch (err) {
      setNotice({ type: "error", text: friendly(err) });
    }
    setBusy(false);
  };

  const wrapperClass = `${rootStyles.root} ${fontVars}`;

  if (auth === "checking") {
    return (
      <div className={wrapperClass}>
        <div className={rootStyles.loading} aria-busy="true" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {auth === "out" && (
        <AdminLogin
          config={config}
          api={api}
          onSuccess={() => {
            saveAdminSession(config.slug);
            setAuth("in");
          }}
        />
      )}

      {auth === "in" && (
        <>
          <section className={styles.panel}>
            <header className={styles.top}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.logo} src={config.logo} alt={config.name} />
              <span className={styles.tag}>Staff</span>
            </header>

            <div className={styles.body}>
              {step === "idle" && (
                <>
                  <div>
                    <h1 className={styles.title}>Ready to scan</h1>
                    <p className={styles.sub}>Scan a customer&apos;s QR code to add a visit or redeem a gift.</p>
                  </div>
                  <button className={styles.scanBtn} onClick={startScan}>
                    <CameraIcon size={30} /> Scan customer QR
                  </button>
                  <button className={styles.link} onClick={() => setStep("manual")}>
                    Can&apos;t scan? Enter phone number
                  </button>
                </>
              )}

              {step === "scanning" && (
                <QrScanner
                  onScan={handleScan}
                  onError={fail}
                  onCancel={() => setStep("idle")}
                />
              )}

              {step === "manual" && (
                <form className={styles.manual} onSubmit={submitPhone} noValidate>
                  <h1 className={styles.title}>Find by phone</h1>
                  <label htmlFor="admin-phone" className={styles.label}>Customer phone number</label>
                  <input
                    id="admin-phone"
                    className={styles.input}
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(normalizePhone(e.target.value).slice(0, 11));
                      setPhoneError("");
                    }}
                    aria-invalid={!!phoneError}
                  />
                  {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
                  <button className={styles.primary} type="submit">Find customer</button>
                  <button className={styles.secondary} type="button" onClick={() => setStep("idle")}>Back</button>
                </form>
              )}

              {step === "loading" && (
                <div className={styles.center} aria-busy="true">
                  <div className={styles.spinner} />
                  <p className={styles.sub}>Looking up the customer…</p>
                </div>
              )}

              {step === "customer" && customer && (
                <CustomerPanel
                  customer={customer}
                  max={config.maxStamps}
                  notice={notice}
                  done={done}
                  busy={busy}
                  onAddVisit={addVisit}
                  onRedeem={redeem}
                  onNext={startScan}
                />
              )}

              {step === "error" && (
                <>
                  <p className={`${styles.notice} ${styles.error}`} role="alert">{notice?.text}</p>
                  <button className={styles.primary} onClick={startScan}>Scan again</button>
                  <button className={styles.link} onClick={() => setStep("manual")}>Enter phone number instead</button>
                </>
              )}
            </div>
          </section>

          <button className={styles.logout} onClick={logout}>Sign out</button>
        </>
      )}
    </div>
  );
}