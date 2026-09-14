import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Users, PlayCircle, UserCheck, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react';
import MacBackground from '../components/MacBackground';
import MacWindow from '../components/MacWindow';

export default function Board() {
  const [boardData, setBoardData] = useState({ waiting: [], interviewing: [], completed: [] });

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 5000);
    
    const socket = io('/');
    socket.on('board_update', fetchBoard);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchBoard = async () => {
    const res = await fetch('/api/board');
    const data = await res.json();
    setBoardData(data);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <MacBackground />
      
      <div className="w-full max-w-[1600px] h-[90vh] z-10 flex flex-col">
        <div className="flex justify-between items-end mb-8 px-4">
          <div>
            <img src="/assets/title_k71.png" alt="Tuyển Thành Viên Ban Tổ Chức - Kiểm Tra" className="h-24 md:h-32 object-contain drop-shadow-md mb-2 hover:scale-105 transition-transform" />
            <p className="text-xl text-slate-800 font-bold bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/60">Hệ thống điều phối ứng viên thời gian thực</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Waiting Column */}
          <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="bg-white/40 p-5 flex items-center justify-between border-b border-white/60">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2.5 rounded-xl shadow-sm text-white"><Users size={22} strokeWidth={2.5} /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Phòng Chờ</h2>
              </div>
              <span className="bg-white text-orange-600 py-1 px-4 rounded-full font-black text-lg shadow-sm border border-orange-100">{boardData.waiting.length}</span>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {boardData.waiting.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic font-medium">Trống</div>
              ) : boardData.waiting.map(c => (
                <div key={c.interviewCode} className={`relative p-5 rounded-2xl transition-all duration-500 ${c.status === 'moving' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg shadow-orange-500/20 scale-[1.02] z-10' : 'bg-white/80 border border-white shadow-sm hover:shadow-md'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-black text-xl tracking-tight ${c.status === 'moving' ? 'text-orange-900' : 'text-slate-700'}`}>{c.applicationData?.['Họ và tên'] || c.interviewCode}</span>
                    {c.status === 'moving' && <span className="flex h-4 w-4 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-orange-600"></span></span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Clock size={14} className="text-blue-500" /> Check-in: {formatTime(c.checkInTime)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">{c.interviewCode}</span>
                  </div>
                  {c.status === 'moving' ? (
                    <div className="text-sm font-bold text-orange-700 flex items-center gap-2 mt-3 bg-white/60 p-2.5 rounded-xl shadow-inner">
                      <Loader2 size={16} className="animate-spin" /> Đang di chuyển vào Bàn {c.assignedTable}...
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 font-medium mt-1">Đang đợi xếp bàn</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interviewing Column */}
          <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="bg-white/40 p-5 flex items-center justify-between border-b border-white/60">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-sm text-white"><PlayCircle size={22} strokeWidth={2.5} /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Đang Phỏng Vấn</h2>
              </div>
              <span className="bg-white text-blue-700 py-1 px-4 rounded-full font-black text-lg shadow-sm border border-blue-100">{boardData.interviewing.length}</span>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {boardData.interviewing.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic font-medium">Trống</div>
              ) : boardData.interviewing.map(c => (
                <div key={c.interviewCode} className="p-5 bg-white/90 rounded-2xl border border-white shadow-sm hover:shadow-md flex flex-col gap-3 relative overflow-hidden group transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="font-black text-xl text-slate-800 tracking-tight">{c.applicationData?.['Họ và tên'] || c.interviewCode}</div>
                  <div className="text-sm font-bold text-blue-700 bg-blue-50/80 py-2 px-4 rounded-xl inline-flex items-center gap-2 w-fit border border-blue-100 shadow-sm">
                    Bàn phỏng vấn: <span className="text-xl font-black text-blue-800">{c.assignedTable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="bg-white/40 p-5 flex items-center justify-between border-b border-white/60">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-xl shadow-sm text-white"><UserCheck size={22} strokeWidth={2.5} /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Đã Xong</h2>
              </div>
              <span className="bg-white text-emerald-700 py-1 px-4 rounded-full font-black text-lg shadow-sm border border-emerald-100">{boardData.completed.length}</span>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {boardData.completed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic font-medium">Trống</div>
              ) : boardData.completed.map(c => (
                <div key={c.interviewCode} className="p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm opacity-90 flex items-center justify-between hover:opacity-100 hover:shadow-md transition-all">
                  <span className="font-black text-lg text-slate-600 tracking-tight">{c.applicationData?.['Họ và tên'] || c.interviewCode}</span>
                  <span className="text-emerald-500 bg-emerald-50 p-2 rounded-xl">
                    <CheckCircle2 size={20} />
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
