
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-brand-text-primary">
        Trade PnL Analyzer
      </h1>
      <p className="text-brand-text-secondary mt-1">
        Import your trade history to get instant performance insights.
      </p>
    </header>
  );
};

export default Header;
