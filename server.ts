import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Code Execution Endpoint (Hybrid: Local + Judge0 Fallback)
  app.post('/api/execute', async (req, res) => {
    try {
      const { language, source, testCases, functionName } = req.body;
      
      const executeOne = async (runner: string, lang: string) => {
        if (lang === 'javascript') {
          try {
            // Write to temp file to avoid huge command strings
            const tmpFile = path.join(process.cwd(), `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.js`);
            fs.writeFileSync(tmpFile, runner);
            const { stdout, stderr } = await execAsync(`node ${tmpFile}`, { timeout: 5000 });
            fs.unlinkSync(tmpFile);
            return { run: { stdout, stderr } };
          } catch (err: any) {
            return { run: { stdout: err.stdout || '', stderr: err.stderr || err.message } };
          }
        } 
        
        if (lang === 'python') {
          try {
            const tmpFile = path.join(process.cwd(), `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);
            fs.writeFileSync(tmpFile, runner);
            const { stdout, stderr } = await execAsync(`python3 ${tmpFile}`, { timeout: 5000 });
            fs.unlinkSync(tmpFile);
            return { run: { stdout, stderr } };
          } catch (err: any) {
            return { run: { stdout: err.stdout || '', stderr: err.stderr || err.message } };
          }
        }

        if (lang === 'cpp') {
          try {
            const response = await axios.post('https://ce.judge0.com/submissions?wait=true', {
              source_code: runner,
              language_id: 54 // C++ (GCC 9.2.0)
            }, { timeout: 15000 });

            return {
              run: {
                stdout: response.data.stdout || '',
                stderr: response.data.stderr || response.data.compile_output || ''
              }
            };
          } catch (err: any) {
            return { run: { stdout: '', stderr: `Judge0 Error: ${err.message}` } };
          }
        }
        
        return { run: { stdout: '', stderr: 'Unsupported language for local runner' } };
      };

      const finalResults = [];
      for (const tc of testCases) {
        let runner = '';
        if (language === 'javascript') {
          runner = `
${source}
try {
  const _res = ${functionName}(${tc.input});
  process.stdout.write(JSON.stringify(_res));
} catch (e) {
  process.stderr.write(e.stack || e.message);
}
`;
        } else if (language === 'python') {
          runner = `
import json, sys
${source}
try:
    _res = ${functionName}(${tc.input})
    sys.stdout.write(json.dumps(_res))
except Exception as e:
    sys.stderr.write(str(e))
`;
        } else if (language === 'cpp') {
          const cppInput = tc.input.replace(/\[/g, '{').replace(/\]/g, '}');
          runner = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <stack>
#include <queue>

template<typename T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& v) {
    os << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        os << v[i] << (i == v.size() - 1 ? "" : ",");
    }
    os << "]";
    return os;
}

${source}

int main() {
    try {
        auto _res = ${functionName}(${cppInput});
        std::cout << _res;
    } catch (...) {
        std::cerr << "Runtime Error";
    }
    return 0;
}
`;
        }
        
        const output = await executeOne(runner, language);
        const actual = (output.run?.stdout || '').trim();
        const stderr = (output.run?.stderr || '').trim();
        
        let status = 'Passed';
        if (stderr) status = 'Runtime Error';
        else if (actual !== String(tc.output).trim()) status = 'Wrong Answer';

        finalResults.push({
          input: tc.input,
          expected: tc.output,
          actual: actual,
          stderr: stderr,
          status: status,
        });
      }

      res.json({ results: finalResults });
    } catch (error: any) {
      console.error('API Error:', error.message);
      res.status(500).json({ error: 'Execution failed', details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
