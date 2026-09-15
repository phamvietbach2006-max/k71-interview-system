import codecs
code = """import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Volume2, VolumeX, Monitor, BellRing } from "lucide-react";
import MacBackground from "../components/MacBackground";

export default function TvView() {
  const [boardData, setBoardData] = useState({ waiting: [], moving: [], interviewing: [] });
  const socketRef = useRef(null);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    
    socketRef.current = io("/");
    socketRef.current.on("board_update", fetchBoard);

    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await fetch("/api/tv-board");
      const data = await res.json();
      setBoardData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const tcktMoving = boardData.moving.filter(c => c.department === "TCKT");
  const tcktWaiting = boardData.waiting.filter(c => c.department === "TCKT").slice(0, 5);
  const bcsMoving = boardData.moving.filter(c => c.department === "BCS");
  const bcsWaiting = boardData.waiting.filter(c => c.department === "BCS").slice(0, 5);

  const renderCandidateRow = (c, colorTheme) => (
    <div key={c.interviewCode} className={`w-full bg-white/10 border border-white/20 p-3 rounded-2xl flex flex-col xl:flex-row items-center justify-between gap-3 transform hover:scale-[1.02] transition-transform animate-fade-in-up shrink-0`}>
      <div className="flex-1 text-center xl:text-left">
        <div className={`${colorTheme.textMuted} font-bold text-sm uppercase tracking-widest mb-0.5`}>MSSV: {c.interviewCode}</div>
        <div className="text-2xl xl:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
          {c.applicationData?.["Họ và tên"] || "Ứng viên"}
        </div>
      </div>
      
      <div className={`${colorTheme.bgSolid} rounded-xl p-3 text-center min-w-[120px] shadow-lg border border-white/20 flex flex-col justify-center`}>
        {c.assignedRoom && <div className={`${colorTheme.textMuted} font-bold text-xs uppercase tracking-widest mb-1 bg-black/20 rounded-md py-0.5`}>PHÒNG {c.assignedRoom}</div>}
        <div className="text-white/80 font-black text-sm uppercase tracking-widest mb-0.5">BÀN SỐ</div>
        <div className="text-4xl font-black text-white leading-none">{c.assignedTable}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-sans flex flex-col items-center">
      <MacBackground />

      <div className="w-full flex justify-center py-6 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-10 bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.2)]">
          <div className="text-center pr-10 border-r-2 border-slate-200">
            <h1 className="text-5xl font-black text-slate-800 uppercase tracking-widest mb-2">Quét mã QR</h1>
            <p className="text-slate-500 font-bold text-xl">để xem thứ tự của bạn</p>
          </div>
          <img src="/assets/qr.jpeg" alt="QR Code" className="w-56 h-56 rounded-3xl object-contain border-4 border-slate-100 shadow-inner" />
        </div>
      </div>

      <div className="flex-1 w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 z-10 h-[calc(100vh-200px)] overflow-hidden">
        
        {/* Left Half: TCKT */}
        <div className="lg:w-1/2 flex flex-col bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-2xl rounded-[3rem] border border-blue-400/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] p-6 overflow-hidden">
          
          {/* 1. Logo (25%) */}
          <div className="h-[25%] flex justify-center items-center shrink-0 mb-2">
            <img src="/assets/title_k71.png" alt="TCKT" className="w-full max-w-[85%] h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
          </div>
          
          {/* 2. Moving (25%) */}
          <div className="h-[25%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-t border-blue-500/30 pt-3 shrink-0">
            <h3 className="text-lg font-bold text-blue-300 uppercase tracking-widest shrink-0">Đang Gọi:</h3>
            {tcktMoving.length === 0 ? (
              <p className="text-blue-300/50 italic text-center py-2">Chưa gọi thêm</p>
            ) : tcktMoving.map(c => renderCandidateRow(c, { bgSolid: "bg-blue-600", textMuted: "text-blue-200" }))}
          </div>

          {/* 3. Waiting (50%) */}
          <div className="h-[50%] bg-slate-900/40 rounded-3xl p-5 flex flex-col overflow-hidden mt-3">
            <h3 className="text-base font-bold text-slate-300 uppercase tracking-widest mb-3 shrink-0">Sắp Đến Lượt ({boardData.waiting.filter(c=>c.department==="TCKT").length})</h3>
            {tcktWaiting.length === 0 ? <p className="text-slate-500 italic">Trống</p> : (
              <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {tcktWaiting.map((c, index) => (
                  <div key={c.interviewCode} className="bg-blue-500/20 text-blue-100 px-4 py-2.5 rounded-xl border border-blue-400/30 flex justify-between items-center shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-blue-200 w-10 text-center drop-shadow-md">#{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight drop-shadow-sm leading-tight">{c.applicationData?.["Họ và tên"] || "Ứng viên"}</span>
                        <span className="text-blue-300 font-bold text-xs uppercase tracking-widest">MSSV: {c.interviewCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Half: BCS */}
        <div className="lg:w-1/2 flex flex-col bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-2xl rounded-[3rem] border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] p-6 overflow-hidden">
          
          {/* 1. Logo (25%) */}
          <div className="h-[25%] flex justify-center items-center shrink-0 mb-2">
            <img src="/assets/title_bcs.png" alt="BCS" className="w-full max-w-[85%] h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
          </div>
          
          {/* 2. Moving (25%) */}
          <div className="h-[25%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-t border-emerald-500/30 pt-3 shrink-0">
            <h3 className="text-lg font-bold text-emerald-300 uppercase tracking-widest shrink-0">Đang Gọi:</h3>
            {bcsMoving.length === 0 ? (
              <p className="text-emerald-300/50 italic text-center py-2">Chưa gọi thêm</p>
            ) : bcsMoving.map(c => renderCandidateRow(c, { bgSolid: "bg-emerald-600", textMuted: "text-emerald-200" }))}
          </div>

          {/* 3. Waiting (50%) */}
          <div className="h-[50%] bg-slate-900/40 rounded-3xl p-5 flex flex-col overflow-hidden mt-3">
            <h3 className="text-base font-bold text-slate-300 uppercase tracking-widest mb-3 shrink-0">Sắp Đến Lượt ({boardData.waiting.filter(c=>c.department==="BCS").length})</h3>
            {bcsWaiting.length === 0 ? <p className="text-slate-500 italic">Trống</p> : (
              <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {bcsWaiting.map((c, index) => (
                  <div key={c.interviewCode} className="bg-emerald-500/20 text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-400/30 flex justify-between items-center shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-emerald-200 w-10 text-center drop-shadow-md">#{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight drop-shadow-sm leading-tight">{c.applicationData?.["Họ và tên"] || "Ứng viên"}</span>
                        <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest">MSSV: {c.interviewCode}</span>
                      </div>
                    </div>
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
"""
with open("frontend/src/pages/TvView.jsx", "w", encoding="utf-8") as f:
    f.write(code)
print("done")
