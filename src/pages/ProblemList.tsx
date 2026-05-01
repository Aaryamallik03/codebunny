import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, Rabbit, Timer, CheckCircle, ChevronRight, BarChart3, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
}

export default function ProblemList({ user }: { user: User }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', 'Arrays', 'Strings', 'Math', 'Dynamic Programming', 'Graphs', 'Trees'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'problems'), orderBy('title'));
        const snapshot = await getDocs(q);
        const problemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Problem));
        setProblems(problemsData);

        // Fetch solved problems
        const subQ = query(
          collection(db, 'submissions'),
          where('userId', '==', user.uid),
          where('status', '==', 'Accepted')
        );
        const subSnapshot = await getDocs(subQ);
        const solved = new Set(subSnapshot.docs.map(d => d.data().problemId));
        setSolvedIds(solved);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredProblems = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const solvedCount = solvedIds.size;
  const totalCount = problems.length;

  if (loading) return (
    <div className="p-12 text-center animate-pulse uppercase font-black text-bunny-pink bg-[var(--bg-main)] h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Rabbit className="w-12 h-12 animate-bounce" />
        Sniffing out problems...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-[var(--bg-main)] min-h-screen transition-colors">
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <div className="mb-10">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-[var(--text-main)] flex items-center gap-3">
              <Rabbit className="w-8 h-8 text-bunny-pink" />
              The Burrow
            </h2>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input 
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] font-bold text-[12px] focus:border-bunny-pink outline-none transition-all text-[var(--text-main)]"
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
                {difficulties.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase border transition-all whitespace-nowrap",
                      selectedDifficulty === d 
                        ? "bg-bunny-pink text-white border-bunny-pink" 
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-main)] hover:border-bunny-pink/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase border-b-2 transition-all",
                    selectedCategory === cat 
                      ? "border-bunny-pink text-bunny-pink bg-bunny-pink/5" 
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--border-main)]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-[var(--border-main)] bg-[var(--bg-secondary)] shadow-sm">
            <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--border-main)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <th className="px-6 py-4 text-[10px] font-black uppercase w-12">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase">Title</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase">Solution</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase">Acceptance</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase">Difficulty</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[var(--border-main)]/30">
            {filteredProblems.length > 0 ? filteredProblems.map((problem, i) => (
              <motion.tr
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "group transition-colors",
                  i % 2 === 0 ? "bg-transparent" : "bg-[var(--bg-tertiary)]/10"
                )}
              >
                <td className="px-6 py-4">
                  {solvedIds.has(problem.id) ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[var(--border-main)]" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <Link to={`/problems/${problem.id}`} className="text-sm font-black uppercase text-[var(--text-main)] group-hover:text-bunny-pink transition-colors tracking-tight">
                      {problem.title}
                    </Link>
                    <span className="text-[8px] font-black text-bunny-pink/70 uppercase tracking-tighter">{problem.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="p-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-main)] inline-block opacity-40">
                     <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" />
                   </div>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-[var(--text-secondary)]">
                   {Math.floor(Math.random() * 20 + 70)}.%
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider",
                    problem.difficulty === 'Easy' ? "text-emerald-500" :
                    problem.difficulty === 'Medium' ? "text-orange-500" : 
                    "text-red-500"
                  )}>
                    {problem.difficulty}
                  </span>
                </td>
              </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <Rabbit className="w-12 h-12 text-[var(--text-secondary)]/20 mx-auto mb-4" />
                       <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px]">No tracks found in this burrow.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 pt-4 lg:pt-36">
           <div className="p-6 border-4 border-noir-900 bg-bunny-pink text-white brutalist-shadow">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-black uppercase text-sm tracking-widest">Burrow Stats</h3>
               <BarChart3 className="w-5 h-5" />
             </div>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span>Solved</span>
                    <span>{solvedCount} / {totalCount}</span>
                  </div>
                  <div className="h-4 bg-noir-900/20 p-0.5">
                    <div 
                      className="h-full bg-white transition-all duration-1000" 
                      style={{ width: `${(solvedCount / Math.max(totalCount, 1)) * 100}%` }}
                    />
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 p-2 text-center">
                    <div className="text-[10px] font-black">{problems.filter(p => p.difficulty === 'Easy' && solvedIds.has(p.id)).length} / {problems.filter(p => p.difficulty === 'Easy').length}</div>
                    <div className="text-[8px] font-black uppercase opacity-60">Easy</div>
                  </div>
                  <div className="bg-white/10 p-2 text-center">
                    <div className="text-[10px] font-black">{problems.filter(p => p.difficulty === 'Medium' && solvedIds.has(p.id)).length} / {problems.filter(p => p.difficulty === 'Medium').length}</div>
                    <div className="text-[8px] font-black uppercase opacity-60">Med</div>
                  </div>
                  <div className="bg-white/10 p-2 text-center">
                    <div className="text-[10px] font-black">{problems.filter(p => p.difficulty === 'Hard' && solvedIds.has(p.id)).length} / {problems.filter(p => p.difficulty === 'Hard').length}</div>
                    <div className="text-[8px] font-black uppercase opacity-60">Hard</div>
                  </div>
               </div>

               <button 
                onClick={() => {
                  const randomProblem = problems[Math.floor(Math.random() * problems.length)];
                  if (randomProblem) window.location.href = `/problems/${randomProblem.id}`;
                }}
                className="w-full py-2 bg-noir-900 text-white text-[10px] font-black uppercase brutalist-border flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] hover:text-bunny-pink transition-all"
               >
                 <Sparkles className="w-3.5 h-3.5" />
                 Surprise Me
               </button>
             </div>
           </div>

           <div className="p-6 border-2 border-[var(--border-main)] bg-[var(--bg-secondary)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                <TrendingUp className="w-16 h-16 text-bunny-pink" />
             </div>
             <h3 className="font-black uppercase text-xs tracking-widest mb-2 text-[var(--text-secondary)]">Daily Sniff</h3>
             <p className="text-sm font-black uppercase mb-4 text-[var(--text-main)]">Solve 2 Easy problems to earn 50 XP</p>
             <button className="w-full py-2 bg-[var(--bg-tertiary)] border border-[var(--border-main)] text-[10px] font-black uppercase hover:bg-bunny-pink hover:text-white hover:border-bunny-pink transition-all">
               Check Progress
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

