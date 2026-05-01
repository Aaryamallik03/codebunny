import { motion } from 'motion/react';
import { Rabbit, Zap, Shield, Target, ArrowRight } from 'lucide-react';
import { signIn } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();

  return (
    <div className="relative isolate">
      {/* Hero */}
      <section className="px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bunny-pink/10 text-bunny-pink px-4 py-1.5 brutalist-border mb-8 font-black uppercase text-sm tracking-widest"
        >
          Competitive Programming for Bunnies
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl md:text-8xl font-black tracking-tight uppercase text-[var(--text-main)] mb-8"
        >
          Hop into your <br />
          <span className="text-bunny-pink">Dream Career</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-xl text-[var(--text-secondary)] mb-12"
        >
          The ultimate technical interview sandbox. Practice LeetCode-style challenges, 
          propose your own problems, and get guided help from our Bunny AI.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-6">
          {user ? (
            <button 
              onClick={() => navigate('/problems')}
              className="bg-white text-noir-900 px-10 py-4 brutalist-border font-black uppercase text-xl flex items-center gap-3 hover:-translate-y-2 hover:translate-x-2 transition-transform"
            >
              Start Munching <ArrowRight />
            </button>
          ) : (
            <button 
              onClick={signIn}
              className="bg-bunny-pink text-white px-10 py-4 brutalist-border font-black uppercase text-xl flex items-center gap-3 hover:-translate-y-2 hover:translate-x-2 transition-transform"
            >
              Join the Burrow <Rabbit />
            </button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-[var(--bg-secondary)] border-y-4 border-[var(--border-main)]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Pro Performance", desc: "Monaco-powered editor with multi-language support and real-time execution results." },
            { icon: Shield, title: "Hidden Tests", desc: "Submit against comprehensive hidden test cases to ensure edge-case reliability." },
            { icon: Target, title: "AI Guided", desc: "Stuck? Our Bunny Assistant gives you hints without spoiling the entire solution." }
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 glass-pane flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-bunny-pink/10 flex items-center justify-center border-2 border-bunny-pink text-bunny-pink font-bold">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase text-[var(--text-main)]">{f.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
