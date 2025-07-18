import { useEffect, useRef } from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function GlassButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  disabled = false
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (buttonRef.current && !disabled) {
        buttonRef.current.style.transform = `translateY(${offset * 0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disabled]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, rgba(0,201,107,0.2), rgba(22,147,255,0.2))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, rgba(22,147,255,0.2), rgba(0,201,107,0.2))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
        };
      case 'outline':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
        };
      default:
        return {
          background: 'linear-gradient(135deg, rgba(0,201,107,0.2), rgba(22,147,255,0.2))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
      case 'lg':
        return { padding: '1rem 2rem', fontSize: '1.125rem' };
      default:
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      className={`glass-button ${className}`}
      style={{
        ...variantStyles,
        ...sizeStyles,
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--glass-shadow-light)',
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
        transform: disabled ? 'none' : undefined,
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>
      <style jsx>{`
        .glass-button:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: var(--glass-shadow-medium) !important;
        }
        
        .glass-button:active:not(:disabled) {
          transform: translateY(0) scale(0.98) !important;
        }
        
        .glass-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .glass-button:hover::before {
          left: 100%;
        }
      `}</style>
    </button>
  );
} 