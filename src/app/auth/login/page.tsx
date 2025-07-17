'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to prevent recursion errors
const LoginContent = dynamic(
  () => import('./LoginContent'),
  { ssr: false }
);

export default function LoginPage() {
  return <LoginContent />;
}
