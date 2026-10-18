"use client";

import { useState } from "react";
import { Field } from "../LoginForm";
import styles from "../LoginForm.module.css"; // same look as the customer login

export default function AdminLogin({ config, api, onSuccess }) {
  const [form, setForm] = useState({ userName: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setServerError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.userName.trim()) found.userName = "Enter your username";
    if (!form.password) found.password = "Enter your password";
    if (Object.keys(found).length) return setErrors(found);

    setLoading(true);
    try {
      // 200 = OK, 401 = wrong credentials (the response body isn't needed)
      await api.adminLogin({ userName: form.userName.trim(), password: form.password });
      onSuccess();
    } catch (err) {
      setServerError(
        err.status === 401 || err.status === 403
          ? "Wrong username or password."
          : err.status === 0
            ? `We couldn't reach ${config.name}. Check your connection and try again.`
            : "Something went wrong. Please try again."
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
          <h1 className={styles.heading}>Staff sign in</h1>
          <p className={styles.hint}>Cashier access only.</p>
        </div>

        <Field label="Username" name="userName" value={form.userName} onChange={onChange}
          error={errors.userName} autoComplete="username" autoCapitalize="none" autoCorrect="off" />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange}
          error={errors.password} autoComplete="current-password" />

        {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}