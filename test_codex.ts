import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('https://api.codex.jaagrav.in', {
      language: 'cpp',
      code: '#include <iostream>\nint main() { std::cout << "Hello"; return 0; }'
    });
    console.log('Codex Response:', JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error('Codex Failed:', err.message);
  }
}

test();
