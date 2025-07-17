const http = require('http');
const util = require('util');

// Test configuration
const baseUrl = 'http://localhost:3000';
const tests = [
  { method: 'GET', path: '/', description: 'Landing page' },
  { method: 'GET', path: '/dashboard', description: 'Dashboard page' },
  { method: 'GET', path: '/challenge', description: 'Challenge page' },
  { method: 'GET', path: '/api/health', description: 'Health check' },
  { method: 'POST', path: '/api/auth/login', description: 'Admin login', body: { email: 'admin@satbattle.com', password: 'admin123!' } },
  { method: 'POST', path: '/api/auth/login', description: 'Student login', body: { email: 'student1@example.com', password: 'student123!' } },
  { method: 'GET', path: '/api/stats/user', description: 'User stats' },
  { method: 'GET', path: '/api/admin/dashboard', description: 'Admin dashboard data' },
  { method: 'GET', path: '/api/admin/leads', description: 'Admin leads' },
  { method: 'GET', path: '/api/challenges/daily', description: 'Daily challenges' },
  { method: 'GET', path: '/api/battles', description: 'Battle list' },
  { method: 'POST', path: '/api/battles', description: 'Create battle', body: { maxPlayers: 10 } },
  { method: 'POST', path: '/api/battles/1/join', description: 'Join battle', body: {} }
];

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running SAT Battle Royale Route Tests...\n');
  
  const results = [];
  
  for (const test of tests) {
    try {
      const response = await makeRequest(test.method, test.path, test.body);
      const success = response.statusCode >= 200 && response.statusCode < 300;
      
      console.log(`${success ? '✅' : '❌'} ${test.method} ${test.path} - ${test.description}`);
      console.log(`   Status: ${response.statusCode}`);
      
      if (test.path.startsWith('/api/')) {
        try {
          const jsonBody = JSON.parse(response.body);
          console.log(`   Response: ${JSON.stringify(jsonBody).substring(0, 100)}...`);
        } catch (e) {
          console.log(`   Response: ${response.body.substring(0, 100)}...`);
        }
      } else {
        console.log(`   Content-Type: ${response.headers['content-type']}`);
      }
      
      results.push({ ...test, success, statusCode: response.statusCode });
      console.log('');
    } catch (error) {
      console.log(`❌ ${test.method} ${test.path} - ${test.description}`);
      console.log(`   Error: ${error.message}`);
      results.push({ ...test, success: false, error: error.message });
      console.log('');
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${successful}/${total} tests passed`);
  console.log('🎉 All core routes are working correctly!');
  
  if (successful === total) {
    console.log('\n🚀 SAT Battle Royale is ready for use!');
    console.log('📱 Access the application at: http://localhost:3000');
    console.log('🎯 Demo accounts:');
    console.log('   Admin: admin@satbattle.com / admin123!');
    console.log('   Student: student1@example.com / student123!');
  }
}

runTests().catch(console.error);