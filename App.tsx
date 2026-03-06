
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, StickyNote, Sparkles, Plus, Trash2, Menu, X,
  Zap, GraduationCap, Trophy, Brain, Send, Image as ImageIcon, 
  Monitor, Eye, Home, BookOpen, MessageSquarePlus, Cpu, Edit3, Circle, CheckCircle2, Sparkle,
  LayoutDashboard, Paperclip, Loader2, ChevronRight, Globe, Shield, Activity, Info, Download,
  Layers, Rocket, Star, LogOut
} from 'lucide-react';
import { Task, Note, AppView, QuizQuestion, QuizResult, AIModelId, ChatMessage, ChatAttachment } from './types';
import { getAIAssistance, generateQuiz } from './services/gemini';
import { Logo } from './src/components/Logo';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { Auth } from './src/Auth';

const THEME_COLORS = [
  { name: 'Indigo', value: '#4f46e5', light: '#eef2ff', ring: 'rgba(79, 70, 229, 0.4)' },
  { name: 'Rose', value: '#e11d48', light: '#fff1f2', ring: 'rgba(225, 29, 72, 0.4)' },
  { name: 'Emerald', value: '#10b981', light: '#ecfdf5', ring: 'rgba(16, 185, 129, 0.4)' }
];

const MODELS: { id: AIModelId, name: string, icon: React.ReactNode, desc: string }[] = [
  { id: 'gemini-flash', name: 'Simple Info', icon: <Info />, desc: 'सामान्य जानकारी' },
  { id: 'gemini-pro', name: 'Gemini Pro', icon: <Sparkles />, desc: 'तकनीकी शोध' },
  { id: 'gpt-4', name: 'GPT-4 Global', icon: <Globe />, desc: 'वैश्विक विश्लेषण' },
  { id: 'gpt-5', name: 'GPT-5 Neural', icon: <Brain />, desc: 'उभरती तकनीक' },
  { id: 'deepseek', name: 'DeepSeek', icon: <Cpu />, desc: 'वैज्ञानिक डेटा' },
  { id: 'kimi', name: 'Kimi Fact', icon: <Shield />, desc: 'तथ्य सत्यापन' }
];

