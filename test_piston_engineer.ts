import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('https://piston.engineer/api/v2/execute', {
      language: 'js',
      version: '18.15.0',
      files: [{ content: 'console.log("hi")' }]
    });
    console.log('Piston Engineer Response:', JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error('Piston Engineer Failed:', err.message);
  }
}

test();
