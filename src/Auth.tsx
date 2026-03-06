import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Logo } from './components/Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      setIsSubmitting(true);
      // Simulate password recovery
      setTimeout(() => {
        setIsSubmitting(false);
        alert('यदि यह ईमेल हमारे सिस्टम में है, तो आपको पासवर्ड रीसेट निर्देश प्राप्त होंगे। (डेमो मोड: वास्तविक ईमेल नहीं भेजा गया)');
        setIsForgotPassword(false);
        setIsLogin(true);
      }, 1500);
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = authError;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} className="mx-auto mb-6 drop-shadow-[0_0_20px_rgba(79,70,229,0.4)]" />
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">PQP CORE</h1>
          <p className="text-slate-400 text-sm font-medium">
            {isLogin ? 'अपने एआई शोध पोर्टल में प्रवेश करें' : 'नया शोध खाता बनाएं'}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isForgotPassword ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ईमेल</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">नाम</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="आपका नाम"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ईमेल</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">पासवर्ड</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        पासवर्ड भूल गए?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {displayError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] py-5 rounded-2xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isForgotPassword ? 'रीसेट लिंक भेजें' : isLogin ? 'लॉगिन करें' : 'खाता बनाएं'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                  setIsLogin(true);
                } else {
                  setIsLogin(!isLogin);
                }
              }}
              className="text-slate-400 text-xs font-bold hover:text-white transition-colors"
            >
              {isForgotPassword ? 'लॉगिन पर वापस जाएं' : isLogin ? 'खाता नहीं है? साइन अप करें' : 'पहले से खाता है? लॉगिन करें'}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
          &copy; 2026 PQP CORE INTELLIGENCE • SECURE ACCESS
        </p>
      </div>
    </div>
  );
};
