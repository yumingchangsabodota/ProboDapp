import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  // Add props here as needed
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`w-100 bg-white shadow-sm border-bottom ${className}`}>
      <div className="container-fluid" style={{ maxWidth: "1320px" }}>
        <div className="d-flex justify-content-between align-items-center" style={{ height: "64px" }}>
          {/* Logo/Brand section */}
          <div className="d-flex align-items-center">
            <Link href="/" className="fs-5 fw-bold text-dark text-decoration-none">
              Probo DApp
            </Link>
          </div>

          {/* Navigation section */}
          <nav className="d-none d-md-flex gap-4">
            <Link
              href="/authenticity/docs"
              className="text-secondary text-decoration-none fw-medium"
            >
              Authenticity
            </Link>
            <Link
              href="/whitelist-entity/register"
              className="text-secondary text-decoration-none fw-medium"
            >
              Whitelist Entity
            </Link>
          </nav>

          {/* Right section (user menu, actions, etc.) */}
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-primary fw-medium">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;