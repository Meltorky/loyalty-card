"use client";

import { useState } from "react";
import { isUsable, normalizeCustomer } from "../../lib/customer";
import { isValidPhone, normalizePhone } from "../../lib/phone";
import styles from "./LoginForm.module.css";

function validate({ firstName, lastName, phoneNumber }) {
  const errors = {};
  if (!firstName) errors.firstName = "Enter your first name";
  else if (firstName.length > 30) errors.firstName = "Max 30 characters";

  if (!lastName) errors.lastName = "Enter your last name";
  else if (lastName.length > 30) errors.lastName = "Max 30 characters";

  if (!isValidPhone(phoneNumber)) errors.phoneNumber = "Enter 11 digits starting with 01";
  return errors;
}

export default function LoginForm({ config, api, onSuccess }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "phoneNumber" ? normalizePhone(value).slice(0, 11) : value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setServerError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber,
    };
    const found = validate(payload);
    if (Object.keys(found).length) return setErrors(found);

    setLoading(true);
    try {
      // 1) login (the backend creates the customer if it doesn't exist)
      const loginRaw = await api.login(payload);

      // 2) then load the customer with get-customer/{phoneNumber}
      const customerRaw = await api.getCustomer(payload.phoneNumber).catch(() => null);

      const customer = [
        normalizeCustomer(customerRaw, payload.phoneNumber),
        normalizeCustomer(loginRaw, payload.phoneNumber),
      ].find(isUsable);

      if (!customer) {
        console.warn("Unexpected server response", { loginRaw, customerRaw });
        throw new Error("bad-shape");
      }
      onSuccess(payload.phoneNumber, customer);
    } catch (err) {
      setServerError(
        err.message === "bad-shape"
          ? "The server answered, but we couldn't read your card. Please tell our team."
          : `We couldn't reach ${config.name}. Check your connection and try again.`
      );
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.banner}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.logo} src={config.logo} alt={config.name} />
      </div>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div>
          <h1 className={styles.heading}>Get your card</h1>
          <p className={styles.hint}>{config.tagline} New here or coming back, just enter your details.</p>
        </div>

        <div className={styles.row}>
          <Field label="First name" name="firstName" value={form.firstName} onChange={onChange}
            error={errors.firstName} autoComplete="given-name" maxLength={30} />
          <Field label="Last name" name="lastName" value={form.lastName} onChange={onChange}
            error={errors.lastName} autoComplete="family-name" maxLength={30} />
        </div>

        <Field label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={onChange}
          error={errors.phoneNumber} type="tel" inputMode="numeric" autoComplete="tel"
          placeholder="01XXXXXXXXX" />

        {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Opening your card…" : "Open my card"}
        </button>
      </form>
    </div>
  );
}

// Also used by the cashier login
export function Field({ label, name, error, ...props }) {
  const id = `f-${name}`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
        className={error ? styles.inputError : undefined} {...props} />
      {error && <span id={`${id}-e`} className={styles.error}>{error}</span>}
    </div>
  );
}