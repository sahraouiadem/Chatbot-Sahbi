import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
}

const variants = {
  primary:   'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
  secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-600',
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled,
  children,
  variant = 'primary',
  className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
  >
    {children}
  </button>
);

export default Button;
