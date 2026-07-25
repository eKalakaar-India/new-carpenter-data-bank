import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { ShieldCheck, Lock, Mail, User, Shield } from 'lucide-react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'


export default function Login() {
  const { login, signup, authError, authLoading, isAuthenticated, user } = useVaultStore();
  const [feedback, setFeedback] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    if(isAuthenticated){
      if(user?.role === 'Mobilizer'){
        navigate('/mobilizer-form')
      }else{
        navigate('/')
      }
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] relative px-4 overflow-hidden">
      
      {/* Background Gradients and Atmospheric Lights */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--accent-primary)]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-200/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Login Box */}
      <div className="w-full max-w-lg relative">
        {/* Glowing aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-3xl opacity-30 blur-xl -z-10" />

        <div className="bg-white border border-[#DDE3EA] p-8 md:p-10 rounded-3xl shadow-2xl relative">
          
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] items-center justify-center shadow-xl border border-red-500/10 mb-4 transform hover:rotate-12 transition-transform duration-300">
              <Shield className="text-amber-100" size={28} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-slate-800 tracking-wider">
              Carpenter Vault
            </h2>
            <p className="text-[var(--accent-primary)] text-xs font-bold uppercase tracking-widest mt-2">
              Registry & Insurance Ledger
            </p>
          </div>

          {/* <div className='w-full flex gap-4'>
            <p>Admin</p>
            <p>Project Head</p>
            <p>Operation Head</p>
            <p>Mobilizer</p>
          </div> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Secure Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Mail size={16} /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Secure Passcode</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock size={16} /></span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all"
                />
              </div>
            </div>

            {/* Diagnostics Message Banner */}
            {(authError || feedback) && (
              <div className={`p-4 rounded-xl border text-xs font-medium ${
                authError 
                  ? 'bg-red-50 border-red-200 text-red-655' 
                  : 'bg-emerald-50 border-emerald-255 text-emerald-650'
              }`}>
                {authError || feedback}
              </div>
            )}

            {/* Submission CTA */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-secondary)] hover:to-[var(--accent-tertiary)] disabled:opacity-50 text-amber-50 font-medium rounded-xl border border-red-500/10 shadow-[0_4px_15px_var(--accent-glow-strong)] focus:outline-none transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <span className="h-4 w-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Decrypt Ledger Vault</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