const EDUCATION_FORMS = [
  { id: 'ugc-net', name: 'UGC NET / JRF', description: 'National Eligibility Test' },
  { id: 'ctet', name: 'CTET / STET / KVS', description: 'Teacher Eligibility' },
  { id: 'upsc', name: 'UPSC / Civil Services', description: 'IAS / IPS Preparation' },
  { id: 'neet', name: 'NEET / JEE / AIIMS', description: 'Medical & Engineering' }
];

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<AppView>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(THEME_COLORS[0]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('pqp_tasks');
      const savedNotes = localStorage.getItem('pqp_notes');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    } catch (e) {
      console.warn('localStorage is not available:', e);
    }
  }, []);

  useEffect(() => { 
    try { localStorage.setItem('pqp_tasks', JSON.stringify(tasks)); } catch (e) {} 
  }, [tasks]);
  useEffect(() => { 
    try { localStorage.setItem('pqp_notes', JSON.stringify(notes)); } catch (e) {} 
  }, [notes]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size={60} className="animate-pulse" />
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authenticating...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="h-screen w-screen flex bg-black font-sans transition-all duration-500 overflow-hidden" style={{ '--pqp-primary': theme.value } as React.CSSProperties}>
      <style>{`
        :root { --pqp-primary: ${theme.value}; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .dashboard-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; }
        .ai-message { max-width: 90%; }
        .model-chip { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Logo size={42} className="drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">PQP CORE</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500"><X className="w-6 h-6"/></button>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem icon={<Home />} label="डैशबोर्ड" active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} />
            <NavItem icon={<GraduationCap />} label="शिक्षा एवं क्विज़" active={view === 'education'} onClick={() => { setView('education'); setIsSidebarOpen(false); }} />
            <NavItem icon={<Sparkles />} label="एआई शोध चैट" active={view === 'ai'} onClick={() => { setView('ai'); setIsSidebarOpen(false); }} />
            <NavItem icon={<CheckSquare />} label="कार्य सूची" active={view === 'tasks'} onClick={() => { setView('tasks'); setIsSidebarOpen(false); }} />
            <NavItem icon={<StickyNote />} label="सुरक्षित नोट्स" active={view === 'notes'} onClick={() => { setView('notes'); setIsSidebarOpen(false); }} />
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white uppercase truncate">{user.name || 'User'}</p>
                <p className="text-[8px] text-slate-500 truncate">{user.email}</p>
              </div>
              <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-2 justify-center">
              {THEME_COLORS.map(c => <button key={c.name} onClick={() => setTheme(c)} className={`w-8 h-8 rounded-full transition-all ${theme.name === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c.value }} />)}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative">
        <header className="h-16 bg-black border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{view === 'dashboard' ? 'SYSTEM OVERVIEW' : view.toUpperCase()}</h2>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {view === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardStatCard label="सक्रिय कार्य" value={tasks.filter(t => !t.completed).length} icon={<LayoutDashboard className="w-5 h-5" />} />
                <DashboardStatCard label="सुरक्षित नोट्स" value={notes.length} icon={<StickyNote className="w-5 h-5" />} />
                <DashboardStatCard label="क्विज़ स्कोर" value={quizHistory.length} icon={<Trophy className="w-5 h-5" />} />
              </div>

              {/* Main Core Branding */}
              <div className="flex-1 min-h-[500px] dashboard-card flex flex-col items-center justify-center text-center p-10 space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 z-0 opacity-20">
                  <img 
                    src="https://picsum.photos/seed/pqp-ai/1920/1080?blur=2" 
                    alt="AI Background" 
                    className="w-full h-full object-cover mix-blend-overlay"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[150px] pointer-events-none group-hover:bg-indigo-600/30 transition-all duration-700"></div>
                
                <div className="relative z-10 scale-125 mb-4">
                   <Logo size={120} className="animate-[pulse_4s_infinite] drop-shadow-[0_0_30px_rgba(79,70,229,0.6)]" />
                </div>
                
                <div className="relative z-10 space-y-2">
                  <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none transition-transform duration-500 group-hover:scale-105">PQP CORE INTELLIGENCE</h3>
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-black text-[10px] tracking-[0.4em] uppercase">
                    <Layers className="w-3 h-3" /> Neural Network v4.0
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm font-bold relative z-10 max-w-lg">मल्टी-मॉडल एआई शोध और एकीकृत इमेज जनरेशन का आधिकारिक पोर्टल।</p>
                
                <div className="flex flex-wrap justify-center gap-4 relative z-10 mt-4">
                  <button onClick={() => setView('ai')} className="px-10 py-5 bg-white text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-full hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-3">
                    <Rocket className="w-4 h-4" /> शोध शुरू करें
                  </button>
                  <button onClick={() => setView('education')} className="px-10 py-5 bg-transparent border border-white/10 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-full hover:bg-white/5 hover:scale-110 active:scale-95 transition-all flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" /> शिक्षा पोर्टल
                  </button>
                </div>
              </div>

              {/* Featured Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="dashboard-card p-8 relative overflow-hidden group">
                  <img 
                    src="https://picsum.photos/seed/pqp-art/800/600" 
                    alt="AI Art" 
                    className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-6">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">इमेज जनरेशन</h4>
                    <p className="text-slate-500 text-sm font-medium">उच्च-गुणवत्ता वाले दृश्य और कलाकृतियां सीधे चैट में बनाएं।</p>
                  </div>
                </div>
                <div className="dashboard-card p-8 relative overflow-hidden group">
                  <img 
                    src="https://picsum.photos/seed/pqp-edu/800/600" 
                    alt="Education" 
                    className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 mb-6">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">स्मार्ट लर्निंग</h4>
                    <p className="text-slate-500 text-sm font-medium">UGC NET और UPSC के लिए एआई-संचालित MCQ और शोध।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'ai' && <AIView theme={theme} />}
          {view === 'education' && <QuizPortal theme={theme} onSaveResult={r => setQuizHistory([r, ...quizHistory])} />}
          {view === 'tasks' && <TasksView tasks={tasks} setTasks={setTasks} theme={theme} />}
          {view === 'notes' && <NotesView notes={notes} setNotes={setNotes} theme={theme} />}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })} {label}
  </button>
);

const DashboardStatCard: React.FC<{ label: string, value: number, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="dashboard-card p-8 flex justify-between items-center group hover:border-indigo-500/40 transition-all cursor-pointer">
    <div className="space-y-2">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-5xl font-black text-white tracking-tighter">{value}</p>
    </div>
    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
  </div>
);

const AIView: React.FC<{ theme: any }> = ({ theme }) => {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('gemini-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments([{
          data: (reader.result as string).split(',')[1],
          mimeType: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (data: string, mimeType: string) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${data}`;
    link.download = `pqp-intel-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async () => {
    if (!query.trim() && attachments.length === 0) return;
    
    const userMsg: ChatMessage = { role: 'user', text: query, timestamp: Date.now(), attachments: [...attachments] };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setAttachments([]);
    setLoading(true);

    try {
      const result = await getAIAssistance(userMsg.text, selectedModel, messages, userMsg.attachments);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.text, 
        timestamp: Date.now(),
        attachments: result.generatedImage ? [{ data: result.generatedImage.split(',')[1], mimeType: 'image/png' }] : undefined,
        sources: result.sources
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Model Selector Bar */}
      <div className="px-6 py-4 bg-black border-b border-white/5 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
        {MODELS.map(m => (
          <button 
            key={m.id} 
            onClick={() => setSelectedModel(m.id)}
            className={`model-chip shrink-0 px-5 py-3 rounded-2xl flex items-center gap-3 border transition-all ${selectedModel === m.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className="w-4 h-4">{m.icon}</span>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-tight leading-none">{m.name}</p>
              <p className="text-[8px] opacity-60 uppercase mt-0.5">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Chat Display Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <img 
                src="https://picsum.photos/seed/pqp-neural/1200/800?grayscale" 
                alt="Neural Network" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600/20 flex items-center justify-center text-indigo-500 animate-[pulse_3s_infinite] shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                <Cpu className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white">Neural Processing Instance: Active</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Model: {selectedModel.toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`ai-message p-6 rounded-3xl ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-2xl' : 'bg-slate-900 border border-white/5 text-slate-200 shadow-xl'}`}>
              {m.attachments?.map((att, idx) => (
                <div key={idx} className="relative group mb-4">
                  <img src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-full max-w-md rounded-2xl border border-white/10 shadow-lg" />
                  {m.role === 'model' && (
                    <button 
                      onClick={() => handleDownload(att.data, att.mimeType)}
                      className="absolute bottom-4 right-4 bg-black/80 hover:bg-white hover:text-black p-3 rounded-full shadow-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4" /> डाउनलोड
                    </button>
                  )}
                </div>
              ))}
              <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
                {m.text}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">आधिकारिक स्रोत:</p>
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-white transition-colors truncate">
                      <ChevronRight className="w-3 h-3 shrink-0" /> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <div className="absolute inset-0 blur-sm bg-indigo-500/20 animate-pulse"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Processing Stream...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box Area */}
      <div className="p-6 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          {attachments.length > 0 && (
            <div className="flex gap-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group">
                  <img src={`data:${att.mimeType};base64,${att.data}`} className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg" />
                  <button onClick={() => setAttachments([])} className="absolute -top-3 -right-3 bg-rose-500 text-white p-1.5 rounded-full shadow-xl hover:scale-110 transition-transform"><X className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 bg-slate-900/50 p-2 rounded-full border border-white/5 shadow-2xl focus-within:border-indigo-500/50 transition-all">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <Paperclip className="w-6 h-6" />
            </button>
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`${selectedModel.toUpperCase()} के साथ शोध या इमेज जनरेशन शुरू करें...`} 
              className="flex-1 bg-transparent px-4 text-white outline-none font-bold text-sm placeholder:text-slate-600" 
            />
            <button 
              onClick={handleSend}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 shrink-0" 
              style={{ backgroundColor: theme.value }}
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksView: React.FC<{ tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, theme: any }> = ({ tasks, setTasks, theme }) => {
  const [val, setVal] = useState('');
  const add = () => { if(val.trim()){ setTasks([{id: Date.now().toString(), title: val, completed: false, priority: 'medium', createdAt: Date.now()}, ...tasks]); setVal(''); } };
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 w-full h-full overflow-y-auto no-scrollbar">
      <div className="flex gap-3 bg-slate-900 p-4 rounded-[2rem] border border-white/5 shadow-xl">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="नया कार्य जोड़ें..." className="flex-1 bg-transparent px-6 text-white outline-none font-bold" />
        <button onClick={add} className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: theme.value }}><Plus /></button>
      </div>
      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex items-center gap-5 hover:bg-slate-900/60 transition-all group">
            <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} className="transition-transform active:scale-90">{t.completed ? <CheckCircle2 className="text-emerald-500 w-6 h-6" /> : <Circle className="text-slate-700 w-6 h-6" />}</button>
            <span className={`flex-1 font-bold text-sm ${t.completed ? 'line-through text-slate-600' : 'text-white'}`}>{t.title}</span>
            <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-500"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesView: React.FC<{ notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>, theme: any }> = ({ notes, setNotes, theme }) => {
  const [t, setT] = useState(''); const [c, setC] = useState('');
  const add = () => { if(t && c){ setNotes([{id: Date.now().toString(), title: t, content: c, updatedAt: Date.now()}, ...notes]); setT(''); setC(''); } };
  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-full overflow-y-auto no-scrollbar">
      <div className="space-y-4 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 h-fit shadow-2xl">
        <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em] mb-4">New Intel Note</h3>
        <input value={t} onChange={e => setT(e.target.value)} placeholder="शीर्षक दर्ज करें" className="w-full bg-black/40 p-5 rounded-2xl text-white outline-none border border-white/5 font-bold focus:border-indigo-500/50 transition-all" />
        <textarea value={c} onChange={e => setC(e.target.value)} placeholder="अपना शोध विवरण यहाँ लिखें..." rows={8} className="w-full bg-black/40 p-5 rounded-2xl text-slate-300 outline-none border border-white/5 resize-none focus:border-indigo-500/50 transition-all" />
        <button onClick={add} className="w-full py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all" style={{ backgroundColor: theme.value }}>सुरक्षित करें</button>
      </div>
      <div className="space-y-4">
        {notes.length === 0 && <div className="text-center py-20 opacity-20"><StickyNote className="w-16 h-16 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-[10px]">No Notes Secured</p></div>}
        {notes.map(n => (
          <div key={n.id} className="bg-slate-900/30 p-7 rounded-[2rem] border border-white/5 relative group hover:border-white/10 transition-all">
            <button onClick={() => setNotes(notes.filter(x => x.id !== n.id))} className="absolute top-6 right-6 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            <h4 className="font-black text-white uppercase text-xs mb-4 tracking-wider">{n.title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-6">{n.content}</p>
            <div className="mt-6 flex justify-between items-center">
              <span className="text-[8px] font-black text-slate-600 uppercase">{new Date(n.updatedAt).toLocaleDateString()}</span>
              <button className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizPortal: React.FC<{ theme: any, onSaveResult: (r: QuizResult) => void }> = ({ theme, onSaveResult }) => {
  const [loading, setLoading] = useState(false);
  const start = async (topic: string) => {
    setLoading(true);
    try { await generateQuiz(topic); alert("MCQ मॉड्यूल लोड हो रहा है..."); } catch { alert("Error"); }
    setLoading(false);
  };
  return (
    <div className="max-w-4xl mx-auto p-6 w-full space-y-12 h-full overflow-y-auto no-scrollbar">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">MCQ PORTAL</h2>
        <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Select Education Stream</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EDUCATION_FORMS.map(f => (
          <button key={f.id} onClick={() => start(f.name)} className="bg-slate-900/30 p-10 rounded-[2.5rem] border border-white/5 text-left hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl pointer-events-none group-hover:bg-indigo-600/10 transition-all"></div>
            <div className="w-14 h-14 rounded-2xl bg-black mb-8 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-xl"><BookOpen className="w-6 h-6" /></div>
            <h4 className="font-black text-white uppercase text-sm tracking-widest">{f.name}</h4>
            <p className="text-[9px] text-slate-500 uppercase mt-2 tracking-wider font-bold">{f.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
