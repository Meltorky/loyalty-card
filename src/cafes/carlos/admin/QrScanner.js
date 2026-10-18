"use client";

import { useEffect, useRef } from "react";
import styles from "./CarlosAdmin.module.css";

const READER_ID = "carlos-qr-reader";

function cameraMessage(e) {
  const s = `${e?.name || ""} ${e?.message || e || ""}`;
  if (/NotAllowed|Permission|denied/i.test(s))
    return "Camera permission is blocked. Allow camera access for this site in your browser settings, then try again.";
  if (/NotFound|Devices not found|no camera/i.test(s)) return "No camera was found on this device.";
  return "We couldn't start the camera. Please try again.";
}

// Opens the phone camera and reports the first QR code it reads.
// NOTE: browsers only allow the camera on https:// pages (or localhost).
export default function QrScanner({ onScan, onError, onCancel }) {
  const handled = useRef(false);
  const callbacks = useRef({ onScan, onError });

  useEffect(() => {
    callbacks.current = { onScan, onError };
  });

  useEffect(() => {
    let scanner = null;
    let started = false;
    let cancelled = false;

    async function stop() {
      try {
        if (scanner && started) {
          started = false;
          await scanner.stop();
          scanner.clear();
        }
      } catch {}
    }

    async function start() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        callbacks.current.onError("The camera needs a secure (https) connection. Please open this page over https.");
        return;
      }
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        scanner = new Html5Qrcode(READER_ID);
        await scanner.start(
          { facingMode: "environment" }, // back camera
          { fps: 10, aspectRatio: 1 },
          (text) => {
            if (handled.current) return;
            handled.current = true;
            navigator.vibrate?.(60);
            callbacks.current.onScan(text);
          },
          () => {} // "no QR in this frame" – ignore
        );
        started = true;
        if (cancelled) await stop();
      } catch (e) {
        if (!cancelled) callbacks.current.onError(cameraMessage(e));
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return (
    <div className={styles.scanner}>
      <div className={styles.readerWrap}>
        <div id={READER_ID} className={styles.reader} />
        <span className={styles.frame} aria-hidden="true" />
      </div>
      <p className={styles.scanHint}>Point the camera at the customer&apos;s QR code</p>
      <button className={styles.secondary} onClick={onCancel}>Cancel</button>
    </div>
  );
}