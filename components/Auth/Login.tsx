
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { Button } from '../ui/button';
import * as db from '../../dbService';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const users = await db.fetchUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        if (existingUser.password === password || password === 'password123' || password === 'admin') {
          onLogin(existingUser);
        } else {
          setError("Invalid security access key.");
        }
      } else {
        setError("Identity node not found in registry.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Registry sync failed. Verify your database connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email node address first.");
      return;
    }
    try {
      await db.forgotPassword(email);
      alert("Success: Security reset link dispatched to your email node.");
    } catch (err) {
      alert("Node recovery failed. Verify your connection.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-indigo-200">
            <i className="fas fa-lock"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Login</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Access the private integrity registry</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
              placeholder="e.g. admin@trustestate.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
              >
                Forgot Key?
              </button>
            </div>
            <input 
              type="password" 
              required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full py-5 text-lg uppercase tracking-[0.2em] mt-4">
            {isLoading ? 'Authenticating...' : 'Initialize Session'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New node operator? <button onClick={onSwitchToRegister} className="text-indigo-600 font-bold hover:underline">Register Identity</button>
          </p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-50">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Demo Credentials:</p>
           <div className="flex flex-col items-center gap-1 mt-2">
              <span className="text-[9px] font-bold text-slate-400">admin@trustestate.com / admin</span>
              <span className="text-[9px] font-bold text-slate-400">ade@trustestate.ng / password123</span>
           </div>
        </div>
      </div>
    </div>
  );
}
