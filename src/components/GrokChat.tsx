"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatContactForm from './ChatContactForm';

function renderMarkdown(text: string) {
  // Enkel markdown: fetstil, punktlistor, radbrytning
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\n?\s*- (.*?)(?=\n|$)/g, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
  if (html.includes('<li>')) html = '<ul>' + html + '</ul>';
  return html;
}

const initialMessages = [
  {
    role: 'assistant',
    content:
      'Hej! Jag är Grodan 🐸 – fråga mig om elavtal, byte eller elpriser så hjälper jag dig direkt.'
  }
];

function GrodanIcon() {
  return <span style={{ fontSize: 22, marginRight: 6 }}>🐸</span>;
}

// Generera en unik session ID för denna konversation
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function GrokChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  
  // Debug: Log when showContactForm changes
  useEffect(() => {
    console.log('showContactForm state:', showContactForm);
  }, [showContactForm]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  // Generera session ID när komponenten mountas
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  // Responsiv bottom-position för chatbubblan
  const [chatBottom, setChatBottom] = useState(24);
  useEffect(() => {
    function updateBottom() {
      setChatBottom(window.innerWidth <= 600 ? 96 : 24);
    }
    updateBottom();
    window.addEventListener('resize', updateBottom);
    return () => window.removeEventListener('resize', updateBottom);
  }, []);

  // Scrolla till toppen när chatten öppnas, annars ingen automatisk scroll
  useEffect(() => {
    if (open && !prevOpenRef.current && chatContainerRef.current) {
      // Chatten öppnas nu
      chatContainerRef.current.scrollTop = 0;
    }
    prevOpenRef.current = open;
  }, [open]);

  const sendMessage = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await fetch('/api/grokchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          sessionId: sessionId // Skicka med session ID
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Något gick fel.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      let aiMsg = data.choices?.[0]?.message?.content || 'Jag kunde tyvärr inte svara just nu.';
      
      // Check if AI wants to show contact form
      if (aiMsg.includes('[SHOW_CONTACT_FORM]')) {
        console.log('Contact form trigger detected!');
        aiMsg = aiMsg.replace('[SHOW_CONTACT_FORM]', '');
        setShowContactForm(true);
      }
      
      // Check if contact form has been submitted
      if (aiMsg.includes('[CONTACT_FORM_SUBMITTED]')) {
        console.log('Contact form submitted trigger detected!');
        aiMsg = aiMsg.replace('[CONTACT_FORM_SUBMITTED]', '');
        setContactFormSubmitted(true);
        setShowContactForm(false);
      }
      
      setMessages([...newMessages, { role: 'assistant', content: aiMsg }]);
    } catch {
      setError('Kunde inte kontakta AI:n.');
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att rensa chatten och starta ny session
  const clearChat = () => {
    setMessages(initialMessages);
    setInput('');
    setSessionId(generateSessionId()); // Generera ny session ID
    setShowContactForm(false);
    setContactFormSubmitted(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: chatBottom,
          right: 24,
          zIndex: 1000,
          background: 'var(--primary, #2563eb)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: 28,
          cursor: 'pointer',
        }}
        aria-label={open ? 'Stäng chat' : 'Öppna chat'}
      >
        🐸
      </button>
      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 360,
            maxWidth: '98vw',
            height: 480,
            background: 'white',
            borderRadius: 18,
            boxShadow: '0 6px 32px rgba(0,0,0,0.22)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ background: 'var(--primary, #2563eb)', color: 'white', padding: '1rem', fontWeight: 700, fontSize: 19, letterSpacing: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><GrodanIcon /> Grodan – AI-chat</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={clearChat}
                style={{ background: 'rgba(255,255,255,0.13)', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', borderRadius: 6, padding: '2px 10px', marginRight: 2 }}
                title="Rensa chatten"
                aria-label="Rensa chatten"
              >
                🗑
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer' }} aria-label="Stäng">×</button>
            </div>
          </div>
          <div
            ref={chatContainerRef}
            style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc' }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && <GrodanIcon />}
                <div style={{
                  background: msg.role === 'user' ? 'var(--primary, #2563eb)' : '#e0f2fe',
                  color: msg.role === 'user' ? 'white' : '#17416b',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 260,
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                  wordBreak: 'break-word',
                  lineHeight: 1.7,
                  marginLeft: msg.role === 'user' ? 0 : 8,
                  marginRight: msg.role === 'user' ? 8 : 0,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    {msg.role === 'user' ? 'Du' : 'Grodan'}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                </div>
              </div>
            ))}
            {showContactForm && (
              <div style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}>
                <GrodanIcon />
                <div style={{
                  background: '#e0f2fe',
                  color: '#17416b',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 300,
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                  marginLeft: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    Grodan
                  </div>
                  <ChatContactForm 
                    onClose={() => setShowContactForm(false)} 
                    onSubmitted={() => {
                      // Add a message indicating the form was submitted
                      const newMessages = [...messages, { 
                        role: 'assistant', 
                        content: 'Tack för din kontakt! Vi återkommer så snart som möjligt. Ha en fin dag!' 
                      }];
                      setMessages(newMessages);
                      setContactFormSubmitted(true);
                    }}
                  />
                </div>
              </div>
            )}
            {loading && <div style={{ color: '#888', fontSize: 15, marginLeft: 8 }}>Grodan tänker…</div>}
            {error && <div style={{ color: 'red', fontSize: 15, marginLeft: 8 }}>{error}</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #e5e7eb', background: 'white', padding: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder={contactFormSubmitted ? "Tack för din kontakt!" : "Skriv din fråga…"}
              style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 12, padding: '0.8rem 1rem', fontSize: 16, outline: 'none', background: contactFormSubmitted ? '#f3f4f6' : 'white', marginRight: 8 }}
              disabled={loading || contactFormSubmitted}
              maxLength={500}
              autoFocus
            />
            <button type="submit" disabled={loading || !input.trim() || contactFormSubmitted} style={{ background: 'var(--primary, #2563eb)', color: 'white', border: 'none', padding: '0 22px', fontSize: 18, cursor: 'pointer', borderRadius: 12, fontWeight: 700, height: 44 }}>
              ➤
            </button>
            <button 
              type="button" 
              onClick={() => setShowContactForm(true)}
              disabled={contactFormSubmitted}
              style={{ background: contactFormSubmitted ? '#94a3b8' : 'var(--secondary, #10b981)', color: 'white', border: 'none', padding: '0 12px', fontSize: 16, cursor: 'pointer', borderRadius: 12, fontWeight: 600, height: 44, marginLeft: 8 }}
              title="Kontakta oss"
            >
              📞
            </button>
          </form>
        </div>
      )}
    </>
  );
} 