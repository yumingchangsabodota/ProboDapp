'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Wallet = dynamic(() => import('./Wallet'), { ssr: false });
const CurrentBlock = dynamic(() => import('./CurrentBlock'), { ssr: false });

interface HeaderProps {
  // Add props here as needed
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`w-100 shadow-sm border-bottom ${className}`} style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container-fluid" style={{ maxWidth: "1320px" }}>
        <div className="d-flex justify-content-between align-items-center" style={{ height: "64px" }}>
          {/* Logo/Brand section */}
          <div className="d-flex align-items-center">
            <Link href="/" className="fs-5 fw-bold text-decoration-none" style={{ color: "#ededed" }}>
              Probo DApp
            </Link>
          </div>

          {/* Right section (user menu, actions, etc.) */}
          <div className="d-flex align-items-center gap-3">
            <CurrentBlock />
            <Wallet />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;