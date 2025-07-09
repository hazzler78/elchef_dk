"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_PASSWORD = "grodan2025";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatLogType = {
  id: number;
  created_at: string;
  session_id: string;
  user_agent: string;
  messages: ChatMessage[];
  ai_response: string;
  total_tokens: number;
};

export default function AdminChatlog() {
  const [logs, setLogs] = useState<ChatLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("admin_authed") === "true") setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    async function fetchLogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("chatlog")
        .select("id, created_at, session_id, user_agent, messages, ai_response, total_tokens")
        .order("created_at", { ascending: false });
      if (!error && data) setLogs(data as ChatLogType[]);
      setLoading(false);
    }
    fetchLogs();
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem("admin_authed", "true");
      setError("");
    } else {
      setError("Fel lösenord!");
    }
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", padding: 24, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <h2>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 12, borderRadius: 6, border: "1px solid #cbd5e1" }}
            autoFocus
          />
          <button type="submit" style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 6, background: "#2563eb", color: "white", border: "none", fontWeight: 600 }}>
            Logga in
          </button>
        </form>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: 24 }}>
      <h1>AI Chatlogg (Admin)</h1>
      {loading && <p>Laddar loggar...</p>}
      {!loading && logs.length === 0 && <p>Inga loggar hittades.</p>}
      {!loading && logs.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Datum</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Session</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Antal meddelanden</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>User Agent</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Visa</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <>
                <tr key={log.id}>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb", fontSize: 12 }}>{log.session_id}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>{log.messages?.length || 0}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb", fontSize: 12 }}>{log.user_agent}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
                    <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ fontSize: 14 }}>
                      {expanded === i ? "Dölj" : "Visa"}
                    </button>
                  </td>
                </tr>
                {expanded === i && (
                  <tr>
                    <td colSpan={5} style={{ background: "#f9fafb", padding: 16, border: "1px solid #e5e7eb" }}>
                      <b>Konversation:</b>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {log.messages?.map((msg, idx) => (
                          <li key={idx} style={{ margin: "8px 0" }}>
                            <span style={{ fontWeight: 600 }}>{msg.role === "user" ? "Du" : "Grodan"}:</span> {msg.content}
                          </li>
                        ))}
                      </ul>
                      <b>AI-svar:</b> {log.ai_response}
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>Tokens: {log.total_tokens}</div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 