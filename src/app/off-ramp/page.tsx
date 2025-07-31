'use client';

import React from 'react';
import { PaycrestCashOutFlow } from '@/components/paycrest/PaycrestCashOutFlow';
import { ModernLayout } from '@/components/layout/ModernLayout';

const OffRampPage = () => {
  return (
    <ModernLayout showHeader={true} showNavigation={true}>
      <div className="py-6">
        <PaycrestCashOutFlow />
      </div>
    </ModernLayout>
  );
};

export default OffRampPage;
