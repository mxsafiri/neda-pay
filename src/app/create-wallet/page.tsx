'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to prevent recursion errors
// Note: Do not include file extension in the import path for better Next.js compatibility
const CreateWalletContent = dynamic(
  () => import('./CreateWalletContent'),
  { ssr: false }
);

export default function CreateWalletPage() {
  return <CreateWalletContent />;
}
