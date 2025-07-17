import { seedDatabase } from './sample-data';
import { db } from './db';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed the database
    const seedResult = await seedDatabase();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Created:');
    console.log(`  - Admin user: ${seedResult.adminUser.email}`);
    console.log(`  - ${seedResult.students.length} student users`);
    console.log(`  - ${seedResult.questions.length} SAT questions`);
    console.log(`  - 1 battle royale game`);
    console.log(`  - 1 squad with members`);
    
    console.log('\n🎮 You can now access the application:');
    console.log('  - Landing page: http://localhost:3000');
    console.log('  - Admin login: admin@satbattle.com / admin123!');
    console.log('  - Student login: student1@example.com / student123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();