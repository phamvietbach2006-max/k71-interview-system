import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Volume2, VolumeX, Monitor, BellRing } from 'lucide-react';
import MacBackground from '../components/MacBackground';

export default function TvView() {
  const [boardData, setBoardData] = useState({ waiting: [], moving: [], interviewing: [] });
  const socketRef = useRef(null);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    
    socketRef.current = io('/');
    socketRef.current.on('board_update', fetchBoard);

    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await fetch('/api/tv-board');
      const data = await res.json();
      setBoardData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Recent 5 people interviewing
  const tcktMoving = boardData.moving.filter(c => c.department === 'TCKT');
  const tcktWaiting = boardData.waiting.filter(c => c.department === 'TCKT').slice(0, 5); // Only show top 5 to save space
  const bcsMoving = boardData.moving.filter(c => c.department === 'BCS');
  const bcsWaiting = boardData.waiting.filter(c => c.department === 'BCS').slice(0, 5);

  const renderCandidateRow = (c, colorTheme) => (
    <div key={c.interviewCode} className={`w-full bg-white/10 border border-white/20 p-5 rounded-[1.5rem] flex flex-col xl:flex-row items-center justify-between gap-4 transform hover:scale-[1.02] transition-transform animate-fade-in-up`}>
      <div className="flex-1 text-center xl:text-left">
        <div className={`${colorTheme.textMuted} font-bold text-lg uppercase tracking-widest mb-1`}>MSSV: {c.interviewCode}</div>
        <div className="text-3xl xl:text-4xl font-black text-white tracking-tight drop-shadow-md">
          {c.applicationData?.['Họ và tên'] || 'Ứng viên'}
        </div>
      </div>
      
      <div className={`${colorTheme.bgSolid} rounded-[1.5rem] p-5 text-center min-w-[180px] shadow-xl border border-white/20 flex flex-col justify-center`}>
        {c.assignedRoom && <div className={`${colorTheme.textMuted} font-bold text-sm uppercase tracking-widest mb-1 bg-black/20 rounded-lg py-1`}>PHÒNG {c.assignedRoom}</div>}
        <div className="text-white/80 font-black text-lg uppercase tracking-widest mb-1">BÀN SỐ</div>
        <div className="text-6xl font-black text-white leading-none">{c.assignedTable}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-sans flex flex-col items-center">
      <MacBackground />

      <div className="w-full flex justify-center py-6 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-6 bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.2)]">
          <div className="text-center pr-6 border-r border-slate-200">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Quét mã QR</h1>
            <p className="text-slate-500 font-bold">để xem thứ tự của bạn</p>
          </div>
          <img src="/assets/qr.jpeg" alt="QR Code" className="w-32 h-32 rounded-xl object-contain border-4 border-slate-100" />
        </div>
      </div>

      <div className="flex-1 w-full mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8 z-10 h-[calc(100vh-200px)]">
        
        {/* Left Half: TCKT */}
        <div className="lg:w-1/2 flex flex-col gap-6 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-2xl rounded-[3rem] border border-blue-400/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] p-8">
          <h2 className="text-3xl font-black text-blue-200 text-center uppercase tracking-widest border-b border-blue-500/30 pb-4">BAN TỔ CHỨC - KIỂM TRA</h2>
          
          {/* Moving */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-[30vh]">
            <h3 className="text-xl font-bold text-blue-300 uppercase tracking-widest">Đang Gọi:</h3>
            {tcktMoving.length === 0 ? (
              <p className="text-blue-300/50 italic text-center py-4">Chưa gọi thêm</p>
            ) : tcktMoving.map(c => renderCandidateRow(c, { bgSolid: 'bg-blue-600', textMuted: 'text-blue-200' }))}
          </div>

          {/* Waiting */}
          <div className="bg-slate-900/40 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest mb-4">Sắp Đến Lượt ({boardData.waiting.filter(c=>c.department==='TCKT').length})</h3>
            {tcktWaiting.length === 0 ? <p className="text-slate-500 italic">Trống</p> : (
              <div className="flex flex-wrap gap-3">
                {tcktWaiting.map(c => (
                  <div key={c.interviewCode} className="bg-blue-500/20 text-blue-100 px-4 py-2 rounded-xl border border-blue-400/30 font-bold">
                    {c.interviewCode}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Half: BCS */}
        <div className="lg:w-1/2 flex flex-col gap-6 bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-2xl rounded-[3rem] border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] p-8">
          <h2 className="text-3xl font-black text-emerald-200 text-center uppercase tracking-widest border-b border-emerald-500/30 pb-4">BAN CÁN SỰ NĂM NHẤT</h2>
          
          {/* Moving */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-[30vh]">
            <h3 className="text-xl font-bold text-emerald-300 uppercase tracking-widest">Đang Gọi:</h3>
            {bcsMoving.length === 0 ? (
              <p className="text-emerald-300/50 italic text-center py-4">Chưa gọi thêm</p>
            ) : bcsMoving.map(c => renderCandidateRow(c, { bgSolid: 'bg-emerald-600', textMuted: 'text-emerald-200' }))}
          </div>

          {/* Waiting */}
          <div className="bg-slate-900/40 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest mb-4">Sắp Đến Lượt ({boardData.waiting.filter(c=>c.department==='BCS').length})</h3>
            {bcsWaiting.length === 0 ? <p className="text-slate-500 italic">Trống</p> : (
              <div className="flex flex-wrap gap-3">
                {bcsWaiting.map(c => (
                  <div key={c.interviewCode} className="bg-emerald-500/20 text-emerald-100 px-4 py-2 rounded-xl border border-emerald-400/30 font-bold">
                    {c.interviewCode}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
