"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatContactForm from './ChatContactForm';
import ContractChoice from './ContractChoice';

function renderMarkdown(text: string) {
  if (!text) return '';
  
  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Headers (h1-h6)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic (handle nested cases)
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>'); // ***bold italic***
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **bold**
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // *italic*
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  
  // Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0;"><code style="font-family: monospace; white-space: pre;">$1</code></pre>');
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 8px 0; color: #6b7280;">$1</blockquote>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Bullet lists (improved regex)
  html = html.replace(/^[\s]*[-*+] (.*$)/gim, '<li>$1</li>');
  
  // Wrap lists in ul/ol tags
  const lines = html.split('\n');
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^<li>/.test(line);
    const isNumberedListItem = /^\d+\./.test(line);
    
    if (isListItem && !inList) {
      inList = true;
      listType = isNumberedListItem ? 'ol' : 'ul';
      lines[i] = `<${listType} style="margin: 8px 0; padding-left: 20px;">${line}`;
    } else if (!isListItem && inList) {
      inList = false;
      lines[i-1] = lines[i-1] + `</${listType}>`;
    }
  }
  
  // Close any open list
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + `</${listType}>`;
  }
  
  html = lines.join('\n');
  
  // Line breaks (handle multiple consecutive breaks)
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');
  
  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote') && !html.startsWith('<pre')) {
    html = `<p style="margin: 0; line-height: 1.6;">${html}</p>`;
  }
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  html = html.replace(/<p[^>]*>\s*<br\/>\s*<\/p>/g, '');
  
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
  const [showContractChoice, setShowContractChoice] = useState(false);
  const [contractChoiceSubmitted, setContractChoiceSubmitted] = useState(false);
  
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
      
      // Check if AI wants to show contract choice
      if (aiMsg.includes('[SHOW_CONTRACT_CHOICE]')) {
        console.log('Contract choice trigger detected!');
        aiMsg = aiMsg.replace('[SHOW_CONTRACT_CHOICE]', '');
        setShowContractChoice(true);
      }
      
      // Check if contract choice has been submitted
      if (aiMsg.includes('[CONTRACT_CHOICE_SUBMITTED]')) {
        console.log('Contract choice submitted trigger detected!');
        aiMsg = aiMsg.replace('[CONTRACT_CHOICE_SUBMITTED]', '');
        setContractChoiceSubmitted(true);
        setShowContractChoice(false);
      }
      
      // Check if AI wants to show registration link
      if (aiMsg.includes('[SHOW_REGISTRATION_LINK]')) {
        console.log('Registration link trigger detected!');
        aiMsg = aiMsg.replace('[SHOW_REGISTRATION_LINK]', '');
        // Lägg till en tydlig registreringslänk direkt till affiliate
        aiMsg += '\n\n**🎯 Redo att spara pengar på din elräkning?**\n\nKlicka här för att registrera dig: **[Registrera dig nu](https://www.svekraft.com/elchef-rorligt/)**\n\n*Registreringen tar bara 2-3 minuter och är helt kostnadsfri!*';
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
    setShowContractChoice(false);
    setContractChoiceSubmitted(false);
  };

  // Funktion för att hantera avtalsval
  const handleContractChoice = async (contractType: 'rorligt' | 'fastpris') => {
    const contractName = contractType === 'rorligt' ? 'rörligt avtal' : 'fastpris';
    const contractMessage = `Jag väljer ${contractName}!`;
    
    console.log('Contract choice made:', contractType);
    
    // Lägg till användarens val i konversationen
    const newMessages = [...messages, { role: 'user', content: contractMessage }];
    setMessages(newMessages);
    setShowContractChoice(false);
    
    // Skicka till AI för att få nästa steg
    setLoading(true);
    try {
      const requestBody = { 
        messages: newMessages,
        sessionId: sessionId,
        contractChoice: contractType // Skicka med valt avtal
      };
      
      console.log('Sending request to API:', requestBody);
      
      const res = await fetch('/api/grokchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Något gick fel.');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      let aiMsg = data.choices?.[0]?.message?.content || 'Tack för ditt val!';
      
      console.log('AI response:', aiMsg);
      
      // Hantera eventuella triggers
      if (aiMsg.includes('[SHOW_REGISTRATION_LINK]')) {
        console.log('Registration link found in response!');
        aiMsg = aiMsg.replace('[SHOW_REGISTRATION_LINK]', '');
        
        // Använd olika affiliate-länkar beroende på avtalsval
        const affiliateLink = contractType === 'rorligt' 
          ? 'https://www.svekraft.com/elchef-rorligt/'
          : 'https://www.svekraft.com/elchef-fastpris/'; // Anta att det finns en fastpris-länk också
        
        // Lägg till en tydlig registreringslänk direkt till affiliate
        aiMsg += `\n\n**🎯 Redo att spara pengar på din elräkning?**\n\nKlicka här för att registrera dig: **[Registrera dig nu](${affiliateLink})**\n\n*Registreringen tar bara 2-3 minuter och är helt kostnadsfri!*`;
      } else {
        console.log('No registration link found in response');
      }
      
      setMessages([...newMessages, { role: 'assistant', content: aiMsg }]);
      setContractChoiceSubmitted(true);
    } catch {
      setError('Kunde inte kontakta AI:n.');
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att stänga avtalsval
  const closeContractChoice = () => {
    setShowContractChoice(false);
    const newMessages = [...messages, { role: 'user', content: 'Nej tack, jag tänker mig för' }];
    setMessages(newMessages);
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
          background: 'linear-gradient(135deg, rgba(0, 201, 107, 0.2), rgba(22, 147, 255, 0.2))',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: 'var(--glass-shadow-light)',
          fontSize: 28,
          cursor: 'pointer',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 18,
            boxShadow: 'var(--glass-shadow-heavy)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0, 201, 107, 0.2), rgba(22, 147, 255, 0.2))', 
            color: 'white', 
            padding: '1rem', 
            fontWeight: 700, 
            fontSize: 19, 
            letterSpacing: 0.2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span><GrodanIcon /> Grodan – AI-chat</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={clearChat}
                style={{ 
                  background: 'rgba(255,255,255,0.13)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  borderRadius: 6, 
                  padding: '2px 10px', 
                  marginRight: 2,
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  transition: 'all 0.2s ease'
                }}
                title="Rensa chatten"
                aria-label="Rensa chatten"
              >
                🗑
              </button>
              <button 
                onClick={() => setOpen(false)} 
                style={{ 
                  background: 'rgba(255,255,255,0.13)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  fontSize: 22, 
                  cursor: 'pointer',
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  transition: 'all 0.2s ease'
                }} 
                aria-label="Stäng"
              >
                ×
              </button>
            </div>
          </div>
          <div
            ref={chatContainerRef}
            style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'rgba(248, 250, 252, 0.8)' }}
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
                  background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0, 201, 107, 0.2), rgba(22, 147, 255, 0.2))' : 'rgba(255, 255, 255, 0.9)',
                  color: msg.role === 'user' ? 'white' : '#17416b',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 260,
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: 'var(--glass-shadow-light)',
                  wordBreak: 'break-word',
                  lineHeight: 1.7,
                  marginLeft: msg.role === 'user' ? 0 : 8,
                  marginRight: msg.role === 'user' ? 8 : 0,
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    {msg.role === 'user' ? 'Du' : 'Grodan'}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                marginBottom: 18,
              }}>
                <GrodanIcon />
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#17416b',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 260,
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: 'var(--glass-shadow-light)',
                  marginLeft: 8,
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    Grodan
                  </div>
                  <div>Skriver...</div>
                </div>
              </div>
            )}
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
            {showContractChoice && (
              <ContractChoice 
                onSelect={handleContractChoice}
                onClose={closeContractChoice}
              />
            )}
            {error && <div style={{ color: 'red', fontSize: 15, marginLeft: 8 }}>{error}</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{ 
            display: 'flex', 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '0.5rem',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}>
            <input
              type="text"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder={contactFormSubmitted ? "Tack för din kontakt!" : contractChoiceSubmitted ? "Tack för ditt val!" : "Skriv din fråga…"}
              style={{ 
                flex: 1, 
                border: '1px solid rgba(203, 213, 225, 0.5)', 
                borderRadius: 12, 
                padding: '0.8rem 1rem', 
                fontSize: 16, 
                outline: 'none', 
                background: contactFormSubmitted || contractChoiceSubmitted ? 'rgba(243, 244, 246, 0.8)' : 'rgba(255, 255, 255, 0.9)', 
                marginRight: 8,
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
              }}
              disabled={loading || contactFormSubmitted || contractChoiceSubmitted}
              maxLength={500}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim() || contactFormSubmitted || contractChoiceSubmitted} 
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 201, 107, 0.2), rgba(22, 147, 255, 0.2))', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                padding: '0 22px', 
                fontSize: 18, 
                cursor: 'pointer', 
                borderRadius: 12, 
                fontWeight: 700, 
                height: 44,
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              ➤
            </button>
            <button 
              type="button" 
              onClick={() => setShowContactForm(true)}
              disabled={contactFormSubmitted || contractChoiceSubmitted}
              style={{ 
                background: contactFormSubmitted || contractChoiceSubmitted ? 'rgba(148, 163, 184, 0.5)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(22, 147, 255, 0.2))', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                padding: '0 12px', 
                fontSize: 16, 
                cursor: 'pointer', 
                borderRadius: 12, 
                fontWeight: 600, 
                height: 44, 
                marginLeft: 8,
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
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