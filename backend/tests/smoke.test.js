const http = require('http');

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: 'localhost', port: 4000, path }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(body) });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
  });
}

(async () => {
  const health = await getJson('/api/v1/health');
  if (health.status !== 200) {
    throw new Error('Health check failed');
  }

  console.log('Smoke test passed: health API reachable.');
})();
