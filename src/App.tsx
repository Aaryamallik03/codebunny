/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signIn, signOut } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Rabbit, LayoutDashboard, Code, Trophy, LogOut, Github, Terminal, Sparkles, Menu, X, Sun, Moon } from 'lucide-react';

import { Home, ProblemList, ProblemDetails, Profile, ProposeProblem } from './pages';
import { seedData } from './lib/seed';

const Navbar = ({ user, theme, toggleTheme }: { user: User | null, theme: string, toggleTheme: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="h-14 border-b-4 border-bunny-pink bg-[var(--bg-secondary)] flex items-center justify-between px-6 z-50 sticky top-0 transition-colors">
      <div className="flex items-center gap-3 group">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-bunny-pink rounded-sm flex items-center justify-center brutalist-border group-hover:-translate-y-0.5 transition-transform">
            <Rabbit className="w-5 h-5 text-noir-900" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-bunny-pink">CodeBunny</span>
        </Link>
        <span className="text-[10px] font-mono bg-bunny-pink/10 text-bunny-pink px-2 py-0.5 border border-bunny-pink/30 hidden sm:block">BETA V.0.4.2</span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-[var(--border-main)]">
              <Link to="/problems" className="text-xs font-black uppercase hover:text-bunny-pink transition-colors">Problems</Link>
              <Link to="/propose" className="text-xs font-black uppercase hover:text-bunny-pink transition-colors">Propose</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-bunny-pink/10 text-bunny-pink rounded-full transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] whitespace-nowrap">XP Progress</span>
                <div className="w-24 h-1 bg-[var(--border-main)] mt-1">
                  <div className="h-full bg-bunny-pink" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <Link to="/profile" className="flex items-center gap-3 border-2 border-bunny-pink p-0.5 bg-[var(--bg-tertiary)] hover:-translate-y-0.5 transition-transform shrink-0">
                <img src={user.photoURL || ''} className="w-8 h-8 bg-pink-200" alt="Profile" />
              </Link>
              
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 hover:bg-[var(--bg-tertiary)] text-bunny-pink"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <button onClick={signOut} className="hidden sm:block p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="fixed inset-y-0 right-0 w-64 bg-[var(--bg-secondary)] border-l-4 border-bunny-pink z-[60] p-6 shadow-2xl lg:hidden flex flex-col"
                >
                  <button onClick={() => setIsOpen(false)} className="self-end mb-8 p-2 text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => { toggleTheme(); setIsOpen(false); }}
                      className="text-2xl font-black uppercase hover:text-bunny-pink text-left flex items-center gap-3"
                    >
                      {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                      Mode
                    </button>
                    <Link to="/problems" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase hover:text-bunny-pink">Problems</Link>
                    <Link to="/propose" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase hover:text-bunny-pink">Propose</Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase hover:text-bunny-pink">Profile</Link>
                    <button onClick={() => { signOut(); setIsOpen(false); }} className="text-2xl font-black uppercase text-red-500 text-left mt-8 flex items-center gap-2">
                       <LogOut className="w-6 h-6" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-bunny-pink/10 text-bunny-pink rounded-full transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={signIn}
              className="bg-bunny-pink text-noir-900 px-6 py-1.5 border-2 border-bunny-pink font-black uppercase text-xs hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)]"
            >
              Join the Burrow
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    seedData();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-main)] gap-4">
      <motion.div 
        animate={{ y: [0, -20, 0] }} 
        transition={{ repeat: Infinity, duration: 0.6 }}
        className="bg-bunny-pink p-4 brutalist-border"
      >
        <Rabbit className="w-12 h-12 text-white" />
      </motion.div>
      <span className="font-black uppercase tracking-widest text-bunny-pink animate-pulse">Munching on bugs...</span>
    </div>
  );

  return (
    <BrowserRouter>
      <div className={`min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden selection:bg-bunny-pink selection:text-white transition-colors duration-300`}>
        <Navbar user={user} theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/problems" element={user ? <ProblemList user={user} /> : <Navigate to="/" />} />
              <Route path="/problems/:id" element={user ? <ProblemDetails user={user} theme={theme} /> : <Navigate to="/" />} />
              <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
              <Route path="/propose" element={user ? <ProposeProblem user={user} /> : <Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        {/* Bottom Status Bar */}
        <footer className="h-6 bg-bunny-pink text-noir-900 px-4 flex items-center justify-between text-[9px] md:text-[10px] font-black uppercase shrink-0">
          <div className="flex gap-2 md:gap-4 overflow-hidden">
            <span className="whitespace-nowrap">Status: Connected</span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <span className="whitespace-nowrap hidden sm:inline">Latency: 24ms</span>
          </div>
          <div className="flex gap-4 items-center overflow-hidden">
             <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-noir-900 animate-pulse" />
                <span className="hidden xs:inline">Recording Active</span>
             </div>
             <span className="opacity-40">|</span>
             <span className="whitespace-nowrap">v0.4.2-{theme}</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
