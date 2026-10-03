const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/uploads/oud-imperial.jpg');
const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

const fileData = fs.readFileSync(filePath);
const filename = 'artisan-flacon.jpg';

const head = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`;
const tail = `\r\n--${boundary}--\r\n`;

const fullBody = Buffer.concat([
  Buffer.from(head, 'utf8'),
  fileData,
  Buffer.from(tail, 'utf8'),
]);

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/upload/single',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': fullBody.length,
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('POST /api/upload/single => Status:', res.statusCode, JSON.parse(data)));
});

req.write(fullBody);
req.end();
