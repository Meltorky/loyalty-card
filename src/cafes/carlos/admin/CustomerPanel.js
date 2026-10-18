"use client";

import { Gem, Gift } from "../icons";
import styles from "./CarlosAdmin.module.css";

// Shows the scanned customer + the right buttons:
//   0-4 visits  -> "Add visit"
//   5 visits    -> "Redeem gift"
//   always      -> "Scan next customer"
export default function CustomerPanel({ customer, max, notice, done, busy, onAddVisit, onRedeem, onNext }) {
  const filled = Math.max(0, Math.min(customer.stamps, max));
  const canRedeem = customer.stamps >= max;
  const canAdd = !canRedeem && !done; // one visit per scan, so nobody gets added twice by accident
  const nextIsPrimary = !!done && !canRedeem;

  return (
    <div className={styles.customer}>
      <div className={styles.who}>
        <div className={styles.whoText}>
          <p className={styles.label}>Customer</p>
          <h1 className={styles.cname}>{customer.name}</h1>
          <p className={styles.phone}>{customer.phoneNumber}</p>
        </div>
        <div className={styles.levelChip} aria-label={`Level ${customer.level}`}>
          <span>Level</span>
          <strong>{customer.level}</strong>
        </div>
      </div>

      <div>
        <ul className={styles.stamps} aria-label={`${filled} of ${max} visits`}>
          {Array.from({ length: max }, (_, i) => (
            <li key={i} className={`${styles.stamp} ${i < filled ? styles.on : ""}`}>
              {i === max - 1 ? <Gift /> : <Gem />}
            </li>
          ))}
        </ul>
        <p className={styles.count}>{filled} / {max} visits</p>
      </div>

      {notice && (
        <p className={`${styles.notice} ${styles[notice.type]}`} role="status">{notice.text}</p>
      )}

      <div className={styles.actions}>
        {canAdd && (
          <button className={styles.primary} onClick={onAddVisit} disabled={busy}>
            {busy ? "Adding…" : "Add visit"}
          </button>
        )}
        {canRedeem && (
          <button className={styles.primary} onClick={onRedeem} disabled={busy}>
            <Gift size={22} /> {busy ? "Redeeming…" : "Redeem gift"}
          </button>
        )}
        <button className={nextIsPrimary ? styles.primary : styles.secondary} onClick={onNext} disabled={busy}>
          Scan next customer
        </button>
      </div>
    </div>
  );
}