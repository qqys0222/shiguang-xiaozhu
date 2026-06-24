const { spawn } = require('child_process');
const http = require('http');

const vite = spawn('cmd.exe', ['/c', 'npx', 'vite', '--port', '5173', '--host', '127.0.0.1'], {
  cwd: 'D:\\opencode操作\\shiguang-xiaozhu',
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
});

let started = false;

vite.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write('[vite] ' + text);
  if (!started && text.includes('Local:')) {
    started = true;
    setTimeout(testServer, 800);
  }
});

vite.stderr.on('data', (data) => {
  process.stderr.write('[vite:err] ' + data.toString());
});

function testServer() {
  http.get('http://127.0.0.1:5173/', (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      console.log('\n=== TEST RESULT ===');
      console.log('Status:', res.statusCode);
      const title = body.match(/<title>(.*?)<\/title>/)?.[1] || 'not found';
      console.log('Title:', title);
      console.log('Body length:', body.length);
      console.log('Has root div:', body.includes('id="root"'));
      console.log('=== TEST PASSED ===');
      vite.kill();
      process.exit(0);
    });
  }).on('error', (e) => {
    console.log('\n=== TEST FAILED ===');
    console.log('Error:', e.message);
    vite.kill();
    process.exit(1);
  });
}

setTimeout(() => {
  console.log('Timeout waiting for Vite');
  vite.kill();
  process.exit(1);
}, 30000);
