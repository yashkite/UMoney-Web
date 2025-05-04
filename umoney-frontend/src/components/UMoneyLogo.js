import React from 'react';
import { Link } from 'react-router-dom';

const UMoneyLogo = ({ size = 'medium', showText = true, className = '', linkTo = '/app/dashboard' }) => {
  // Size mapping
  const sizeMap = {
    small: { icon: 24, text: 'text-lg' },
    medium: { icon: 32, text: 'text-xl' },
    large: { icon: 48, text: 'text-3xl' }
  };

  const selectedSize = sizeMap[size] || sizeMap.medium;

  return (
    <Link to={linkTo} className="no-underline">
      <div className={`flex align-items-center ${className}`}>
        {/* Logo Icon */}
        <div
          className="flex align-items-center justify-content-center border-circle mr-2"
          style={{
            width: `${selectedSize.icon}px`,
            height: `${selectedSize.icon}px`,
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <i className="pi pi-dollar text-white" style={{ fontSize: `${selectedSize.icon/2}px` }}></i>
        </div>

        {/* Logo Text */}
        {showText && (
          <span className={`font-bold ${selectedSize.text}`} style={{
            background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-color) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'var(--primary-color)' // Fallback for browsers that don't support background-clip
          }}>
            UMoney
          </span>
        )}
      </div>
    </Link>
  );
};

export default UMoneyLogo;
