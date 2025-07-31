'use client';

import React from 'react';
import SingleCardCashOut from '@/components/paycrest/SingleCardCashOut';
import { ModernLayout } from '@/components/layout/ModernLayout';

const OffRampPage = () => {
  return (
    <ModernLayout showHeader={true} showNavigation={true}>
      <div className="py-6">
        <SingleCardCashOut />
      </div>
    </ModernLayout>
  );
};

export default OffRampPage;
