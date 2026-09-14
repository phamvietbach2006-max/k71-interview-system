import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Volume2, VolumeX, Monitor, BellRing } from 'lucide-react';
import MacBackground from '../components/MacBackground';

export default function TvView() {
  const [boardData, setBoardData] = useState({ waiting: [], moving: [], interviewing: [] });
  const [audioEnabled, setAudioEnabled] = useState(false);
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

  // Handle Voice Announcement
  useEffect(() => {
    if (!audioEnabled || boardData.moving.length === 0) return;

    let played = JSON.parse(sessionStorage.getItem('playedAnnouncements') || '[]');
    let updated = false;

    boardData.moving.forEach(candidate => {
      const announceId = `${candidate.interviewCode}_${candidate.assignedTable}`;
      if (!played.includes(announceId)) {
        played.push(announceId);
        updated = true;
        
        const name = candidate.applicationData?.['Họ và tên'] || '';
        const mssv = candidate.interviewCode;
        const table = candidate.assignedTable;
        
        const text = `Xin mời ứng viên, ${name}, mã số, ${mssv.split('').join(' ')}, đến bàn phỏng vấn số, ${table}`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1;
        
        // Play a chime first (optional), then speech
        const chime = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        chime.volume = 0.5;
        chime.play().then(() => {
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 1000);
        }).catch(() => {
          window.speechSynthesis.speak(utterance);
        });
      }
    });

    if (updated) {
      sessionStorage.setItem('playedAnnouncements', JSON.stringify(played));
    }
  }, [boardData.moving, audioEnabled]);

  const testAudio = () => {
    if (!audioEnabled) {
      alert("Vui lòng Bật âm thanh trước khi thử loa!");
      return;
    }
    const utterance = new SpeechSynthesisUtterance("Thử âm thanh thành công.");
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  };

  // Recent 5 people interviewing
  const recentCalls = [...boardData.interviewing].slice(-5).reverse();

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-sans flex flex-col items-center">
      <MacBackground />

      {/* Top Bar for TV Controls - Can be hidden on actual fullscreen, but needed for audio setup */}
      <div className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Monitor className="text-blue-400" size={28} />
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">Chế Độ Trình Chiếu</h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${audioEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            {audioEnabled ? 'Âm thanh: Đang bật' : 'Âm thanh: Đang tắt'}
          </button>
          
          <button onClick={testAudio} className="bg-slate-800 text-white border border-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center gap-2">
            <BellRing size={20} /> Thử Loa
          </button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-6 md:p-10 flex flex-col lg:flex-row gap-8 z-10">
        {/* Left Panel: Currently Calling */}
        <div className="lg:w-2/3 flex flex-col gap-8">
          <div className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-2xl rounded-[3rem] border border-blue-400/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] p-10 flex-1 flex flex-col">
            <h2 className="text-3xl md:text-5xl font-black text-blue-200 mb-10 text-center uppercase tracking-widest border-b border-blue-500/30 pb-6">Đang Gọi Vào Bàn</h2>
            
            <div className="flex-1 flex flex-col justify-center items-center gap-6">
              {boardData.moving.length === 0 ? (
                <div className="text-center text-blue-300/50">
                  <Monitor size={120} className="mx-auto mb-8 opacity-20" />
                  <p className="text-3xl font-medium">Hiện chưa gọi thêm ai</p>
                </div>
              ) : (
                boardData.moving.map(c => (
                  <div key={c.interviewCode} className="w-full bg-white/10 border border-white/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 transform hover:scale-[1.02] transition-transform animate-fade-in-up">
                    <div className="flex-1 text-center md:text-left">
                      <div className="text-blue-300 font-bold text-2xl uppercase tracking-widest mb-2">MSSV: {c.interviewCode}</div>
                      <div className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-lg">
                        {c.applicationData?.['Họ và tên'] || 'Ứng viên'}
                      </div>
                    </div>
                    
                    <div className="bg-blue-600 rounded-[2rem] p-8 text-center min-w-[250px] shadow-2xl border border-blue-400/50">
                      <div className="text-blue-200 font-black text-xl uppercase tracking-widest mb-1">Bàn Số</div>
                      <div className="text-7xl md:text-9xl font-black text-white leading-none">{c.assignedTable}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Up Next & Recent */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {/* Waiting List */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 flex-1 flex flex-col">
            <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Sắp Đến Lượt</h2>
            <div className="flex-1 overflow-hidden">
              {boardData.waiting.length === 0 ? (
                <p className="text-slate-500 italic text-xl text-center py-10">Hàng đợi trống</p>
              ) : (
                <div className="space-y-4">
                  {boardData.waiting.slice(0, 7).map((c, idx) => (
                    <div key={c.interviewCode} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-black text-xl border border-white/10">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-slate-200 font-black text-2xl mb-1">{c.interviewCode}</div>
                        <div className="text-slate-400 font-medium text-lg">{c.applicationData?.['Họ và tên'] || ''}</div>
                      </div>
                    </div>
                  ))}
                  {boardData.waiting.length > 7 && (
                    <div className="text-center text-slate-500 font-bold pt-2">+ {boardData.waiting.length - 7} ứng viên khác</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recently Called */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 h-1/3 min-h-[300px] flex flex-col">
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-white/10 pb-4">Vừa Thông Báo</h2>
            <div className="flex-1 overflow-hidden space-y-3">
              {recentCalls.length === 0 ? (
                <p className="text-slate-600 italic text-center py-5">Chưa có thông báo gần đây</p>
              ) : (
                recentCalls.map(c => (
                  <div key={c.interviewCode} className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2 last:border-0">
                    <span className="font-bold">{c.interviewCode}</span>
                    <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-lg text-sm font-bold border border-blue-700/50">
                      Bàn {c.assignedTable}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
