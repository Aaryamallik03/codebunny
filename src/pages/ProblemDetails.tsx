import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, increment, collection, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Editor from '@monaco-editor/react';
import Markdown from 'react-markdown';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Send, ChevronRight, Rabbit, MessageSquare, Terminal, AlertCircle, CheckCircle2, XCircle, Sparkles, Loader2, Timer as TimerIcon, StopCircle, ArrowRight, BookOpen, Trophy } from 'lucide-react';
import { getBunnyAssistant } from '../lib/gemini';
import { User } from 'firebase/auth';

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  stderr: string;
  status: string;
}

const Timer = ({ active }: { active: boolean }) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let interval: any;
    if (active) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active]);

  const format = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-noir-950 px-3 py-1 border border-slate-800 font-mono text-xs font-black text-bunny-pink">
      <TimerIcon className="w-3 h-3" /> {format(seconds)}
    </div>
  );
};

const SuccessModal = ({ onContinue, theme }: { onContinue: () => void, theme: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-noir-950/95 backdrop-blur-md p-6"
  >
    <motion.div 
      initial={{ scale: 0.8, y: 50, rotate: -2 }}
      animate={{ scale: 1, y: 0, rotate: 0 }}
      className={`max-w-md w-full p-8 md:p-12 text-center relative shadow-[8px_8px_0px_0px_#EC4899] border-4 ${
        theme === 'light' ? 'bg-white border-noir-900' : 'bg-noir-800 border-bunny-pink'
      }`}
    >
      {/* Decorative Doodles */}
      <motion.div 
        animate={{ rotate: 360, x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-6 -left-6 text-bunny-pink/30 pointer-events-none"
      >
        <Sparkles className="w-20 h-20" />
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -bottom-4 -right-4 text-bunny-pink/30 pointer-events-none"
      >
        <Trophy className="w-24 h-24" />
      </motion.div>

      {/* Floating Carrots & Hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            y: [-20, -120], 
            x: [0, (i % 2 === 0 ? 50 : -50)] 
          }}
          transition={{ 
            duration: 2 + Math.random(), 
            repeat: Infinity, 
            delay: i * 0.4 
          }}
          className="absolute top-1/2 left-1/2 text-2xl pointer-events-none"
        >
          {i % 3 === 0 ? '🥕' : i % 3 === 1 ? '✨' : '💖'}
        </motion.div>
      ))}

      <motion.div 
        animate={{ y: [0, -25, 0], rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        className="inline-block mb-8 relative"
      >
        <div className="bg-bunny-pink p-6 border-4 border-noir-900 shadow-[6px_6px_0px_0px_#000]">
            <Rabbit className="w-20 h-20 text-noir-900" />
        </div>
      </motion.div>

      <h2 className={`text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic drop-shadow-md ${
        theme === 'light' ? 'text-noir-900' : 'text-white'
      }`}>
        YAYYY!!
      </h2>
      <p className="text-bunny-pink font-black uppercase tracking-widest text-sm mb-12 border-y border-bunny-pink/30 py-2">
        Challenge Conquered, Pro Bunny!
      </p>
      
      <button 
        onClick={onContinue}
        className="w-full bg-bunny-pink text-white py-4 font-black uppercase text-xl border-4 border-noir-900 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0 transition-transform flex items-center justify-center gap-3"
      >
        Next Hop <ArrowRight className="w-6 h-6" />
      </button>

      <div className="mt-8 flex justify-center gap-3">
         {[1,2,3,4,5].map(i => (
           <motion.div 
             key={i} 
             animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
             transition={{ delay: i * 0.15, repeat: Infinity }}
             className="w-2.5 h-2.5 bg-bunny-pink rounded-full border border-noir-900/20" 
           />
         ))}
      </div>
    </motion.div>
  </motion.div>
);

export default function ProblemDetails({ user, theme }: { user: User, theme: 'dark' | 'light' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp'>('javascript');
  const [activeTab, setActiveTab] = useState<'results' | 'console' | 'assistant' | 'submissions'>('results');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      const docRef = doc(db, 'problems', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProblem(data);
        
        // Try loading from localStorage first
        const savedCode = localStorage.getItem(`bunny_code_${id}_${language}`);
        if (savedCode) {
          setCode(savedCode);
        } else {
          // Default boilerplate
          if (language === 'javascript') {
            setCode(`function ${data.functionName}(n) {\n  // Your code here\n  return n;\n}`);
          } else if (language === 'python') {
            setCode(`def ${data.functionName}(n):\n    # Your code here\n    return n`);
          } else if (language === 'cpp') {
            setCode(`int ${data.functionName}(int n) {\n    // Your code here\n    return n;\n}`);
          }
        }
      }
    };
    fetchProblem();
  }, [id, language]);

  // Autosave
  useEffect(() => {
    if (code && id && problem) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`bunny_code_${id}_${language}`, code);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [code, id, language, problem]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user || !id) return;
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', user.uid),
        where('problemId', '==', id),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, user, id]);

  const runCode = async (isSubmission: boolean) => {
    setExecuting(true);
    setActiveTab('results');
    try {
      const testCasesToRun = isSubmission 
        ? problem.testCases 
        : problem.testCases.filter((tc: any) => !tc.hidden);

      const resp = await axios.post('/api/execute', {
        language,
        source: code,
        testCases: testCasesToRun,
        functionName: problem.functionName
      });

      setResults(resp.data.results);
      
      const allPassed = resp.data.results.every((r: any) => r.status === 'Passed');

      if (isSubmission) {
        // Record all submissions, even failed ones
        await addDoc(collection(db, 'submissions'), {
          userId: user.uid,
          problemId: id,
          code,
          language,
          status: allPassed ? 'Accepted' : 'Wrong Answer',
          createdAt: serverTimestamp()
        });

        if (allPassed) {
          setTimerActive(false);
          setIsSuccess(true);
          
          // Update profile
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          
          const now = new Date();
          let newStreak = userData?.streak || 1;
          const lastSub = userData?.lastSubmissionDate?.toDate();
          
          if (lastSub) {
            const diff = (now.getTime() - lastSub.getTime()) / (1000 * 3600 * 24);
            if (diff >= 1 && diff < 2) {
               newStreak += 1;
            } else if (diff >= 2) {
               newStreak = 1;
            }
          }

          await updateDoc(userRef, {
            problemsSolved: increment(1),
            xp: increment(problem.difficulty === 'Easy' ? 100 : problem.difficulty === 'Medium' ? 250 : 500),
            streak: newStreak,
            lastSubmissionDate: serverTimestamp()
          });
        }
      }
    } catch (err: any) {
      console.error('Execution Error:', err);
      setResults([{
        input: 'N/A',
        expected: 'N/A',
        actual: 'ERROR',
        stderr: err.response?.data?.error || err.message || 'The Burrow Terminal is having trouble. Please try again in a moment!',
        status: 'Terminal Error'
      }]);
    } finally {
      setExecuting(false);
    }
  };

  const askAssistant = async (prompt: string) => {
    setAiLoading(true);
    setActiveTab('assistant');
    try {
      const history = [...aiMessages, { role: 'user', content: prompt }];
      const response = await getBunnyAssistant(aiMessages, `Problem: ${problem.title}\nDescription: ${problem.description}\nMy current code:\n${code}\n\nUser Question: ${prompt}`);
      setAiMessages([...history, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!problem) return <div className="p-12 text-center text-bunny-pink font-black uppercase">Setting up the sandbox...</div>;

  return (
    <div className="h-screen md:h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-[var(--bg-main)] transition-colors">
      <AnimatePresence>
        {isSuccess && <SuccessModal onContinue={() => navigate('/problems')} theme={theme} />}
      </AnimatePresence>

      {/* Left: Problem Description - Collapsible or scrollable on mobile */}
      <section className="w-full md:w-[320px] lg:w-[400px] border-r-4 border-[var(--border-main)] bg-[var(--bg-secondary)] flex flex-col overflow-hidden shrink-0">
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border transition-colors ${
              problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              problem.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {problem.difficulty}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--bg-tertiary)] px-2 py-1 border border-[var(--border-main)] text-[var(--text-secondary)]">{problem.category}</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black mb-6 border-l-4 border-bunny-pink pl-4 leading-tight uppercase tracking-tight text-[var(--text-main)]">
            {problem.title}
          </h1>

          <div className={`prose prose-invert prose-pink max-w-none text-sm leading-relaxed mb-8 ${theme === 'light' ? 'text-noir-800' : 'text-slate-300'}`}>
            <Markdown>{problem.description}</Markdown>
          </div>

          <div className="space-y-2 mt-auto pt-8 border-t border-[var(--border-main)]">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--text-secondary)]">
                <BookOpen className="w-3 h-3" /> Topic Tags
             </div>
             <div className="flex flex-wrap gap-2">
                <span className="bg-[var(--bg-tertiary)] px-2 py-0.5 border border-[var(--border-main)] text-[10px] font-bold uppercase text-[var(--text-secondary)]">{problem.category}</span>
                <span className="bg-[var(--bg-tertiary)] px-2 py-0.5 border border-[var(--border-main)] text-[10px] font-bold uppercase text-[var(--text-secondary)]">Technical Noir</span>
             </div>
          </div>
        </div>
      </section>

      {/* Center: Code Editor Section */}
      <section className="flex-1 flex flex-col bg-[var(--bg-tertiary)] overflow-hidden border-b-4 md:border-b-0 border-[var(--border-main)]">
        {/* Editor Header */}
        <div className="h-12 bg-[var(--bg-secondary)] border-b-2 border-[var(--border-main)] flex items-center justify-between px-4 shrink-0 overflow-x-auto">
          <div className="flex h-full items-center shrink-0">
            <div className="flex h-full mr-2 md:mr-4">
              <button className={`px-3 md:px-4 h-full border-t-2 border-bunny-pink text-[10px] md:text-xs font-bold text-bunny-pink whitespace-nowrap transition-colors ${theme === 'light' ? 'bg-white' : 'bg-noir-950'}`}>
                solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'cpp'}
              </button>
              <select 
                value={language} 
                onChange={(e: any) => setLanguage(e.target.value)}
                className="bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-main)] text-[10px] md:text-xs font-bold px-2 md:px-4 outline-none cursor-pointer border-none"
              >
                <option value="javascript">JS</option>
                <option value="python">PY</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            
            <Timer active={timerActive} />
          </div>

          <div className="flex gap-2 md:gap-3 shrink-0">
            <button 
              onClick={() => runCode(false)}
              disabled={executing}
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-3 md:px-4 py-1.5 border-2 transition-all disabled:opacity-50 ${theme === 'light' ? 'border-light-pink-200 text-noir-900 hover:border-bunny-pink' : 'border-slate-700 text-slate-300 hover:border-bunny-pink'}`}
            >
              {executing ? '...' : 'Run'}
            </button>
            <button 
              onClick={() => runCode(true)}
              disabled={executing}
              className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-3 md:px-4 py-1.5 bg-bunny-pink text-white hover:bg-pink-400 transition-all shadow-[2px_2px_0px_0px_rgba(236,72,153,0.3)] md:shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)] disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 relative overflow-hidden bg-[var(--bg-tertiary)] min-h-[300px]">
          <Editor
            height="100%"
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            language={language}
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono',
              minimap: { enabled: false },
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              backgroundColor: theme === 'dark' ? '#050505' : '#FFF1F2',
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3
            }}
          />
        </div>

        {/* Console / Test Cases */}
        <div className="h-48 border-t-4 border-[var(--border-main)] bg-[var(--bg-secondary)] flex flex-col">
          <div className="flex border-b border-[var(--border-main)]">
            <button 
              onClick={() => setActiveTab('results')}
              className={`px-6 py-2 text-[10px] font-black uppercase transition-all ${activeTab === 'results' ? 'text-bunny-pink border-b-2 border-bunny-pink' : 'text-[var(--text-secondary)]'}`}
            >
              Test Results
            </button>
            <button 
              onClick={() => setActiveTab('console')}
              className={`px-6 py-2 text-[10px] font-black uppercase transition-all ${activeTab === 'console' ? 'text-bunny-pink border-b-2 border-bunny-pink' : 'text-[var(--text-secondary)]'}`}
            >
              Console
            </button>
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-2 text-[10px] font-black uppercase transition-all ${activeTab === 'submissions' ? 'text-bunny-pink border-b-2 border-bunny-pink' : 'text-[var(--text-secondary)]'}`}
            >
              Past Tracks
            </button>
          </div>
          
          <div className="p-4 flex-1 font-mono text-[11px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'results' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {results && results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.map((r, i) => (
                        <div key={i} className={`p-3 border-2 transition-all ${r.status === 'Passed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Case #{i + 1}</span>
                             <span className={`text-[9px] font-black px-1.5 py-0.5 uppercase border ${r.status === 'Passed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>
                                {r.status}
                             </span>
                          </div>
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Input:</span>
                              <span className="text-[var(--text-main)] truncate max-w-[150px]">{r.input}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Expected:</span>
                              <span className="text-emerald-500 font-bold">{r.expected}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Actual:</span>
                              <span className={r.status === 'Passed' ? 'text-emerald-500' : 'text-red-500'}>{r.actual || 'null'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                      <Terminal className="w-12 h-12 mb-4 text-bunny-pink" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Hop to it! Click "Run" to test your burrow.</p>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'submissions' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {submissions.length > 0 ? submissions.map((s) => (
                    <div key={s.id} className="p-2 border border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-tertiary)]">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 border ${s.status === 'Accepted' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                          {s.status}
                        </span>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-[var(--text-main)] uppercase">{s.language}</span>
                           <span className="text-[8px] text-[var(--text-secondary)]">{s.createdAt ? new Date(s.createdAt.toDate()).toLocaleString() : 'Just now'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCode(s.code)}
                        className="text-[9px] font-black uppercase text-bunny-pink hover:bg-bunny-pink hover:text-white px-2 py-1 transition-colors border border-bunny-pink/20"
                      >
                        Restore
                      </button>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                      <TimerIcon className="w-12 h-12 mb-4 text-bunny-pink" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">No tracks recorded here yet.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   {results && results.some(r => r.stderr) ? (
                    results.map((r, i) => r.stderr && (
                      <div key={i} className="p-3 bg-red-500/5 border-l-2 border-red-500 mb-2">
                        <span className="font-black text-red-500 block mb-1 uppercase tracking-tighter">ERROR @ CASE #{i+1}</span>
                        <pre className="whitespace-pre-wrap text-red-400 text-[10px] leading-tight">{r.stderr}</pre>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                       <MessageSquare className="w-12 h-12 mb-4 text-bunny-pink" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">The burrow is quiet. No logs recorded.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Right: Bunny AI Assistant */}
      <section className="w-full md:w-64 border-l-4 border-[var(--border-main)] bg-[var(--bg-secondary)] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--border-main)] flex items-center gap-3 bg-bunny-pink/5">
          <div className="w-8 h-8 rounded-full bg-bunny-pink flex items-center justify-center border-2 border-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Rabbit className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-bunny-pink">AI Help Bunny</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          <div className="space-y-4">
            {aiMessages.length === 0 && (
              <div className="bg-[var(--bg-tertiary)] p-3 border-l-2 border-bunny-pink text-[11px] leading-relaxed text-[var(--text-main)] shadow-sm">
                <span className="text-bunny-pink font-bold block mb-1 underline uppercase italic">Assistant Bunny:</span>
                Sniffing out challenges? I can help with logic, complexity, or debugging hints. Just say the word!
              </div>
            )}
            {aiMessages.map((m, i) => (
              <div key={i} className={`p-3 border-l-2 text-[11px] leading-relaxed ${m.role === 'user' ? 'border-[var(--border-accent)] bg-[var(--bg-tertiary)] text-right' : 'border-bunny-pink bg-pink-500/5 text-[var(--text-main)] shadow-sm'}`}>
                {m.role === 'model' && <span className="text-bunny-pink font-bold block mb-1 underline uppercase italic">Bunny:</span>}
                {m.content}
              </div>
            ))}
            {aiLoading && <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-bunny-pink" /></div>}
          </div>
        </div>

        <div className="p-4 bg-[var(--bg-tertiary)] mt-auto border-t border-[var(--border-main)]">
          <div className="flex flex-col gap-2 mb-4">
            {['Get a Step Hint', 'Complexity Analysis', 'Debugging Tips'].map(tip => (
              <button 
                key={tip}
                onClick={() => askAssistant(tip)}
                disabled={aiLoading}
                className="w-full text-left p-2 border border-[var(--border-main)] hover:border-bunny-pink/50 hover:bg-bunny-pink/5 text-[10px] text-[var(--text-secondary)] group flex items-center justify-between transition-all disabled:opacity-50"
              >
                <span>{tip}</span>
                <ChevronRight className="w-3 h-3 text-bunny-pink opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask the bunny..."
              disabled={aiLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  askAssistant((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-main)] text-[10px] px-3 py-2 pr-8 focus:outline-none focus:border-bunny-pink text-[var(--text-main)] transition-colors"
            />
            <button className="absolute right-2 text-bunny-pink hover:scale-110 transition-transform">
              <Sparkles className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
