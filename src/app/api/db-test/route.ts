import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    // Log environment variables (without exposing full credentials)
    const dbUrl = process.env.DIRECT_DATABASE_URL || 'Not set';
    const maskedDbUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
    
    // Create a new client instance directly with the transaction pooler URL
    const directClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DIRECT_DATABASE_URL
        }
      }
    });
    
    // Test the connection to the database using the direct client
    await directClient.$connect();
    
    // Get a list of tables to verify schema creation
    const tables = await directClient.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // Try to get a count of users
    const userCount = await directClient.user.count();
    
    // Try to create a test user (will be used to verify CRUD operations)
    const testUser = await directClient.user.upsert({
      where: { id: 'test-user-id' },
      update: { 
        email: 'test@example.com',
        updatedAt: new Date() 
      },
      create: {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        updatedAt: new Date()
      },
    });
    
    // Try to create a user setting for the test user
    const userSettings = await directClient.userSettings.upsert({
      where: { userId: 'test-user-id' },
      update: { 
        theme: 'dark',
        updatedAt: new Date() 
      },
      create: {
        userId: 'test-user-id',
        theme: 'dark',
        updatedAt: new Date()
      },
    });
    
    // Close the direct client connection
    await directClient.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and CRUD tests completed successfully',
      diagnostics: {
        connectionString: maskedDbUrl,
        environmentVariables: {
          directDatabaseUrlSet: !!process.env.DIRECT_DATABASE_URL,
          databaseUrlSet: !!process.env.DATABASE_URL
        }
      },
      results: {
        tables,
        userCount,
        testUser,
        userSettings
      },
      connectionStatus: 'Connected to Supabase database successfully',
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to database or perform CRUD operations',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed', 
        error: error instanceof Error ? error.message : String(error),
        connectionStatus: 'Failed to connect to database'
      },
      { status: 500 }
    );
  }
}
