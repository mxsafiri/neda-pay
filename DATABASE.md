# NEDA-pay Database Architecture

This document outlines the database architecture and environment setup for the NEDA-pay project.

## Database Architecture

NEDA-pay uses [Supabase](https://supabase.com) as its database provider. Supabase is a PostgreSQL database with additional features like authentication, storage, and real-time subscriptions.

### Database Access

All database access in the application is done through the **Supabase JavaScript Client**. This client provides a simple and reliable way to interact with your Supabase database.

The Supabase client is initialized in: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Create a singleton Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default supabase;
```

### Database Schema

The database schema includes the following tables:

- **User**: Stores user information (id, email, firstName, lastName, etc.)
- **UserSettings**: Stores user preferences and settings
- **Document**: Stores KYC document information
- **DAppConnection**: Stores information about connected dApps
- **Transaction**: Stores transaction records

## Environment Configuration

### Environment Variables

The project uses two environment files:

1. `.env`: Contains non-sensitive configuration that can be committed to version control
   - `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project

2. `.env.local`: Contains sensitive information that should NOT be committed to version control
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous API key for your Supabase project
   - Other API keys and secrets for third-party services

### Setting Up Environment Variables

1. Copy the Supabase anon key from your Supabase dashboard (Project Settings > API)
2. Update the `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` with this value
3. Ensure the `NEXT_PUBLIC_SUPABASE_URL` in `.env` matches your Supabase project URL

## Testing Database Connection

You can test the database connection using the API route:

```
GET /api/supabase-test
```

This route will attempt to connect to your Supabase database and perform basic CRUD operations to verify connectivity.

## Troubleshooting

If you encounter database connection issues:

1. Verify that your Supabase project is active
2. Check that the anon key in `.env.local` is correct and properly formatted
3. Ensure there are no spaces or extra characters in your environment variables
4. Restart your Next.js server to pick up any environment variable changes

## Migration from Prisma

This project previously used Prisma ORM but has been migrated to use the Supabase JavaScript client directly for simplicity and reliability. The Prisma schema and configuration files are no longer used but may still be present in the repository for reference.
