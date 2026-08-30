import { motion } from "motion/react";
import { MascotScene } from "../components/login/MascotScene";
import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Truck, ShieldAlert, Key, CheckCircle, UserPlus, Fingerprint, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';





export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { initializeAuth } = useAppStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleMockLogin = async (role: 'driver' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem('DEV_MOCK_TOKEN', role === 'admin' ? 'DEV_MOCK_ADMIN_TOKEN' : 'DEV_MOCK_TOKEN');
      setLoginSuccess(true);
      setTimeout(() => {
        initializeAuth();
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError('Dev mode bypass failed.');
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181B] text-[#FAF7F2] relative flex items-center justify-center p-4 sm:p-8 overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D4A373]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#E9C46A]/8 blur-[140px] pointer-events-none" />

      {/* Animated Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#E9C46A] rounded-full"
            style={{
              left: `${(i * 3.3 + 7) % 100}%`,
              top: `${(i * 7.1 + 13) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
            }}
            animate={{
              y: [0, -25 - (i % 4) * 10, 0],
              opacity: [0.1, 0.45, 0.1],
            }}
            transition={{
              duration: 5 + (i % 4) * 2,
              repeat: Infinity,
              delay: (i % 5) * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[1020px] bg-[#27272A]/70 backdrop-blur-2xl border border-[#D4A373]/25 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Mascot Scene */}
        <div 
          className="w-full md:w-[50%] h-[280px] md:h-auto md:min-h-[580px] relative bg-[#1E1E22]/80 border-b md:border-b-0 md:border-r border-[#D4A373]/20 flex items-center justify-center p-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <MascotScene isHovered={isHovered} showPassword={showPassword} loginSuccess={loginSuccess} />
        </div>

        {/* Right Side: Login Form container */}
        <div className="w-full md:w-[50%] p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-[#18181B]/60">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center text-[#E9C46A] shadow-md shadow-black/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-[#FAF7F2] tracking-tight">SafeLogix</h1>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#D4A373]">Crisis & Fleet Portal</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-[#FAF7F2] tracking-tight">
                {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : 'Reset password'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {mode === 'login' ? 'Enter your credentials to access the command portal' : mode === 'register' ? 'Register your operator credentials' : 'We will send a recovery link to your inbox'}
              </p>
            </div>

            {mode === 'reset' ? (
              <div className="space-y-5">
                <div className="text-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <Key className="w-6 h-6 text-[#E9C46A] mx-auto mb-2" />
                  <p className="text-xs text-zinc-300">Enter your registered email to receive an instant password recovery link.</p>
                </div>
                
                {error && (
                  <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {resetSent ? (
                  <div className="bg-[#D4A373]/15 border border-[#D4A373]/40 text-[#FAF7F2] p-4 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-2 text-center">
                    <CheckCircle className="w-6 h-6 text-[#E9C46A]" />
                    <span>Password reset email sent! Please check your inbox.</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-sm text-[#FAF7F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all"
                      placeholder="operator@safelogix.io"
                    />
                  </div>
                )}
                
                <div className="flex flex-col gap-2.5 pt-2">
                  {!resetSent && (
                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] hover:brightness-110 text-[#18181B] rounded-xl font-bold text-xs shadow-lg shadow-[#D4A373]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  )}
                  <button
                    onClick={() => { setMode('login'); setResetSent(false); setError(null); }}
                    className="w-full py-2 px-4 border border-zinc-700 hover:border-zinc-500 bg-zinc-800/60 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleAuth}>
                {error && (
                  <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-sm text-[#FAF7F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all"
                    placeholder="driver@safelogix.io"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-sm text-[#FAF7F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-[#D4A373] focus:ring-[#D4A373]"
                    />
                    <span>Remember me</span>
                  </label>
                  
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setMode('reset')} 
                      className="text-[#D4A373] hover:text-[#E9C46A] font-semibold transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] hover:brightness-110 text-[#18181B] rounded-xl font-bold text-xs shadow-lg shadow-[#D4A373]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Portal' : 'Create Account')}
                  </button>
                </div>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                    <span className="px-3 bg-[#202024]">Or One-Click Demo Access</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleMockLogin('driver')}
                    disabled={loading}
                    className="flex justify-center items-center gap-2 py-2 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-[#FAF7F2] rounded-xl text-xs font-semibold transition-all hover:border-[#D4A373]/40"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Driver View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockLogin('admin')}
                    disabled={loading}
                    className="flex justify-center items-center gap-2 py-2 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-[#FAF7F2] rounded-xl text-xs font-semibold transition-all hover:border-[#E9C46A]/40"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#E9C46A]" />
                    <span>Admin HQ</span>
                  </button>
                </div>
                
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-xs text-zinc-400 hover:text-[#FAF7F2] transition-colors"
                  >
                    {mode === 'login' ? "Don't have an operator account? Sign up" : 'Already have an account? Sign In'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
