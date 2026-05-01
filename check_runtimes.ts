import { execSync } from 'child_process';

function check() {
  console.log('--- Runtime Check ---');
  try {
    const nodeV = execSync('node -v').toString().trim();
    console.log('Node:', nodeV);
  } catch (e) { console.log('Node: Missing'); }

  try {
    const pyV = execSync('python3 --version').toString().trim();
    console.log('Python:', pyV);
  } catch (e) { console.log('Python: Missing'); }

  try {
    const cppV = execSync('g++ --version').toString().trim().split('\n')[0];
    console.log('C++:', cppV);
  } catch (e) { console.log('C++: Missing'); }
  console.log('---------------------');
}

check();
