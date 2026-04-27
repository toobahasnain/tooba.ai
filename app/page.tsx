'use client';
import emailjs from '@emailjs/browser';
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
const PROJECTS = [
  {
  name: 'EcoScope',
  desc: 'AI energy optimization assistant for ZEISS microscopes — Re_Make Hackathon 2026 Winner 🏆',
  tech: ['Next.js', 'TypeScript', 'Gemini API', 'Rule-Based AI'],
  live: 'https://ecoscope-five.vercel.app/',
  github: 'https://github.com/toobahasnain/ecoscope',
  color: '#003764'
},
  {
    name: 'AI Workflow Builder',
    desc: 'Visual AI tool that converts manual business workflows into automation plans',
    tech: ['React', 'Node.js', 'Gemini API', 'React Flow'],
    live: 'https://ai-workflow-builder-q87o.vercel.app/',
    github: 'https://github.com/toobahasnain/ai-workflow-builder',
    color: '#7c3aed'
  },
  {
    name: 'Istravo',
    desc: 'AI-powered travel discovery platform with personalised recommendations',
    tech: ['JavaScript', 'OpenAI API', 'REST API'],
    live: 'https://celerinnovations.com/staging/istravo/home1/',
    github: '',
    color: '#059669'
  },
  {
    name: 'MyPharmacyShop',
    desc: 'Fully customised Shopify e-commerce store with custom Liquid theme',
    tech: ['Shopify', 'Liquid', 'JavaScript', 'CSS'],
    live: 'https://mypharmacyshop.co.uk/',
    github: '',
    color: '#d97706'
  },
  {
    name: 'Rewellx',
    desc: 'Clean responsive frontend website',
    tech: ['WordPress', 'HTML', 'CSS', 'JavaScript'],
    live: 'https://rewellx.com/',
    github: '',
    color: '#0891b2'
  },
];

