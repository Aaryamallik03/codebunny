import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('https://piston.v-os.pw/api/v2/execute', {
      language: 'cpp',
      version: '10.2.0',
      files: [{ content: '#include <iostream>\nint main(){ std::cout << "v-os works"; return 0; }' }]
    });
    console.log('V-OS Response:', JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error('V-OS Failed:', err.message);
  }
}

test();
