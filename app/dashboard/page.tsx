"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Chat = {
  id: string;
  title: string;
  date: string;
  logs: string[];
  report: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("https://scout-backend-production-cfb9.up.railway.app/auth/me", { credentials: "include" })
      .then(res => { if (!res.ok) { router.push("/login"); return null; } return res.json(); })
      .then(data => { if (data) setUser(data); })
      .catch(() => router.push("/login"));
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const newChat = () => { setActiveChatId(null); setGoal(""); setShowSearch(false); };
  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };
  const handleLogout = async () => {
    await fetch("https://scout-backend-production-cfb9.up.railway.app/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const runAgent = async () => {
    if (!goal.trim() || loading) return;
    setLoading(true);
    const chatId = crypto.randomUUID();
    const newChatObj: Chat = {
      id: chatId,
      title: goal.slice(0, 45) + (goal.length > 45 ? "..." : ""),
      date: new Date().toLocaleDateString(),
      logs: [],
      report: "",
    };
    setChats((prev) => [newChatObj, ...prev]);
    setActiveChatId(chatId);
    const res = await fetch("https://scout-backend-production-cfb9.up.railway.app/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal }),
    });
    const { task_id } = await res.json();
    setGoal("");
    const eventSource = new EventSource(`https://scout-backend-production-cfb9.up.railway.app/stream/${task_id}`);
    eventSource.onmessage = (e) => {
      const data = e.data;
      if (data === "[DONE]" || data === "[FAILED]") { eventSource.close(); setLoading(false); }
      else if (data.startsWith("REPORT:")) {
        const report = data.replace("REPORT:", "");
        setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, report } : c));
      } else {
        setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, logs: [...c.logs, data] } : c));
        setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    };
  };

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    // if already listening, stop it
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome or Safari."); return; }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setGoal(prev => prev ? prev + " " + transcript : transcript);
    };
    recognitionRef.current = r;
    r.start();
  };

  const speakReport = () => {
    if (!activeChat?.report) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(activeChat.report);
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setGoal(prev => prev + ` [Attached: ${file.name}]`);
  };

  const getInitial = (name: string) => name ? name[0].toUpperCase() : "?";

  const sidebarItems = [
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: "Search", action: () => setShowSearch(true) },
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: "Chats", action: () => {} },
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: "Projects", action: () => {} },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", color: "#ececec" }}>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        input::placeholder { color: #666; }
        textarea::placeholder { color: #666; }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: "260px", background: "#1a1a1a", borderRight: "1px solid #2a2a2a", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Top controls */}
          <div style={{ padding: "12px 12px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex", alignItems: "center", transition: "all 0.1s" }}
              onMouseEnter={e => { (e.currentTarget.style.background = "#2a2a2a"); (e.currentTarget.style.color = "#ccc"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#666"); }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </button>
            <button
              onClick={newChat}
              title="New research"
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex", alignItems: "center", marginLeft: "auto", transition: "all 0.1s" }}
              onMouseEnter={e => { (e.currentTarget.style.background = "#2a2a2a"); (e.currentTarget.style.color = "#ccc"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#666"); }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          {/* Nav items */}
          <div style={{ padding: "4px 8px 8px" }}>
            <button
              onClick={newChat}
              style={{ width: "100%", background: "none", border: "none", color: "#ccc", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", fontSize: "14px", fontWeight: "400", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New chat
            </button>
            {sidebarItems.map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{ width: "100%", background: "none", border: "none", color: "#ccc", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", fontSize: "14px", fontWeight: "400", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          {showSearch && (
            <div style={{ padding: "0 12px 8px" }}>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                style={{ width: "100%", background: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", padding: "8px 12px", color: "#eee", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* Recents */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
            {filteredChats.length > 0 && (
              <p style={{ fontSize: "12px", color: "#555", padding: "10px 10px 4px", margin: 0, fontWeight: "500" }}>Recents</p>
            )}
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                style={{ padding: "8px 10px", borderRadius: "8px", cursor: "pointer", marginBottom: "1px", background: activeChatId === chat.id ? "#2a2a2a" : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", transition: "background 0.1s" }}
                onMouseEnter={e => { if (activeChatId !== chat.id) (e.currentTarget as HTMLDivElement).style.background = "#222"; }}
                onMouseLeave={e => { if (activeChatId !== chat.id) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <p style={{ fontSize: "13.5px", color: activeChatId === chat.id ? "#fff" : "#999", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, lineHeight: "1.4" }}>{chat.title}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "16px", flexShrink: 0, lineHeight: 1, padding: "2px 4px", borderRadius: "4px", opacity: 0, transition: "opacity 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                >×</button>
              </div>
            ))}
          </div>

          {/* User footer */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#3a3a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "#ccc", flexShrink: 0 }}>
              {getInitial(user?.name || "")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", color: "#ddd", margin: 0, fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Account"}</p>
              <p style={{ fontSize: "11px", color: "#555", margin: "1px 0 0" }}>{user?.email ? "Free plan" : ""}</p>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#999")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#212121" }}>

        {/* Topbar when sidebar closed */}
        {!sidebarOpen && (
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #2a2a2a" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex" }}
              onMouseEnter={e => { (e.currentTarget.style.background = "#2a2a2a"); (e.currentTarget.style.color = "#ccc"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#666"); }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </button>
            <button
              onClick={newChat}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex" }}
              onMouseEnter={e => { (e.currentTarget.style.background = "#2a2a2a"); (e.currentTarget.style.color = "#ccc"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#666"); }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        )}

        {/* Empty state */}
        {!activeChat && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <p style={{ fontSize: "24px", fontWeight: "600", color: "#fff", letterSpacing: "-0.4px", marginBottom: "8px" }}>What are you researching today?</p>
            <p style={{ fontSize: "14px", color: "#666" }}>Type a goal below and Scout will do the rest</p>
          </div>
        )}

        {/* Active chat content */}
        {activeChat && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 28px 24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#fff", letterSpacing: "-0.3px", marginBottom: "28px", lineHeight: 1.4 }}>
                {activeChat.title}
              </h2>

              {activeChat.logs.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: loading && activeChatId === activeChat.id ? "#4ade80" : "#555" }} />
                    <p style={{ fontSize: "12px", color: "#666", margin: 0, fontWeight: "500" }}>
                      {loading && activeChatId === activeChat.id ? "Running" : "Completed"}
                    </p>
                  </div>
                  <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "16px 20px", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "12.5px", lineHeight: "1.9", maxHeight: "240px", overflowY: "auto" }}>
                    {activeChat.logs.map((log, i) => (
                      <div key={i} style={{ color: log.toLowerCase().includes("error") || log.toLowerCase().includes("failed") ? "#f87171" : "#4ade80" }}>{log}</div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}

              {activeChat.report && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <p style={{ fontSize: "12px", color: "#666", fontWeight: "500", margin: 0, letterSpacing: "0.02em" }}>Report</p>
                    <button
                      onClick={speakReport}
                      style={{ background: "transparent", border: "1px solid #333", color: speaking ? "#4ade80" : "#666", fontSize: "12px", padding: "4px 14px", borderRadius: "20px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                    >
                      {speaking ? "Stop" : "Listen"}
                    </button>
                  </div>
                  <div style={{ fontSize: "15px", lineHeight: "1.85" }}>
                    <ReactMarkdown components={{
                      h1: ({children}) => <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "12px", marginTop: "32px", letterSpacing: "-0.5px" }}>{children}</h1>,
                      h2: ({children}) => <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#eee", margin: "28px 0 10px", letterSpacing: "-0.3px" }}>{children}</h2>,
                      h3: ({children}) => <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#ddd", margin: "20px 0 8px" }}>{children}</h3>,
                      p: ({children}) => <p style={{ marginBottom: "14px", color: "#bbb", lineHeight: "1.85", fontSize: "15px" }}>{children}</p>,
                      ul: ({children}) => <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>{children}</ul>,
                      li: ({children}) => <li style={{ marginBottom: "6px", color: "#bbb", lineHeight: "1.7", fontSize: "15px" }}>{children}</li>,
                    }}>
                      {activeChat.report}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "16px 24px 20px", background: "#212121" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ background: "#2f2f2f", borderRadius: "16px", padding: "10px 14px 10px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "15px", outline: "none", fontFamily: "inherit", lineHeight: "1.6", width: "100%" }}
                placeholder="Ask anything..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && runAgent()}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFileUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "6px 8px", borderRadius: "8px", display: "flex", alignItems: "center", transition: "all 0.1s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "#3a3a3a"); (e.currentTarget.style.color = "#ccc"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#666"); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  <button
                    onClick={startListening}
                    title="Voice input"
                    style={{ background: listening ? "#3a3a3a" : "none", border: "none", color: listening ? "#4ade80" : "#666", cursor: "pointer", padding: "6px 8px", borderRadius: "8px", display: "flex", alignItems: "center", transition: "all 0.1s" }}
                    onMouseEnter={e => { if (!listening) { (e.currentTarget.style.background = "#3a3a3a"); (e.currentTarget.style.color = "#ccc"); } }}
                    onMouseLeave={e => { if (!listening) { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#666"); } }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  </button>
                </div>
                <button
                  onClick={runAgent}
                  disabled={loading || !goal.trim()}
                  style={{ background: loading ? "#3a3a3a" : "#fff", color: loading ? "#666" : "#000", border: "none", borderRadius: "10px", padding: "7px 16px", fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                >
                  {loading ? "Running..." : "Run"}
                </button>
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#444", textAlign: "center", marginTop: "10px" }}>Scout can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
