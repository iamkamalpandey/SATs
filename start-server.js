// Start the enhanced SAT Battle Royale application
const { spawn } = require('child_process');

console.log('🚀 Starting Enhanced SAT Battle Royale Application...');
console.log('✨ Features: Real-time battles, AI hints, achievements, animations');

const server = spawn('node', ['app.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3000 }
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

server.on('exit', (code) => {
  console.log(`🔄 Server exited with code ${code}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.kill();
  process.exit(0);
});

// Show startup message
setTimeout(() => {
  console.log('\n🌟 SAT Battle Royale Enhanced Features:');
  console.log('   • Interactive landing page with role selection');
  console.log('   • Real-time battle royale system');
  console.log('   • AI-powered hint system');
  console.log('   • Achievement and progression tracking');
  console.log('   • Animated UI with smooth transitions');
  console.log('   • Enhanced challenge interface');
  console.log('   • Dynamic admin dashboard');
  console.log('\n🔗 Access the application at: http://localhost:3000');
  console.log('📊 Health check: http://localhost:3000/health');
  console.log('🎯 Demo login: student1@example.com / student123!');
}, 2000);