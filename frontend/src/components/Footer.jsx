import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-md border-t border-slate-200 py-6 mt-auto shrink-0 z-50 relative">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        <div className="flex items-center gap-6">
          <a href="https://web.facebook.com/dyc.hust" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform" title="Fanpage DYC">
            <img src="/assets/dyc_logo.png" alt="DYC Logo" className="h-16 w-auto object-contain drop-shadow-sm" />
          </a>
          <span className="text-xl text-slate-300 font-black tracking-widest">X</span>
          <a href="https://web.facebook.com/BanTCKT.HUST" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform" title="Fanpage Ban TC-KT">
            <img src="/assets/tckt_logo.png" alt="Ban TC-KT Logo" className="h-16 w-auto object-contain drop-shadow-sm" />
          </a>
        </div>
        
        <div className="text-center md:text-left flex-1 max-w-xl">
          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">DYC x Ban Tổ chức - Kiểm tra</h3>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Đây là một sản phẩm của <a href="https://web.facebook.com/dyc.hust" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Câu lạc bộ Thanh niên số Đoàn Đại học Bách khoa Hà Nội (DYC)</a> và <a href="https://web.facebook.com/BanTCKT.HUST" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Ban Tổ chức - Kiểm tra Đoàn Đại học Bách khoa Hà Nội</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
