"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { id: "plan", title: "Smart Planning", desc: "Drop a topic and it maps out exactly what needs to be researched. No hand-holding required." },
    { id: "search", title: "Live Web Search", desc: "Actually searches the internet in real time. Not vibes. Not made up facts. Real sources." },
    { id: "critic", title: "Self-Critiquing", desc: "Has a built-in BS detector. If the results are mid, it tries again until they're not." },
    { id: "report", title: "Structured Reports", desc: "Every session ends with a clean, structured report. Sections, summary, conclusions - all organized for you." },
    { id: "voice", title: "Voice Input", desc: "Too lazy to type? Same. Just talk and Scout gets to work. No cap." },
    { id: "secure", title: "Private by Design", desc: "Your searches stay private. We built real security - not just a checkbox." },
  ];

  return (
    <main style={{ background: "#0a0908", minHeight: "100vh", color: "#f0ebe3", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 48px", height: "60px",
        background: scrolled ? "rgba(10,9,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1e1c18" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#f0ebe3", letterSpacing: "0.1em" }}>SCOUT</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => router.push("/login")} style={{ background: "transparent", border: "none", color: "#6b6456", padding: "8px 16px", fontSize: "13px", cursor: "pointer", borderRadius: "6px" }}>Log in</button>
          <button onClick={() => router.push("/signup")}
            onMouseEnter={e => (e.currentTarget.style.background = "#e0dbd3")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f0ebe3")}
            style={{ background: "#f0ebe3", border: "none", color: "#0a0908", padding: "9px 20px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "background 0.15s" }}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(#1e1c18 1px, transparent 1px), linear-gradient(90deg, #1e1c18 1px, transparent 1px)",
          backgroundSize: "60px 60px",

        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "820px" }}>
          <h1 style={{ fontSize: "96px", fontWeight: "800", lineHeight: 1.0, letterSpacing: "-4px", color: "#f0ebe3", margin: "0 0 28px" }}>
            Research.<br />
            <span style={{ color: "#2e2b24", WebkitTextStroke: "1px #3a3528" }}>Automated.</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#6b6456", lineHeight: 1.7, maxWidth: "500px", margin: "0 auto 48px" }}>
            You think of it. Scout finds it.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => router.push("/signup")}
              onMouseEnter={e => (e.currentTarget.style.background = "#e0dbd3")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f0ebe3")}
              style={{ background: "#f0ebe3", color: "#0a0908", border: "none", padding: "16px 36px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "background 0.15s" }}>
              Start for free
            </button>
            <button onClick={() => router.push("/login")}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#3a3528")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1c18")}
              style={{ background: "transparent", color: "#6b6456", border: "1px solid #1e1c18", padding: "16px 36px", borderRadius: "8px", fontSize: "15px", cursor: "pointer", transition: "border 0.15s" }}>
              Log in
            </button>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom, transparent, #3a3528)" }} />
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 48px 160px" }}>
        <div style={{ marginBottom: "72px" }}>
          <p style={{ fontSize: "11px", color: "#4a4535", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>How it works</p>
          <h2 style={{ fontSize: "44px", fontWeight: "700", color: "#f0ebe3", letterSpacing: "-1.5px", margin: 0 }}>
            Everything you need.<br />
            <span style={{ color: "#2e2b24" }}>Nothing you don't.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          {features.map((f) => (
            <div
              key={f.id}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: "56px 44px",
                background: hovered === f.id ? "#141209" : "#0e0d0a",
                borderRadius: "12px",
                borderTop: `1px solid ${hovered === f.id ? "#5a5440" : "#252318"}`,
                borderLeft: `1px solid ${hovered === f.id ? "#3a3528" : "#1e1c14"}`,
                borderRight: "1px solid transparent",
                borderBottom: "1px solid transparent",
                transform: hovered === f.id ? "translateY(-10px) scale(1.02)" : "translateY(0px) scale(1)",
                boxShadow: hovered === f.id
                  ? "0 28px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,248,235,0.06)"
                  : "0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,248,235,0.02)",
                transition: "all 0.25s ease",
                cursor: "default",
              }}
            >
              <h3 style={{ fontSize: "11px", fontWeight: "700", color: "#f0ebe3", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>{f.title}</h3>
              <p style={{ fontSize: "15px", color: "#6b6456", lineHeight: 1.85, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: "1px solid #1a1812", padding: "120px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "52px", fontWeight: "800", color: "#f0ebe3", letterSpacing: "-2px", marginBottom: "20px" }}>Ready to research?</h2>
        <p style={{ fontSize: "16px", color: "#4a4535", marginBottom: "40px" }}>Free to start. No credit card required.</p>
        <button onClick={() => router.push("/signup")}
          onMouseEnter={e => (e.currentTarget.style.background = "#e0dbd3")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f0ebe3")}
          style={{ background: "#f0ebe3", color: "#0a0908", border: "none", padding: "18px 40px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "background 0.15s" }}>
          Get started for free
        </button>
      </div>

      <div style={{ borderTop: "1px solid #141210", padding: "24px 48px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#2a2820", fontWeight: "700", letterSpacing: "0.1em" }}>SCOUT</span>
        <span style={{ fontSize: "12px", color: "#2a2820" }}>Built with LangGraph + FastAPI + Next.js</span>
      </div>

    </main>
  );
}
