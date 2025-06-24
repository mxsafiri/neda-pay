// Simple script to test database connection directly
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing database connection...');
  
  // Get environment variables
  const directDbUrl = process.env.DIRECT_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  
  console.log('Environment variables:');
  console.log(`- DIRECT_DATABASE_URL set: ${!!directDbUrl}`);
  console.log(`- DATABASE_URL set: ${!!dbUrl}`);
  
  if (!directDbUrl) {
    console.error('ERROR: DIRECT_DATABASE_URL is not set!');
    process.exit(1);
  }
  
  // Create a masked version of the URL for logging (hide password)
  const maskedUrl = directDbUrl.replace(/:[^:@]+@/, ':***@');
  console.log(`Using connection string: ${maskedUrl}`);
  
  try {
    // Create a new Prisma client with the direct URL
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: directDbUrl
        }
      }
    });
    
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Test a simple query
    console.log('Testing database query...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Database tables:');
    console.log(tables);
    
    // Close the connection
    await prisma.$disconnect();
    console.log('Connection closed.');
    
    return { success: true, tables };
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Run the test
testConnection()
  .then(result => {
    if (result.success) {
      console.log('✅ All tests passed!');
    } else {
      console.error('❌ Tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
