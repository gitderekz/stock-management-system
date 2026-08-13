const fs = require('fs');
const path = require('path');

const API = 'http://localhost:3000/api/v1';

async function main() {
  try {
    const fetch = global.fetch || (await import('node-fetch')).default;

    // login
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin1234!' }),
    });
    const loginJson = await loginRes.json();
    if (!loginJson.token) {
      console.error('Login failed:', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log('Logged in, token:', token);

    // create product
    const productPayload = {
      name: `E2E Test Product ${Date.now()}`,
      categoryId: null,
      brandId: null,
      supplierId: null,
      quantity: 5,
      price: 1000,
      condition: 'new',
      serialCode: `E2E-SER-${Date.now()}`,
    };
    const prodRes = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(productPayload),
    });
    const prodJson = await prodRes.json();
    const product = prodJson.data || prodJson;
    console.log('Product created:', product.id || product?.data?.id || product);
    const productId = product.id || (product.data && product.data.id);
    if (!productId) {
      console.error('Failed to create product', prodJson);
      process.exit(1);
    }

    // find first image and video in Downloads
    const downloads = '/home/kali/Downloads';
    const files = fs.readdirSync(downloads || '.');
    const imageFile = files.find((f) => f.match(/\.(jpe?g|png|gif)$/i));
    const videoFile = files.find((f) => f.match(/\.(mp4|mov|webm|mkv)$/i));

    if (!imageFile && !videoFile) {
      console.error('No test image/video found in', downloads);
      process.exit(1);
    }

    const { execSync } = await import('node:child_process');

    const runCurlUpload = (endpoint, filePath) => {
      try {
        const cmd = `curl -s -X POST -H "Authorization: Bearer ${token}" -F "file=@${filePath}" ${API}${endpoint}`;
        const out = execSync(cmd, { encoding: 'utf8' });
        console.log('Upload', filePath, '->', out);
      } catch (e) {
        console.error('Upload failed', e.message || e);
      }
    };

    if (imageFile) {
      const p = path.join(downloads, imageFile);
      console.log('Uploading image', p);
      runCurlUpload(`/products/${productId}/images`, p);
    }

    if (videoFile) {
      const p = path.join(downloads, videoFile);
      console.log('Uploading video', p);
      runCurlUpload(`/products/${productId}/videos`, p);
    }

    // get system logs to verify
    const logsRes = await fetch(`${API}/system-logs?days=7`, { headers: { Authorization: `Bearer ${token}` } });
    const logsJson = await logsRes.json();
    console.log('Recent logs:', (logsJson.data || []).slice(0, 10));

    console.log('E2E upload test complete');
    process.exit(0);
  } catch (err) {
    console.error('E2E test error', err);
    process.exit(1);
  }
}

main();
