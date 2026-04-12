'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS_EN = ['Who are you?', 'Your skills', 'Best project', 'Work history', 'Education', 'Achievements', 'Open to work?', 'Languages', 'Soft skills', 'Hobbies'];
const SUGGESTIONS_DE = ['Wer bist du?', 'Deine Fähigkeiten', 'Bestes Projekt', 'Berufserfahrung', 'Ausbildung', 'Erfolge', 'Offen für Arbeit?', 'Sprachen', 'Soft Skills', 'Hobbys'];
const WELCOME_EN = `Hey! I'm an AI version of Tooba — a Software Developer with 4+ years of experience shipping real products for real clients. I build web apps, AI-powered tools, and CMS/e-commerce platforms. Currently studying at TH Augsburg. Ask me anything!`;
const WELCOME_DE = `Hallo! Ich bin eine KI-Version von Tooba — Software-Entwicklerin mit über 4 Jahren Erfahrung. Ich entwickle Webanwendungen, KI-Tools und CMS/E-Commerce-Plattformen. Aktuell studiere ich an der TH Augsburg. Frag mich alles!`;

const C = {
  bg: '#0a0514',
  bgCard: '#110820',
  bgHover: '#1a0f2e',
  border: '#1e1035',
  borderHover: '#2d1f50',
  accent: '#7c3aed',
  accentLight: '#a78bfa',
  accentBg: 'rgba(124,58,237,0.12)',
  accentBorder: 'rgba(124,58,237,0.25)',
  green: '#34d399',
  greenBg: 'rgba(52,211,153,0.08)',
  greenBorder: 'rgba(52,211,153,0.2)',
  orange: '#fb923c',
  orangeBg: 'rgba(251,146,60,0.08)',
  orangeBorder: 'rgba(251,146,60,0.2)',
  text: '#ede9fe',
  textSub: '#9d8ec7',
  textMuted: '#4a3d6e',
  header: '#0d0719',
  sidebar: '#0d0719',
};

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string>('new');
  const [savedConversations, setSavedConversations] = useState<{id: string, title: string, messages: Message[], time: string}[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setSidebarOpen(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language, history: messages }),
      });
      const data = await res.json();
      const aiMessage: Message = { role: 'assistant', content: data.response };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      if (activeConvId === 'new') {
        const newId = Date.now().toString();
        setSavedConversations(prev => [{
          id: newId,
          title: text.slice(0, 28) + (text.length > 28 ? '...' : ''),
          messages: finalMessages,
          time: 'Just now'
        }, ...prev]);
        setActiveConvId(newId);
      } else {
        setSavedConversations(prev =>
          prev.map(c => c.id === activeConvId ? { ...c, messages: finalMessages } : c)
        );
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: language === 'en' ? 'Sorry, something went wrong.' : 'Entschuldigung, etwas ist schiefgelaufen.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => { setMessages([]); setActiveConvId('new'); setSidebarOpen(false); };
  const loadConversation = (conv: {id: string, title: string, messages: Message[], time: string}) => {
    setMessages(conv.messages); setActiveConvId(conv.id); setSidebarOpen(false);
  };

  const suggestions = language === 'en' ? SUGGESTIONS_EN : SUGGESTIONS_DE;
  const welcome = language === 'en' ? WELCOME_EN : WELCOME_DE;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:C.bg, color:C.text, overflow:'hidden', fontFamily:"'Inter',-apple-system,sans-serif"}}>

      {/* HEADER */}
      <header style={{background:C.header, borderBottom:`1px solid ${C.border}`, padding:'12px 20px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>

            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hamburger-btn"
              style={{background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'7px', cursor:'pointer', color:C.textSub, display:'none'}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <img src="/images/tooba.jpg" alt="Tooba"
              style={{width:'46px', height:'46px', borderRadius:'50%', objectFit:'cover', objectPosition:'center 15%', border:`2px solid ${C.accent}`, flexShrink:0}} />
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
                <h1 style={{fontSize:'16px', fontWeight:700, color:C.text, margin:0}}>Syeda Tooba Hasnain</h1>
                <span style={{display:'inline-flex', alignItems:'center', gap:'4px', background:C.greenBg, border:`1px solid ${C.greenBorder}`, borderRadius:'20px', padding:'2px 8px'}}>
                  <span style={{width:'5px', height:'5px', borderRadius:'50%', background:C.green, animation:'pulse 2s infinite'}}></span>
                  <span style={{fontSize:'10px', color:C.green, fontWeight:600}}>{language === 'en' ? 'Available for hire' : 'Verfügbar'}</span>
                </span>
              </div>
              <p style={{fontSize:'12px', color:C.accentLight, margin:'3px 0 0'}}>
                {language === 'en' ? 'Software Developer · Web · AI & Automation · CMS · E-Commerce' : 'Software-Entwicklerin · Web · KI & Automatisierung · CMS · E-Commerce'}
              </p>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{fontSize:'11px', color:C.textMuted}} className="hide-mobile">Augsburg, DE</span>

            {/* Language toggle — visible on all screens */}
            <button onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
              style={{display:'flex', alignItems:'center', gap:'4px', background:C.bgCard, border:`1px solid ${C.borderHover}`, borderRadius:'8px', padding:'5px 10px', fontSize:'11px', fontWeight:700, cursor:'pointer', color:C.textSub}}>
              <span style={{color: language === 'en' ? C.text : C.textMuted}}>EN</span>
              <span style={{color:C.textMuted}}>·</span>
              <span style={{color: language === 'de' ? C.text : C.textMuted}}>DE</span>
            </button>

            {[
              { href:'mailto:toobadeutsch@gmail.com', title:'Email', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
              { href:'tel:+491631465933', title:'Phone', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
              { href:'https://github.com/toobahasnain', title:'GitHub', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> },
              { href:'https://www.linkedin.com/in/syeda-tooba-hasnain-a9a17119a/', title:'LinkedIn', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
            ].map(({href, title, icon}) => (
              <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                style={{width:'30px', height:'30px', borderRadius:'8px', background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', flexShrink:0}}
                title={title}>{icon}</a>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'10px'}}>
          {['React','Next.js','TypeScript','JavaScript','PHP','HTML·CSS'].map(s=>(
            <span key={s} style={{background:C.accentBg, color:C.accentLight, fontSize:'10px', padding:'2px 9px', borderRadius:'4px', border:`1px solid ${C.accentBorder}`}}>{s}</span>
          ))}
          {['Gemini API','OpenAI API','REST APIs','AI Automation'].map(s=>(
            <span key={s} style={{background:C.greenBg, color:C.green, fontSize:'10px', padding:'2px 9px', borderRadius:'4px', border:`1px solid ${C.greenBorder}`}}>{s}</span>
          ))}
          {['Shopify','WordPress','WooCommerce','CMS'].map(s=>(
            <span key={s} style={{background:C.orangeBg, color:C.orange, fontSize:'10px', padding:'2px 9px', borderRadius:'4px', border:`1px solid ${C.orangeBorder}`}}>{s}</span>
          ))}
        </div>
      </header>

      {/* BODY */}
      <div style={{display:'flex', flex:1, overflow:'hidden', position:'relative'}}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', zIndex:10}} />
        )}

        {/* SIDEBAR */}
        <aside
          className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
          style={{width:'210px', background:C.sidebar, borderRight:`1px solid ${C.border}`, padding:'14px', display:'flex', flexDirection:'column', gap:'6px', overflowY:'auto', flexShrink:0}}>
          <p style={{fontSize:'10px', color:C.textMuted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px', fontFamily:'monospace'}}>
            {language === 'en' ? 'Conversations' : 'Gespräche'}
          </p>
          <div onClick={startNewChat}
            style={{background: activeConvId === 'new' ? C.accentBg : C.bgCard, border:`1px solid ${activeConvId === 'new' ? C.accent : C.border}`, borderRadius:'8px', padding:'9px 11px', cursor:'pointer', transition:'all 0.2s'}}>
            <p style={{fontSize:'12px', color: activeConvId === 'new' ? C.accentLight : C.textSub, fontWeight:600, margin:0}}>
              {language === 'en' ? '+ New chat' : '+ Neuer Chat'}
            </p>
          </div>
          {savedConversations.length === 0 && (
            <p style={{fontSize:'11px', color:C.textMuted, marginTop:'8px', lineHeight:1.6, padding:'0 2px'}}>
              {language === 'en' ? 'Conversations appear here after you chat' : 'Gespräche erscheinen hier'}
            </p>
          )}
          {savedConversations.map(conv => (
            <div key={conv.id} onClick={() => loadConversation(conv)}
              style={{background: activeConvId === conv.id ? C.accentBg : C.bgCard, border:`1px solid ${activeConvId === conv.id ? C.accent : C.border}`, borderRadius:'8px', padding:'9px 11px', cursor:'pointer', transition:'all 0.2s'}}>
              <p style={{fontSize:'12px', color: activeConvId === conv.id ? C.accentLight : C.textSub, margin:0}}>{conv.title}</p>
              <p style={{fontSize:'10px', color:C.textMuted, margin:'2px 0 0'}}>{conv.time}</p>
            </div>
          ))}
        </aside>

        {/* CHAT */}
        <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:C.bg}}>
          <div style={{flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:'16px'}}>

            {/* Welcome */}
            <div style={{display:'flex', gap:'12px', alignItems:'flex-start'}}>
              <img src="/images/tooba.jpg" alt="Tooba"
                style={{width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', objectPosition:'center 15%', border:`2px solid ${C.accent}`, flexShrink:0}} />
              <div style={{background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'0 16px 16px 16px', padding:'14px 16px', maxWidth:'600px'}}>
                <p style={{fontSize:'13px', color:C.text, lineHeight:1.75, margin:'0 0 12px'}}>{welcome}</p>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      style={{background:C.accentBg, border:`1px solid ${C.accentBorder}`, color:C.accentLight, fontSize:'11px', padding:'5px 12px', borderRadius:'20px', cursor:'pointer', transition:'all 0.2s'}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} style={{display:'flex', gap:'12px', alignItems:'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'}}>
                <div style={{width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
                  background: msg.role === 'user' ? C.bgHover : 'transparent',
                  border: msg.role === 'user' ? `1px solid ${C.borderHover}` : 'none'}}>
                  {msg.role === 'user'
                    ? <span style={{fontSize:'11px', color:C.textSub, fontWeight:600}}>{language === 'en' ? 'You' : 'Du'}</span>
                    : <img src="/images/tooba.jpg" alt="Tooba" style={{width:'34px', height:'34px', objectFit:'cover', objectPosition:'center 15%', borderRadius:'50%', border:`2px solid ${C.accent}`}} />
                  }
                </div>
                <div style={{
                  padding:'12px 16px', maxWidth:'580px', fontSize:'13px', lineHeight:1.75, whiteSpace:'pre-wrap',
                  background: msg.role === 'user' ? C.accentBg : C.bgCard,
                  border: `1px solid ${msg.role === 'user' ? C.accentBorder : C.border}`,
                  borderRadius: msg.role === 'user' ? '16px 0 16px 16px' : '0 16px 16px 16px',
                  color: C.text
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{display:'flex', gap:'12px', alignItems:'flex-start'}}>
                <img src="/images/tooba.jpg" alt="Tooba"
                  style={{width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', objectPosition:'center 15%', border:`2px solid ${C.accent}`, flexShrink:0}} />
                <div style={{background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'0 16px 16px 16px', padding:'14px 16px'}}>
                  <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
                    {[0,150,300].map(d => (
                      <span key={d} style={{width:'7px', height:'7px', borderRadius:'50%', background:C.accent, display:'inline-block', animation:`bounce 1s ${d}ms infinite`}}></span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div style={{padding:'16px 24px', borderTop:`1px solid ${C.border}`, flexShrink:0, background:C.header}}>
            <div style={{display:'flex', gap:'8px', background:C.bgCard, border:`1px solid ${C.borderHover}`, borderRadius:'12px', padding:'10px 14px'}}>
              <input type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder={language === 'en' ? 'Ask me anything about Tooba...' : 'Frag mich alles über Tooba...'}
                style={{flex:1, background:'transparent', border:'none', outline:'none', fontSize:'13px', color:C.text}} />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                style={{background: loading || !input.trim() ? C.bgHover : C.accent, border:'none', borderRadius:'8px', padding:'7px 18px', color:'white', fontSize:'12px', fontWeight:600, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition:'background 0.2s', flexShrink:0}}>
                {language === 'en' ? 'Send' : 'Senden'}
              </button>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .sidebar { 
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            z-index: 20 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease !important;
          }
          .sidebar.sidebar-open {
            transform: translateX(0) !important;
          }
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
          .sidebar { display: flex !important; transform: none !important; }
        }
        input::placeholder { color: #4a3d6e; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}