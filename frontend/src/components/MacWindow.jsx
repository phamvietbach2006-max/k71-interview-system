import React from 'react';

export default function MacWindow({ children, title, className = "", contentClassName = "p-6" }) {
  return (
    <div className={`bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white/60 overflow-hidden flex flex-col ${className}`}>
      {/* Mac Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/40 border-b border-white/50 relative">
        <div className="flex items-center gap-2 z-10">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm border border-red-200"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm border border-yellow-200"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm border border-green-200"></div>
        </div>
        {title && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-slate-700 tracking-wide">{title}</span>
          </div>
        )}
      </div>
      {/* Content */}
      <div className={`flex-1 overflow-auto ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
