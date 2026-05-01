import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('https://ce.judge0.com/submissions?wait=true', {
      source_code: '#include <iostream>\nint main(){ std::cout << "judge0 works"; return 0; }',
      language_id: 54 // C++ (GCC 9.2.0)
    });
    console.log('Judge0 Response:', JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error('Judge0 Failed:', err.message);
    if (err.response) console.log('Details:', err.response.data);
  }
}

test();
