"use client";

import { QRCodeSVG } from "qrcode.react";
import { buildQrValue } from "../../lib/qr";
import { Gem, Gift } from "./icons";
import styles from "./LoyaltyCard.module.css";

// 24-tooth scalloped seal points, computed once
function burst(n, R, r) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(50 + rad * Math.cos(a)).toFixed(2)},${(50 + rad * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}
const BURST = burst(24, 48, 43);

// Golden seal with the level number in the middle
function LevelMedal({ level }) {
  const size = level < 10 ? 32 : level < 100 ? 25 : 19;
  return (
    <div className={styles.medal} role="img" aria-label={`Level ${level}`}>
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="carlos-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4dc96" />
            <stop offset="0.5" stopColor="#d4a94a" />
            <stop offset="1" stopColor="#a97a22" />
          </linearGradient>
        </defs>
        <polygon points={BURST} fill="url(#carlos-gold)" />
        <circle className={styles.medalDisc} cx="50" cy="50" r="35" />
        <circle cx="50" cy="50" r="31" fill="none" stroke="url(#carlos-gold)" strokeWidth="1.2" />
        <text className={styles.medalLabel} x="50" y="33">LEVEL</text>
        <text className={styles.medalNumber} x="50" y="57" fontSize={size} dominantBaseline="central">
          {level}
        </text>
      </svg>
    </div>
  );
}

export default function LoyaltyCard({ customer, config, onLogout }) {
  const { name, stamps, level, qrCodeIdentifier, phoneNumber } = customer;
  const max = config.maxStamps;
  const filled = Math.max(0, Math.min(stamps, max));
  const left = max - filled;

  // The QR holds cafe + phone + identifier so the cashier app can look the customer up and verify it
  const qrValue = qrCodeIdentifier && phoneNumber ? buildQrValue(config.slug, phoneNumber, qrCodeIdentifier) : "";

  const message =
    left === 0
      ? "Your gift is waiting. Show the QR code to our team."
      : `${left} more ${left === 1 ? "visit" : "visits"} until your gift.`;

  return (
    <>
      <article className={styles.card} aria-label={`${config.name} loyalty card`}>
        {/* logo fills the whole upper part */}
        <header className={styles.top}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src={config.logo} alt={config.name} />
        </header>

        {/* name + level seal in the lower part */}
        <section className={styles.identity}>
          <div className={styles.holder}>
            <p className={styles.small}>Card holder</p>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <LevelMedal level={level} />
        </section>

        <section className={styles.stampsWrap} aria-label={`${filled} of ${max} visits`}>
          <div className={styles.stampsHead}>
            <span>Visits</span>
            <strong>{filled} / {max}</strong>
          </div>
          <ul className={styles.stamps}>
            {Array.from({ length: max }, (_, i) => {
              const isGift = i === max - 1;
              const on = i < filled;
              return (
                <li key={i}
                  className={`${styles.stamp} ${on ? styles.on : ""} ${isGift ? styles.gift : ""}`}
                  style={{ "--i": i }}>
                  {isGift ? <Gift /> : <Gem />}
                </li>
              );
            })}
          </ul>
          <p className={styles.message}>{message}</p>
        </section>

        <div className={styles.tear} aria-hidden="true" />

        <section className={styles.qr}>
          {qrValue ? (
            <>
              <div className={styles.qrBox}>
                <QRCodeSVG value={qrValue} size={176} level="M" bgColor="#ffffff" fgColor="#2a1d14"
                  style={{ width: "100%", height: "auto" }} />
              </div>
              <p className={styles.qrHint}>Show this code at the counter to collect a stamp</p>
            </>
          ) : (
            <p className={styles.qrHint}>Your QR code isn&apos;t available yet. Please ask our team.</p>
          )}
        </section>
      </article>

      <button className={styles.logout} onClick={onLogout}>Not you? Switch card</button>
    </>
  );
}