import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle2, Clock, MapPin, Handshake } from 'lucide-react';
import MacBackground from '../components/MacBackground';
import MacWindow from '../components/MacWindow';

export default function CandidateView() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('active'); // active, waiting, moving, interviewing, completed
  const [assignedTable, setAssignedTable] = useState(null);
  const [assignedRoom, setAssignedRoom] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [flash, setFlash] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'candidate') {
      setUser(stored);
      fetchStatus(stored.interviewCode);
    }
    
    socketRef.current = io('/');
    
    socketRef.current.on('candidate_assigned', (data) => {
      if (data.candidate.interviewCode === stored.interviewCode) {
        setStatus('moving');
        setAssignedTable(data.tableNumber);
        setAssignedRoom(data.roomNumber);
        playAlertSound();
        startFlashing();
      }
    });

    socketRef.current.on('board_update', () => {
      if (stored) fetchStatus(stored.interviewCode);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const fetchStatus = async (interviewCode) => {
    const res = await fetch('/api/board');
    const data = await res.json();
    
    // Find queue position if in waiting
    const wIndex = data.waiting.findIndex(c => c.interviewCode === interviewCode);
    if (wIndex !== -1) {
      setQueuePosition(wIndex + 1);
    } else {
      setQueuePosition(null);
    }

    const all = [...data.waiting, ...data.interviewing, ...data.completed];
    const me = all.find(c => c.interviewCode === interviewCode);
    if (me) {
      setStatus(me.status);
      setAssignedTable(me.assignedTable);
      setAssignedRoom(me.assignedRoom);
    }
  };

  const playAlertSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1108.73, ctx.currentTime);
      osc2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.3);
    }, 150);
  };

  const startFlashing = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 8000);
  };

  const handleCheckIn = () => {
    socketRef.current.emit('candidate_checkin', { interviewCode: user.interviewCode });
  };

  const handleAckMoving = () => {
    socketRef.current.emit('candidate_moving_ack', { interviewCode: user.interviewCode });
    setFlash(false);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">Vui lòng đăng nhập...</div>;

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans transition-all duration-700 ${flash ? 'bg-red-500' : ''}`}>
      {!flash && <MacBackground />}
      
      <div className={`relative z-10 w-full max-w-md p-4 transition-all duration-500 ${flash ? 'scale-105' : ''}`}>
        <MacWindow title="Hồ Sơ Ứng Viên" contentClassName="p-10 text-center">
          <div className="mb-8">
            <div className="inline-block bg-blue-100/80 backdrop-blur-md text-blue-800 font-black px-5 py-2 rounded-full border border-blue-200 shadow-sm text-sm mb-4">
              Mã PV: {user.interviewCode}
            </div>
          </div>
          
          {status === 'active' && (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-6 text-blue-500"><CheckCircle2 size={64} strokeWidth={1.5} /></div>
              <h2 className="text-3xl font-black mb-3 text-slate-800 tracking-tight">Chào mừng!</h2>
              <p className="mb-8 text-slate-500 font-medium leading-relaxed">Bạn đã có mặt tại khu vực phỏng vấn.<br/>Vui lòng xác nhận Check-in để lấy số thực tế.</p>
              <button onClick={handleCheckIn} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-black w-full hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all">
                XÁC NHẬN CHECK-IN
              </button>
            </div>
          )}

          {status === 'waiting' && (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-6 text-orange-400"><Clock size={64} className="animate-pulse" strokeWidth={1.5} /></div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2 tracking-tight drop-shadow-sm">ĐANG CHỜ</div>
              {queuePosition && (
                <div className="bg-orange-100 text-orange-800 font-bold px-4 py-2 rounded-xl mb-4 text-lg border border-orange-200">
                  Thứ tự của bạn: <span className="text-2xl">{queuePosition}</span>
                </div>
              )}
              <p className="text-slate-500 text-lg font-medium leading-relaxed">Bạn đã được xếp vào hàng đợi.<br/>Vui lòng theo dõi màn hình khi đến lượt.</p>
            </div>
          )}

          {status === 'moving' && (
            <div className="animate-bounce-slight">
              <div className="flex justify-center mb-6 text-red-500"><MapPin size={72} className="animate-bounce" strokeWidth={1.5} /></div>
              <div className="text-4xl font-black text-red-600 mb-2 tracking-tight">ĐẾN LƯỢT BẠN!</div>
              <p className="text-slate-600 mb-6 text-lg font-medium">Xin mời di chuyển ngay đến</p>
              <div className="bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl py-6 mb-8 shadow-inner">
                {assignedRoom && <span className="block text-2xl text-blue-600 font-black mb-2 uppercase">Phòng {assignedRoom}</span>}
                <span className="block text-lg text-blue-600 font-black mb-1 tracking-widest">BÀN SỐ</span>
                <span className="block text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-700 drop-shadow-sm">{assignedTable}</span>
              </div>
              <button onClick={handleAckMoving} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl text-lg font-black w-full shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all">
                TÔI ĐÃ NHẬN THÔNG TIN
              </button>
            </div>
          )}

          {status === 'interviewing' && (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-6 text-blue-500"><Handshake size={64} strokeWidth={1.5} /></div>
              <div className="text-3xl font-black text-blue-700 mb-4 tracking-tight">ĐANG PHỎNG VẤN</div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">Chúc bạn tự tin và hoàn thành tốt<br/>buổi phỏng vấn tại Bàn {assignedTable}.</p>
            </div>
          )}

          {status === 'completed' && (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-6 text-emerald-500"><CheckCircle2 size={64} strokeWidth={1.5} /></div>
              <div className="text-3xl font-black text-emerald-600 mb-4 tracking-tight">HOÀN TẤT</div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">Buổi phỏng vấn của bạn đã kết thúc.<br/>Cảm ơn bạn đã tham gia. Bạn có thể ra về.</p>
            </div>
          )}
        </MacWindow>
      </div>
    </div>
  );
}
