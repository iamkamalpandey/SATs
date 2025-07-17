const http = require('http');

console.log('🔍 Starting comprehensive server test...');

// Test configuration
const HOST = 'localhost';
const PORT = 3000;
const BASE_URL = `http://${HOST}:${PORT}`;

// Test endpoints
const endpoints = [
  { path: '/', method: 'GET', description: 'Health check' },
  { path: '/health', method: 'GET', description: 'Detailed health check' },
  { path: '/api/admin/dashboard', method: 'GET', description: 'Admin dashboard' },
  { path: '/api/battles', method: 'GET', description: 'Battle list' },
  { path: '/api/challenges/daily', method: 'GET', description: 'Daily challenges' },
  { 
    path: '/api/auth/login', 
    method: 'POST', 
    data: JSON.stringify({ email: 'admin@satbattle.com', password: 'admin123!' }),
    description: 'Admin login' 
  }
];

// Test function
function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const result = {
          endpoint: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          status: res.statusCode,
          response: data,
          success: res.statusCode === 200
        };
        resolve(result);
      });
    });

    req.on('error', (error) => {
      reject({
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        error: error.message,
        success: false
      });
    });

    if (endpoint.data) {
      req.write(endpoint.data);
    }
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log(`🎯 Testing server at ${BASE_URL}`);
  console.log('');
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.description} (${result.method} ${result.endpoint})`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${error.description} (${error.method} ${error.endpoint})`);
      console.log(`   Error: ${error.error}`);
      console.log('');
    }
  }
  
  console.log('🔍 Test complete!');
}

// Check if server is running first
const healthCheck = http.request({
  hostname: HOST,
  port: PORT,
  path: '/',
  method: 'GET'
}, (res) => {
  console.log('🌐 Server is running, starting tests...');
  console.log('');
  runTests();
});

healthCheck.on('error', (error) => {
  console.error('❌ Server is not running or not accessible');
  console.error('❌ Error:', error.message);
  console.error('❌ Make sure the server is started with: node server.js');
  process.exit(1);
});

healthCheck.end();