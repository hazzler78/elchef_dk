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

type SessionGroup = {
  session_id: string;
  logs: ChatLogType[];
  total_messages: number;
  first_message: string;
  last_message: string;
};

export default function AdminChatlog() {
  const [logs, setLogs] = useState<ChatLogType[]>([]);
  const [sessionGroups, setSessionGroups] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"raw" | "grouped">("grouped");

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
      if (!error && data) {
        const logsData = data as ChatLogType[];
        setLogs(logsData);
        
        // Gruppera efter session_id
        const groups: { [key: string]: ChatLogType[] } = {};
        logsData.forEach(log => {
          if (!groups[log.session_id]) {
            groups[log.session_id] = [];
          }
          groups[log.session_id].push(log);
        });
        
        const sessionGroupsData: SessionGroup[] = Object.entries(groups).map(([session_id, logs]) => ({
          session_id,
          logs: logs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
          total_messages: logs.reduce((sum, log) => sum + (log.messages?.length || 0), 0),
          first_message: logs[0]?.created_at || "",
          last_message: logs[logs.length - 1]?.created_at || "",
        }));
        
        setSessionGroups(sessionGroupsData);
      }
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
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: 24 }}>
      <h1>AI Chatlogg (Admin)</h1>
      
      <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
        <button 
          onClick={() => setViewMode("grouped")}
          style={{ 
            padding: "8px 16px", 
            background: viewMode === "grouped" ? "#2563eb" : "#e5e7eb", 
            color: viewMode === "grouped" ? "white" : "black",
            border: "none", 
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Grupperad vy
        </button>
        <button 
          onClick={() => setViewMode("raw")}
          style={{ 
            padding: "8px 16px", 
            background: viewMode === "raw" ? "#2563eb" : "#e5e7eb", 
            color: viewMode === "raw" ? "white" : "black",
            border: "none", 
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Raw vy
        </button>
        <span style={{ fontSize: 14, color: "#666" }}>
          {viewMode === "grouped" ? `${sessionGroups.length} sessioner` : `${logs.length} meddelanden`}
        </span>
      </div>

      {loading && <p>Laddar loggar...</p>}
      {!loading && logs.length === 0 && <p>Inga loggar hittades.</p>}
      
      {!loading && logs.length > 0 && viewMode === "raw" && (
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
                    <button onClick={() => setExpanded(expanded === log.session_id ? null : log.session_id)} style={{ fontSize: 14 }}>
                      {expanded === log.session_id ? "Dölj" : "Visa"}
                    </button>
                  </td>
                </tr>
                {expanded === log.session_id && (
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

      {!loading && sessionGroups.length > 0 && viewMode === "grouped" && (
        <div style={{ marginTop: 24 }}>
          {sessionGroups.map((group, i) => (
            <div key={group.session_id} style={{ 
              border: "1px solid #e5e7eb", 
              borderRadius: 8, 
              marginBottom: 16, 
              background: "white" 
            }}>
              <div style={{ 
                padding: "12px 16px", 
                background: "#f8fafc", 
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <strong>Session: {group.session_id}</strong>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {group.logs.length} meddelanden • {group.total_messages} totalt • 
                    {new Date(group.first_message).toLocaleString()} - {new Date(group.last_message).toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={() => setExpanded(expanded === group.session_id ? null : group.session_id)}
                  style={{ fontSize: 14, padding: "4px 8px", background: "#2563eb", color: "white", border: "none", borderRadius: 4 }}
                >
                  {expanded === group.session_id ? "Dölj" : "Visa"}
                </button>
              </div>
              
              {expanded === group.session_id && (
                <div style={{ padding: 16 }}>
                  {group.logs.map((log, logIndex) => (
                    <div key={log.id} style={{ 
                      marginBottom: 16, 
                      padding: 12, 
                      background: "#f9fafb", 
                      borderRadius: 6,
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                        Meddelande {logIndex + 1} • {new Date(log.created_at).toLocaleString()} • Tokens: {log.total_tokens}
                      </div>
                      <div>
                        <b>Konversation:</b>
                        <ul style={{ margin: "8px 0", padding: 0, listStyle: "none" }}>
                          {log.messages?.map((msg, idx) => (
                            <li key={idx} style={{ margin: "4px 0" }}>
                              <span style={{ fontWeight: 600 }}>{msg.role === "user" ? "Du" : "Grodan"}:</span> {msg.content}
                            </li>
                          ))}
                        </ul>
                        <b>AI-svar:</b> {log.ai_response}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 