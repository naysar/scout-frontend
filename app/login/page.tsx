"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://scout-backend-production-cfb9.up.railway.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Login failed."); setLoading(false); return; }
      router.push("/dashboard");
    } catch {
      setError("Could not connect to server.");
      setLoading(false);
    }
  };

  return (
    <main style={{ background: "#0a0908", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0e0d0a inset !important;
          -webkit-text-fill-color: #f0ebe3 !important;
          border: 1px solid #2a2820 !important;
        }
      `}</style>

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(#1e1c18 1px, transparent 1px), linear-gradient(90deg, #1e1c18 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
      }} />

      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span onClick={() => router.push("/")} style={{ fontSize: "14px", fontWeight: "700", color: "#f0ebe3", letterSpacing: "0.1em", cursor: "pointer" }}>SCOUT</span>
        <span onClick={() => router.push("/signup")} style={{ fontSize: "13px", color: "#4a4535", cursor: "pointer" }}>No account? <span style={{ color: "#8a8070", textDecoration: "underline" }}>Sign up</span></span>
      </div>

      {/* Form */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "400px", padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#f0ebe3", letterSpacing: "-1px", marginBottom: "8px" }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "#4a4535" }}>You think of it. Scout finds it.</p>
        </div>

        <button
          onClick={() => window.location.href = "https://scout-backend-production-cfb9.up.railway.app/auth/google"}
          style={{ width: "100%", background: "#0e0d0a", border: "1px solid #2a2820", color: "#f0ebe3", padding: "13px", borderRadius: "8px", fontSize: "14px", cursor: "pointer", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "system-ui, sans-serif" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{ flex: 1, height: "1px", background: "#1a1812" }} />
          <span style={{ fontSize: "11px", color: "#3a3528" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#1a1812" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", background: "#0e0d0a", border: "1px solid #2a2820", borderRadius: "8px", color: "#f0ebe3", fontSize: "14px", padding: "14px 16px", outline: "none", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", background: "#0e0d0a", border: "1px solid #2a2820", borderRadius: "8px", color: "#f0ebe3", fontSize: "14px", padding: "14px 16px", outline: "none", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
          />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px" }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", background: "#f0ebe3", color: "#0a0908", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </div>
    </main>
  );
}
