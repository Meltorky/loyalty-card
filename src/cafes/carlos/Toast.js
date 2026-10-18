"use client";

import { Check, Gift } from "./icons";
import styles from "./Toast.module.css";

// Friendly notification that slides in from the top ("Visit added!" / "Gift redeemed!")
export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={styles.wrap} style={{ position: "fixed", zIndex: 50 }}>
      <div key={toast.id} className={styles.toast} role="status" aria-live="polite" onClick={onClose}>
        <span className={styles.icon}>{toast.type === "gift" ? <Gift size="55%" /> : <Check size="55%" />}</span>
        <span className={styles.text}>
          <strong>{toast.title}</strong>
          <span>{toast.text}</span>
        </span>
      </div>
    </div>
  );
}