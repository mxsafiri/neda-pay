import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the landing page
  redirect('/landing');
  
  // This won't be rendered due to the redirect
  return null;
}
