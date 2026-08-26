import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, LockKeyhole, Shield, User } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import "../App.css";

export default function Login() {
  const { login, setupAdmin, user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  if (user) return <Navigate to="/" replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    window.setTimeout(() => {
      if (!isConfigured) {
        const result = setupAdmin(username, password);
        if (!result.ok) {
          setError(result.error ?? "Unable to create administrator.");
          setBusy(false);
          return;
        }

        setMessage("Administrator created. Sign in with the credentials you just entered.");
        setPassword("");
        setBusy(false);
        return;
      }

      const result = login(username, password);
      if (!result.ok) {
        setError(result.error ?? "Unable to sign in.");
        setBusy(false);
        return;
      }

      navigate("/", { replace: true });
      setBusy(false);
    }, 180);
  }

  const setupMode = !isConfigured;

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="login-card">
        <div className="login-brand-icon"><Shield size={34} strokeWidth={1.8} /></div>
        <span className="login-eyebrow">SECURITY OPERATIONS</span>
        <h1>SentinelSOC</h1>
        <p className="login-subtitle">
          {setupMode ? "Create the administrator account to get started." : "Sign in to access the security operations center."}
        </p>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>Admin name</span>
            <div className="login-input-wrap">
              <User size={16} />
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter admin name" autoComplete="username" required />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="login-input-wrap">
              <LockKeyhole size={16} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} placeholder="Enter password" autoComplete={setupMode ? "new-password" : "current-password"} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <div className="login-error" role="alert"><AlertCircle size={15} />{error}</div>}
          {message && <div className="login-success" role="status">{message}</div>}

          <button className="login-submit" disabled={busy}>
            {busy ? (setupMode ? "Creating administrator..." : "Authenticating...") : (setupMode ? "Create administrator" : "Sign in")}
          </button>
        </form>

        <div className="login-security-note">
          <Shield size={14} />
          <span>{setupMode ? "Your administrator credentials are chosen by you." : "Administrator authentication required."}</span>
        </div>

        <div className="login-footer">SentinelSOC v1.0.0 · Security Operations Platform</div>
      </div>
    </div>
  );
}
