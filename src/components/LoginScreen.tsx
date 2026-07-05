/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Key, Upload, LogIn, Sparkles, Check, Sun, Moon } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  logo: string | null;
  schoolName: string;
  appTitle: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function LoginScreen({ onLogin, logo, schoolName, appTitle, theme, onToggleTheme }: LoginScreenProps) {
  const [role, setRole] = useState<UserRole>('Admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Default admin password for easy demoing/testing
  const ADMIN_PASSWORD = '@admin2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'Admin') {
      if (password === ADMIN_PASSWORD) {
        onLogin('Admin');
      } else {
        setError('Password Admin tidak valid. Silakan coba lagi.');
      }
    } else {
      onLogin('Guest');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 p-6 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onToggleTheme}
          type="button"
          className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition-all duration-300 shadow-md backdrop-blur-md flex items-center justify-center cursor-pointer"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Background Ambience Glares */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="my-auto w-full max-w-md mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
          id="login-card"
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-4">
              {logo ? (
                <div className="flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo MBS"
                    className="h-24 w-auto object-contain"
                    referrerPolicy="no-referrer"
                    id="app-uploaded-logo"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="h-10 w-10 animate-pulse" />
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-1">
              {schoolName}
            </h1>
            <span className="mt-2 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              {appTitle}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRole('Guest');
                  setError('');
                }}
                className={`py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                  role === 'Guest'
                    ? 'bg-slate-800 text-slate-100 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="select-role-guest"
              >
                <User className="h-4 w-4" />
                Guest
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('Admin');
                  setError('');
                }}
                className={`py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                  role === 'Admin'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="select-role-admin"
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            </div>

            {/* Password input for Admin */}
            <AnimatePresence mode="wait">
              {role === 'Admin' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Password Administrator
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password admin..."
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 font-mono"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer"
              id="login-button"
            >
              <LogIn className="h-4 w-4" />
              {role === 'Admin' ? 'Masuk sebagai Admin' : 'Masuk sebagai Guest'}
            </button>
          </form>

          {/* Guest Direct Entry Tip */}
          {role === 'Guest' && (
            <div className="text-center mt-4">
              <p className="text-slate-500 text-xs">
                Guest dapat melihat grafik dashboard & menyaring data sebaran.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Developed By Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center text-xs tracking-widest text-slate-400 py-4 font-mono z-10"
      >
        Developed by <span className="text-white font-semibold">Muhamad Ferdian</span>
      </motion.div>
    </div>
  );
}
