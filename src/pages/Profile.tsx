import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { motion } from 'motion/react';
import { Trophy, Zap, Clock, Rabbit, ChevronRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export default function Profile({ user }: { user: User }) {
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get or create profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        const newProfile = {
          displayName: user.displayName,
          photoURL: user.photoURL,
          problemsSolved: 0,
          xp: 0,
          email: user.email,
          streak: 0
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }

      // Get submissions
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const subSnap = await getDocs(q);
      setSubmissions(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, [user]);

  if (!profile) return <div className="p-12 text-center text-bunny-pink font-black uppercase bg-[var(--bg-main)]">Loading your burrow...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-[var(--bg-main)] min-h-screen transition-colors">
      <div className="grid md:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] shadow-sm p-6 text-center">
            <div className="relative inline-block mb-6 group">
              <img src={user.photoURL || ''} className="w-32 h-32 border-2 border-bunny-pink shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)] transition-transform group-hover:scale-105" />
              <div className="absolute -bottom-2 -right-2 bg-bunny-pink p-1.5 border-2 border-[var(--bg-secondary)]">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-1 text-[var(--text-main)]">{profile.displayName}</h2>
            <p className="text-[var(--text-secondary)] font-bold text-[10px] uppercase mb-6 tracking-widest bg-[var(--bg-tertiary)] inline-block px-2 py-0.5 border border-[var(--border-main)]">{profile.email}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 text-left">
              <div className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-main)]">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mb-1">Solved</p>
                <div className="flex items-center gap-2">
                  <Rabbit className="w-4 h-4 text-bunny-pink" />
                  <p className="text-xl font-black text-[var(--text-main)]">{profile.problemsSolved}</p>
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-main)]">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mb-1">XP</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-bunny-pink" />
                  <p className="text-xl font-black text-[var(--text-main)]">{profile.xp}</p>
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-main)]">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mb-1">Streak</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-bunny-pink" />
                  <p className="text-xl font-black text-[var(--text-main)]">{profile.streak || 0}d</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-bunny-pink/5 border-2 border-bunny-pink/20 text-bunny-pink">
             <div className="flex items-center gap-2 mb-2 font-black uppercase text-[10px] tracking-widest">
                <Trophy className="w-4 h-4" /> Bunny Rank
             </div>
             <p className="text-[11px] font-bold leading-relaxed opacity-80">You're currently a <span className="underline italic">Kit Programmer</span>. Solve 5 more problems to reach <span className="underline italic">Warren Master</span>!</p>
          </div>
        </div>

        {/* History */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--border-main)] pb-4">
            <h3 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-[var(--text-main)]">
              Recent Activity
            </h3>
            <span className="text-[10px] font-black bg-[var(--bg-secondary)] px-3 py-1 border border-[var(--border-main)] text-[var(--text-secondary)] uppercase">{submissions.length} Submissions</span>
          </div>
          
          <div className="space-y-3">
            {submissions.map((sub, i) => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-main)] flex items-center justify-between group hover:border-bunny-pink transition-all hover:bg-[var(--bg-tertiary)]"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 border ${sub.status === 'Accepted' ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500' : 'bg-red-500/5 border-red-500/30 text-red-500'}`}>
                    {sub.status === 'Accepted' ? <CheckCircle2 className="w-4 h-4" /> : <Rabbit className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm group-hover:text-bunny-pink transition-colors text-[var(--text-main)]">Challenge: {sub.problemId.slice(0, 8).toUpperCase()}</h4>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                      {sub.language} runtime • {sub.createdAt ? new Date(sub.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-[9px] px-2 py-0.5 border font-black tracking-widest uppercase ${sub.status === 'Accepted' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                    {sub.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--border-accent)] group-hover:text-bunny-pink transition-colors" />
                </div>
              </motion.div>
            ))}
            {submissions.length === 0 && (
              <div className="p-20 text-center border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-secondary)]">
                <Zap className="w-10 h-10 text-[var(--text-secondary)]/30 mx-auto mb-4" />
                <p className="font-black uppercase text-[10px] tracking-widest text-[var(--text-secondary)]">No tracks found. Get hopping!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
