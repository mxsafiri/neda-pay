import { redirect } from 'next/navigation';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

export default function Home() {
  // Redirect to the landing page
  redirect('/landing');
  
  // This won't be rendered due to the redirect
  return null;
}