function detectProjects(text: string) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  PROJECTS.forEach(p => {
    if (lower.includes(p.name.toLowerCase())) matched.add(p.name);
  });

  if (lower.includes('wordpress') || lower.includes('woocommerce')) {
    ['MyPharmacyShop', 'Rewellx'].forEach(n => matched.add(n));
  }
  if (lower.includes('ecoscope') || lower.includes('zeiss') || lower.includes('hackathon') || lower.includes('energy')) matched.add('EcoScope');
  if (lower.includes('shopify')) matched.add('MyPharmacyShop');
  if (lower.includes('openai api')) matched.add('Istravo');
  if (lower.includes('react flow') || lower.includes('workflow builder') || lower.includes('automation platform')) matched.add('AI Workflow Builder');

  const showAllTerms = ['all my projects', 'all projects', 'alle projekte', 'meine projekte', 'show projects', 'portfolio', 'what have you built', 'what did you build', 'zeig mir'];
  const isShowAll = showAllTerms.some(t => lower.includes(t));
  if (isShowAll) {
    PROJECTS.forEach(p => matched.add(p.name));
  }

  return PROJECTS.filter(p => matched.has(p.name));
}
export default function Home() {
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string>('new');
  const [savedConversations, setSavedConversations] = useState<{id: string, title: string, messages: Message[], time: string}[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showContact, setShowContact] = useState(false);
const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

const copyMessage = (text: string, index: number) => {
  navigator.clipboard.writeText(text);
  setCopiedIndex(index);
  setTimeout(() => setCopiedIndex(null), 2000);
};
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
      if (!res.ok || data.error) {
  throw new Error(data.error || res.status.toString());
}
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
    } catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : '';
  const isQuota = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED');
  
  setMessages([...newMessages, {
    role: 'assistant',
    content: isQuota
      ? language === 'en'
        ? "I'm getting a lot of visitors right now and have hit my limit for the moment! Please try again in a few minutes, or reach out directly at toobadeutsch@gmail.com — I'd love to chat! 😊"
        : "Ich bekomme gerade viele Besucher und habe mein Limit erreicht! Bitte versuche es in ein paar Minuten erneut, oder schreib mir direkt an toobadeutsch@gmail.com 😊"
      : language === 'en'
        ? 'Something went wrong. Please try again in a moment.'
        : 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
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
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}} className="header-top">
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
            <button
onClick={() => {
  if (navigator.share) {
    navigator.share({
      title: 'Tooba.ai — AI Portfolio',
      text: language === 'en' 
        ? 'Chat with an AI version of Tooba — Software Developer based in Augsburg' 
        : 'Chatte mit einer KI-Version von Tooba — Software-Entwicklerin in Augsburg',
      url: 'https://tooba-ai-beta.vercel.app/',
    });
  } else {
    navigator.clipboard.writeText('https://tooba-ai-beta.vercel.app/');
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }
}}
  style={{display:'flex', alignItems:'center', gap:'5px', background: shareCopied ? C.greenBg : C.bgCard, border:`1px solid ${shareCopied ? C.greenBorder : C.border}`, borderRadius:'8px', padding:'5px 12px', cursor:'pointer', flexShrink:0, transition:'all 0.2s'}}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={shareCopied ? C.green : C.textSub} strokeWidth="2">
    {shareCopied
      ? <polyline points="20 6 9 17 4 12"/>
      : <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>
    }
  </svg>
  <span style={{fontSize:'11px', color: shareCopied ? C.green : C.textSub, fontWeight:600}}>
    {shareCopied ? (language === 'en' ? 'Copied!' : 'Kopiert!') : (language === 'en' ? 'Share' : 'Teilen')}
  </span>
</button>
            <button onClick={() => setShowContact(true)}
  style={{display:'flex', alignItems:'center', gap:'5px', background:C.greenBg, border:`1px solid ${C.greenBorder}`, borderRadius:'8px', padding:'5px 12px', cursor:'pointer', flexShrink:0}}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <span style={{fontSize:'11px', color:C.green, fontWeight:600}}>{language === 'en' ? 'Contact' : 'Kontakt'}</span>
</button>
            <a href="/Syeda_Tooba_Hasnain_CV.pdf" download="Syeda_Tooba_Hasnain_CV.pdf"
  style={{display:'flex', alignItems:'center', gap:'5px', background:C.accentBg, border:`1px solid ${C.accentBorder}`, borderRadius:'8px', padding:'5px 12px', textDecoration:'none', flexShrink:0}}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accentLight} strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
  <span style={{fontSize:'11px', color:C.accentLight, fontWeight:600}}>CV</span>
</a>
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
              <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hide-mobile"
                style={{width:'30px', height:'30px', borderRadius:'8px', background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', flexShrink:0}}
                title={title}>{icon}</a>
            ))}
          </div>
        </div>

        {/* Skills */}


        {/* Mobile social icons row */}
<div className="mobile-icons" style={{display:'none', gap:'6px', marginTop:'8px', flexWrap:'wrap', justifyContent:'center'}}>
  <a href="mailto:toobadeutsch@gmail.com"
    style={{width:'30px', height:'30px', borderRadius:'8px', background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}} title="Email">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  </a>
  <a href="tel:+491631465933"
    style={{width:'30px', height:'30px', borderRadius:'8px', background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}} title="Phone">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  </a>
  <a href="https://github.com/toobahasnain" target="_blank" rel="noopener noreferrer"
    style={{width:'30px', height:'30px', borderRadius:'8px', background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}} title="GitHub">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
  </a>
  <a href="https://www.linkedin.com/in/syeda-tooba-hasnain-a9a17119a/" target="_blank" rel="noopener noreferrer"
    style={{width:'30px', height:'30px', borderRadius:'8px', background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}} title="LinkedIn">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  </a>
  <button onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}className="hide-mobile"
    style={{display:'flex', alignItems:'center', gap:'4px', background:C.bgCard, border:`1px solid ${C.borderHover}`, borderRadius:'8px', padding:'5px 10px', fontSize:'11px', fontWeight:700, cursor:'pointer', color:C.textSub}}>
    <span style={{color: language === 'en' ? C.text : C.textMuted}}>EN</span>
    <span style={{color:C.textMuted}}>·</span>
    <span style={{color: language === 'de' ? C.text : C.textMuted}}>DE</span>
  </button>
