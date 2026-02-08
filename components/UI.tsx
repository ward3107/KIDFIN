
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'warning' | 'magic' | 'academy' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false 
}) => {
  const baseStyle = "w-full py-3 px-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200",
    warning: "bg-orange-400 text-white hover:bg-orange-500 shadow-orange-200",
    magic: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200 hover:brightness-110",
    academy: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-indigo-200",
    outline: "bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 shadow-none"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white p-4 rounded-3xl shadow-sm border border-slate-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${className}`}>
    {children}
  </span>
);
