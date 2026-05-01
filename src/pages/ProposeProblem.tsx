import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Rabbit, Plus, Save, AlertCircle, Eye, Edit3 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import Markdown from 'react-markdown';

export default function ProposeProblem({ user }: { user: User }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    category: 'Arrays',
    description: '',
    functionName: 'solve',
    testCases: [{ input: '', output: '', hidden: false }]
  });
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title || !formData.description || !formData.functionName) {
        throw new Error('All primary fields are required, bunny.');
      }
      if (formData.testCases.some(tc => !tc.input || !tc.output)) {
        throw new Error('All test cases must have input and output.');
      }

      await addDoc(collection(db, 'problems'), {
        ...formData,
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
      navigate('/problems');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => {
    setFormData({ ...formData, testCases: [...formData.testCases, { input: '', output: '', hidden: false }] });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-[var(--bg-main)] min-h-screen transition-colors">
      <div className="flex items-center gap-6 mb-12">
        <div className="bg-bunny-pink p-4 border-4 border-noir-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <Plus className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text-main)]">Propose Challenge</h2>
          <p className="text-[var(--text-secondary)] font-medium">Contribute to the warren by adding a new technical challenge.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-bunny-pink">Title</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] px-4 py-3 font-bold focus:border-bunny-pink outline-none transition-all text-[var(--text-main)]"
                placeholder="e.g. Reverse a LinkedList"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-bunny-pink">Difficulty</label>
              <select 
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] px-4 py-3 font-bold focus:border-bunny-pink outline-none uppercase text-[var(--text-main)]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-bunny-pink">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] px-4 py-3 font-bold focus:border-bunny-pink outline-none uppercase text-[var(--text-main)]"
              >
                {['Arrays', 'Strings', 'Math', 'Dynamic Programming', 'Graphs', 'Trees'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-bunny-pink">Function Name</label>
              <input 
                type="text"
                required
                value={formData.functionName}
                onChange={e => setFormData({ ...formData, functionName: e.target.value })}
                className="bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] px-4 py-3 font-mono font-bold focus:border-bunny-pink outline-none text-[var(--text-main)]"
                placeholder="e.g. reverseList"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-bunny-pink">Description (Markdown)</label>
              <div className="flex bg-[var(--bg-tertiary)] border border-[var(--border-main)] p-1">
                <button 
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 text-[9px] font-black uppercase transition-all ${viewMode === 'edit' ? 'bg-bunny-pink text-white' : 'text-[var(--text-secondary)]'}`}
                >
                  Edit
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-[9px] font-black uppercase transition-all ${viewMode === 'preview' ? 'bg-bunny-pink text-white' : 'text-[var(--text-secondary)]'}`}
                >
                  Preview
                </button>
              </div>
            </div>
            
            <div className="h-[400px] border-2 border-[var(--border-main)] relative overflow-hidden bg-[var(--bg-tertiary)]">
              <AnimatePresence mode="wait">
                {viewMode === 'edit' ? (
                  <motion.div 
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <Editor
                      height="100%"
                      defaultLanguage="markdown"
                      theme="vs-dark"
                      value={formData.description}
                      onChange={(v) => setFormData({ ...formData, description: v || '' })}
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        backgroundColor: '#050505'
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full p-6 overflow-y-auto custom-scrollbar prose prose-invert prose-pink max-w-none text-sm"
                  >
                    <Markdown>{formData.description || "*No description yet...*"}</Markdown>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-widest text-bunny-pink">Test Cases</label>
            <button 
              type="button" 
              onClick={addTestCase}
              className="text-[10px] px-3 py-1 bg-[var(--bg-tertiary)] border-2 border-[var(--border-main)] font-black uppercase hover:bg-bunny-pink hover:text-white transition-all text-[var(--text-main)]"
            >
              Add Case
            </button>
          </div>
          
          <div className="grid gap-4">
            {formData.testCases.map((tc, i) => (
              <div key={i} className="p-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-main)] grid grid-cols-12 gap-4 items-end shadow-sm">
                <div className="col-span-12 md:col-span-5 flex flex-col gap-1">
                   <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Input</label>
                   <input 
                    type="text" 
                    value={tc.input}
                    onChange={e => {
                      const newTC = [...formData.testCases];
                      newTC[i].input = e.target.value;
                      setFormData({ ...formData, testCases: newTC });
                    }}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border-main)] px-3 py-1.5 focus:border-bunny-pink outline-none font-mono text-sm text-[var(--text-main)]"
                   />
                </div>
                <div className="col-span-12 md:col-span-5 flex flex-col gap-1">
                   <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Output</label>
                   <input 
                    type="text" 
                    value={tc.output}
                    onChange={e => {
                      const newTC = [...formData.testCases];
                      newTC[i].output = e.target.value;
                      setFormData({ ...formData, testCases: newTC });
                    }}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border-main)] px-3 py-1.5 focus:border-bunny-pink outline-none font-mono text-sm text-[var(--text-main)]"
                   />
                </div>
                <div className="col-span-12 md:col-span-2 flex items-center gap-2 pb-2">
                   <input 
                    type="checkbox" 
                    checked={tc.hidden}
                    onChange={e => {
                      const newTC = [...formData.testCases];
                      newTC[i].hidden = e.target.checked;
                      setFormData({ ...formData, testCases: newTC });
                    }}
                    className="accent-bunny-pink"
                   />
                   <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Hidden</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border-2 border-red-500 text-red-500 flex items-center gap-3 font-bold text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-bunny-pink text-white py-4 border-4 border-noir-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] font-black uppercase text-xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform disabled:opacity-50"
        >
          {loading ? 'Submitting Proposal...' : <>Propose to Burrow <Save /></>}
        </button>
      </form>
    </div>
  );
}