</div>
        {/* Skills - hidden on mobile, shown on desktop */}
<div className="skills-desktop" style={{display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'10px'}}>
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
            {messages.map((msg, i) => {
  const detectedProjects = msg.role === 'assistant' ? detectProjects(msg.content) : [];
  return (
    <div key={i}>
      <div style={{display:'flex', gap:'12px', alignItems:'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'}}>
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
  color: C.text, position:'relative'
}}>
  {msg.content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '')}
  {msg.role === 'assistant' && (
    <button
      onClick={() => copyMessage(msg.content, i)}
      style={{position:'absolute', bottom:'8px', right:'8px', background:'transparent', border:'none', cursor:'pointer', opacity: copiedIndex === i ? 1 : 0.3, transition:'opacity 0.2s', padding:'2px'}}
      title="Copy">
      {copiedIndex === i
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  )}
</div>
      </div>

      {detectedProjects.length > 0 && (
        <div style={{marginLeft:'46px', marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'10px'}}>
          {detectedProjects.map(project => (
            <div key={project.name} style={{
              background:C.bgCard, border:`1px solid ${C.border}`,
              borderRadius:'12px', padding:'12px 14px', maxWidth:'260px',
              borderTop:`3px solid ${project.color}`, transition:'border-color 0.2s'
            }}>
              <p style={{fontSize:'13px', fontWeight:600, color:C.text, margin:'0 0 4px'}}>{project.name}</p>
              <p style={{fontSize:'11px', color:C.textSub, margin:'0 0 8px', lineHeight:1.5}}>{project.desc}</p>
              <div style={{display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'10px'}}>
                {project.tech.map(t => (
                  <span key={t} style={{fontSize:'10px', color:C.textMuted, background:C.bgHover, padding:'1px 6px', borderRadius:'3px'}}>{t}</span>
                ))}
              </div>
              <div style={{display:'flex', gap:'6px'}}>
                <a href={project.live} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:'11px', color:'white', background:project.color, padding:'4px 10px', borderRadius:'6px', textDecoration:'none', fontWeight:600}}>
                  Live →
                </a>
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:'11px', color:C.textSub, background:C.bgHover, border:`1px solid ${C.border}`, padding:'4px 10px', borderRadius:'6px', textDecoration:'none'}}>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
})}

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
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(input); }}}
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
{/* CONTACT MODAL */}
{showContact && (
  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}
    onClick={(e) => { if (e.target === e.currentTarget) setShowContact(false); }}>
    <div style={{background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'440px'}}>
      
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
        <div>
          <h2 style={{fontSize:'16px', fontWeight:700, color:C.text, margin:0}}>
            {language === 'en' ? 'Get in touch' : 'Kontakt aufnehmen'}
          </h2>
          <p style={{fontSize:'12px', color:C.textSub, margin:'4px 0 0'}}>
            {language === 'en' ? "I'll reply to your email directly" : 'Ich antworte direkt auf deine E-Mail'}
          </p>
        </div>
        <button onClick={() => { setShowContact(false); setContactStatus('idle'); }}
          style={{background:'transparent', border:'none', cursor:'pointer', color:C.textSub, fontSize:'20px', lineHeight:1}}>✕</button>
      </div>

      {contactStatus === 'sent' ? (
        <div style={{textAlign:'center', padding:'30px 0'}}>
          <div style={{fontSize:'40px', marginBottom:'12px'}}>✅</div>
          <p style={{fontSize:'15px', fontWeight:600, color:C.green, margin:'0 0 6px'}}>
            {language === 'en' ? 'Message sent!' : 'Nachricht gesendet!'}
          </p>
          <p style={{fontSize:'13px', color:C.textSub, margin:0}}>
            {language === 'en' ? "I'll get back to you soon." : 'Ich melde mich bald.'}
          </p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div>
            <label style={{fontSize:'11px', color:C.textSub, display:'block', marginBottom:'6px', fontWeight:600}}>
              {language === 'en' ? 'Your name' : 'Dein Name'}
            </label>
            <input
              type="text"
              value={contactForm.name}
              onChange={e => setContactForm(p => ({...p, name: e.target.value}))}
              placeholder={language === 'en' ? 'Max Mustermann' : 'Max Mustermann'}
              style={{width:'100%', background:C.bgHover, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 12px', color:C.text, fontSize:'13px', outline:'none'}}
            />
          </div>
          <div>
            <label style={{fontSize:'11px', color:C.textSub, display:'block', marginBottom:'6px', fontWeight:600}}>
              {language === 'en' ? 'Your email' : 'Deine E-Mail'}
            </label>
            <input
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(p => ({...p, email: e.target.value}))}
              placeholder="max@example.com"
              style={{width:'100%', background:C.bgHover, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 12px', color:C.text, fontSize:'13px', outline:'none'}}
            />
          </div>
          <div>
            <label style={{fontSize:'11px', color:C.textSub, display:'block', marginBottom:'6px', fontWeight:600}}>
              {language === 'en' ? 'Message' : 'Nachricht'}
            </label>
            <textarea
              value={contactForm.message}
              onChange={e => setContactForm(p => ({...p, message: e.target.value}))}
              placeholder={language === 'en' ? "Hi Tooba, I'd like to discuss a working student opportunity..." : 'Hallo Tooba, ich würde gerne über eine Werkstudentenstelle sprechen...'}
              rows={4}
              style={{width:'100%', background:C.bgHover, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 12px', color:C.text, fontSize:'13px', outline:'none', resize:'vertical', fontFamily:'inherit'}}
            />
          </div>

          {contactStatus === 'error' && (
  <p style={{fontSize:'12px', color:'#f87171', margin:0}}>
    {!contactForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ? (language === 'en' ? 'Please enter a valid email address.' : 'Bitte gib eine gültige E-Mail-Adresse ein.')
      : (language === 'en' ? 'Something went wrong. Please email me directly at toobadeutsch@gmail.com' : 'Etwas ist schiefgelaufen. Schreib mir direkt an toobadeutsch@gmail.com')
    }
  </p>
)}

          <button
            onClick={async () => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!contactForm.name || !contactForm.email || !contactForm.message) return;
if (!emailRegex.test(contactForm.email)) {
  setContactStatus('error');
  return;
}
              setContactStatus('sending');
              try {
                await emailjs.send(
                  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
                  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
                  {
                    from_name: contactForm.name,
                    from_email: contactForm.email,
                    message: contactForm.message,
                  },
                  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
                );
                setContactStatus('sent');
                setContactForm({ name: '', email: '', message: '' });
              } catch {
                setContactStatus('error');
              }
            }}
            disabled={contactStatus === 'sending' || !contactForm.name || !contactForm.email || !contactForm.message}
            style={{background: contactStatus === 'sending' ? C.bgHover : C.accent, border:'none', borderRadius:'8px', padding:'12px', color:'white', fontSize:'13px', fontWeight:600, cursor: contactStatus === 'sending' ? 'not-allowed' : 'pointer', transition:'background 0.2s'}}>
            {contactStatus === 'sending'
              ? (language === 'en' ? 'Sending...' : 'Wird gesendet...')
              : (language === 'en' ? 'Send message' : 'Nachricht senden')}
          </button>
        </div>
      )}
    </div>
  </div>
)}
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
        @media (max-width: 768px) {
  .skills-desktop { display: none !important; }
}
  @media (max-width: 768px) {
  .mobile-icons { display: flex !important; }
}
  @media (max-width: 768px) {
  .header-top { justify-content: center !important; }
  .mobile-icons { display: flex !important; justify-content: center !important; }
}
      `}
      
      </style>
    </div>
  );
}