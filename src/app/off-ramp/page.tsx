'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to prevent recursion errors
const OffRampPageContent = dynamic(
  () => import('./OffRampPage'),
  { ssr: false }
);

export default function OffRampPage() {
  return <OffRampPageContent />;
}
