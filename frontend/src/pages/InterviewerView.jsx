import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Coffee, User, CheckCircle, Save, MessageSquare, UserCheck, Loader2, RefreshCw, Hand, X, XCircle, LogOut } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

export default function InterviewerView() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [isBreak, setIsBreak] = useState(false);
  const socketRef = useRef(null);

  // Form states
  const [attitude, setAttitude] = useState(5);
  const [skill, setSkill] = useState(5);
  const [problemSolving, setProblemSolving] = useState(5);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('Đạt');
  const [boardData, setBoardData] = useState({ waiting: [], interviewing: [], completed: [] });
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [autoAssign, setAutoAssign] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'interviewer') {
      setUser(stored);
      setAutoAssign(stored.autoAssign === true);
      fetchCandidate(stored.tableNumber);
    }
    
    socketRef.current = io('/');
    socketRef.current.on('board_update', () => {
      if (stored) fetchCandidate(stored.tableNumber);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const fetchCandidate = async (tableNum) => {
    const res = await fetch('/api/board');
    const data = await res.json();
    setBoardData(data);
    const all = [...data.waiting, ...data.interviewing];
    const candidate = all.find(c => c.assignedTable === String(tableNum) && (c.status === 'moving' || c.status === 'interviewing'));
    setCurrentCandidate(candidate || null);
  };

  const handleToggleBreak = async () => {
    const newStatus = isBreak ? 'active' : 'break';
    await fetch('/api/staff/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, status: newStatus })
    });
    setIsBreak(!isBreak);
  };

  const handleLeaveTable = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn rời bàn phỏng vấn? Khi đăng nhập lại bạn sẽ phải chọn lại phòng và bàn.")) return;
    try {
      const res = await fetch('/api/staff/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });
      if (res.ok) {
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAutoAssign = async () => {
    const newVal = !autoAssign;
    const res = await fetch('/api/interviewer/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, autoAssign: newVal })
    });
    if (res.ok) {
      setAutoAssign(newVal);
      const stored = JSON.parse(localStorage.getItem('user'));
      stored.autoAssign = newVal;
      localStorage.setItem('user', JSON.stringify(stored));
    }
  };

  const callCandidate = async (interviewCode) => {
    const res = await fetch('/api/interviewer/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, interviewCode })
    });
    const data = await res.json();
    if (data.success) {
      setShowQueueModal(false);
    } else {
      alert(data.message || 'Lỗi khi gọi ứng viên');
    }
  };

  const switchRole = async () => {
    const res = await fetch('/api/staff/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, targetRole: 'admin' })
    });
    const data = await res.json();
    if (data.success) {
      const stored = JSON.parse(localStorage.getItem('user'));
      stored.role = 'admin';
      localStorage.setItem('user', JSON.stringify(stored));
      navigate('/admin');
    }
  };

  const confirmPresence = () => {
    if (currentCandidate) {
      socketRef.current.emit('interviewer_confirm_presence', { interviewCode: currentCandidate.interviewCode });
    }
  };

  const cancelInterview = async () => {
    if (!currentCandidate) return;
    const confirm = window.confirm('Bạn có chắc chắn muốn hủy lượt gọi và đưa ứng viên trở về hàng đợi?');
    if (!confirm) return;

    try {
      const res = await fetch('/api/interviewer/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          interviewCode: currentCandidate.interviewCode
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentCandidate(null);
      } else {
        alert(data.message || 'Lỗi khi hủy.');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const submitEvaluation = async () => {
    if (!currentCandidate) return;
    const data = {
      interviewCode: currentCandidate.interviewCode,
      department: currentCandidate.department || user.department,
      interviewerUsername: user.username,
      attitudeScore: attitude,
      skillScore: skill,
      problemSolvingScore: problemSolving,
      notes,
      result
    };
    
    await fetch('/api/evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    setAttitude(5); setSkill(5); setProblemSolving(5); setNotes(''); setResult('Đạt');
    setCurrentCandidate(null);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Đăng nhập với quyền Người phỏng vấn...</div>;

  return (
    <div className="min-h-screen relative overflow-hidden p-4 md:p-8 font-sans flex flex-col items-center">
      {/* Universal Background */}
      <div className="fixed inset-0 z-0 bg-[#f8fafc] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white/60 flex flex-col flex-1 z-10 overflow-hidden">
        
        {/* Mac Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/40 border-b border-white/50 relative shrink-0">
          <div className="flex items-center gap-2 z-10">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm border border-red-200"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm border border-yellow-200"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm border border-green-200"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-slate-700 tracking-wide">Hệ thống phỏng vấn</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Header Area */}
          <div className="bg-gradient-to-r from-blue-700/90 to-indigo-800/90 backdrop-blur-md text-white p-6 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><User size={28} /></div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
                    {user.roomNumber ? `P.${user.roomNumber} - ` : ''}Bàn {user.tableNumber}
                  </h1>
                  <p className="text-blue-200 text-sm mt-1 font-medium">Interviewer: {user.fullName || user.username}</p>
                </div>
              </div>
              
              {/* Role Switcher for specific admins */}
              {['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'].includes(user.fullName) && (
                <button onClick={switchRole} className="ml-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold border border-white/30 transition-all flex items-center gap-2">
                  <RefreshCw size={16} /> Admin
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {/* Auto Assign Toggle */}
              <button 
                onClick={toggleAutoAssign}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-md text-sm border-2 ${autoAssign ? 'bg-blue-600/50 border-blue-400 hover:bg-blue-600' : 'bg-slate-700/50 border-slate-500 hover:bg-slate-700 text-slate-200'}`}
              >
                <RefreshCw size={18} className={autoAssign ? 'animate-spin-slow' : ''} />
                {autoAssign ? 'Tự động gọi' : 'Chọn thủ công'}
              </button>

              <button 
                onClick={handleToggleBreak}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${isBreak ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
              >
                <Coffee size={20} />
                {isBreak ? 'Quay lại Bàn' : 'Tạm Nghỉ'}
              </button>

              <button 
                onClick={handleLeaveTable}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md bg-red-600 text-white hover:bg-red-700"
              >
                <LogOut size={20} />
                Rời Bàn
              </button>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col gap-8 flex-1">
            <div className="flex-1">
              {!currentCandidate && !isBreak && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
                  <Loader2 className="animate-spin mb-4" size={48} />
                  <h2 className="text-2xl font-semibold text-slate-500">Đang đợi hệ thống phân công...</h2>
                  <p className="mt-2 text-slate-400 mb-6">Hệ thống sẽ tự động gọi ứng viên tiếp theo vào bàn của bạn.</p>
                  
                  <button onClick={() => setShowQueueModal(true)} className="bg-white/50 backdrop-blur-sm border-2 border-blue-400 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm">
                    Xem hàng chờ chung ({boardData.waiting.length})
                  </button>
                </div>
              )}
            
              {!currentCandidate && isBreak && (
                <div className="h-full flex flex-col items-center justify-center text-yellow-600 mt-20">
                  <Coffee size={64} className="mb-4 opacity-50" />
                  <h2 className="text-3xl font-bold">Bàn đang đóng</h2>
                  <p className="mt-2 text-yellow-600/70">Mở lại bàn để hệ thống tiếp tục phân công ứng viên.</p>
                </div>
              )}

              {currentCandidate && (
                <div className="animate-fade-in-up">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ứng viên: <span className="text-blue-600">{currentCandidate.interviewCode}</span></h2>
                      <p className="text-slate-500 mt-1 font-medium">{currentCandidate.applicationData?.['Họ và tên'] || 'Không rõ tên'}</p>
                    </div>
                    <div className={`px-5 py-2 rounded-full font-bold text-sm border shadow-sm ${currentCandidate.status === 'moving' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {currentCandidate.status === 'moving' ? 'Đang tiến vào bàn' : 'Đang trong phiên phỏng vấn'}
                    </div>
                  </div>

                  {currentCandidate.status === 'moving' && (
                    <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 shadow-sm">
                      <div className="inline-flex bg-emerald-100 text-emerald-600 p-4 rounded-full mb-6 shadow-sm">
                        <UserCheck size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">Ứng viên đang di chuyển đến bàn</h3>
                      <button onClick={confirmPresence} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-4 rounded-2xl text-xl font-black shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center gap-3 mx-auto">
                        <CheckCircle size={24} strokeWidth={2.5} /> XÁC NHẬN ĐÃ CÓ MẶT
                      </button>
                      <button onClick={cancelInterview} className="mt-4 text-red-500 hover:text-red-700 font-bold px-6 py-2 rounded-xl border-2 border-transparent hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 mx-auto">
                        <XCircle size={20} /> Hủy lượt & Đưa về hàng chờ
                      </button>
                    </div>
                  )}

                  {currentCandidate.status === 'interviewing' && (
                    <div className="flex flex-col xl:flex-row gap-8">
                      {/* Left 1/2: Candidate Data */}
                      <div className="xl:w-1/2 bg-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-sm h-[70vh] overflow-y-auto custom-scrollbar">
                        <h3 className="font-bold text-blue-900 mb-4 border-b border-blue-200/50 pb-3 text-xl tracking-tight">Thông tin Ứng viên</h3>
                        <div className="space-y-3">
                          {currentCandidate.applicationData && Object.keys(currentCandidate.applicationData).length > 0 ? (
                            Object.entries(currentCandidate.applicationData).map(([key, value], idx) => {
                              if (['Id', 'Thời gian bắt đầu', 'Thời gian hoàn thành', 'Tên+ Nhận xét', 'Kết quả', 'Tên', 'Ngôn ngữ'].includes(key)) return null;
                              return (
                                <div key={idx} className="bg-white/80 p-3.5 rounded-xl shadow-sm border border-slate-100">
                                  <div className="text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">{key}</div>
                                  <div className="text-sm font-medium text-slate-800 break-words">{value}</div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-slate-500 italic text-sm font-medium">Không có dữ liệu.</div>
                          )}
                        </div>
                      </div>

                      {/* Right 1/2: Evaluation Form */}
                      <div className="xl:w-1/2 space-y-5 flex flex-col justify-between h-[70vh]">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { label: 'Thái độ & Tác phong', val: attitude, set: setAttitude },
                            { label: 'Kỹ năng chuyên môn', val: skill, set: setSkill },
                            { label: 'Xử lý tình huống', val: problemSolving, set: setProblemSolving },
                          ].map((item, idx) => (
                            <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                              <label className="block mb-2 font-bold text-slate-700 text-center text-sm">{item.label}</label>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400">1</span>
                                <input 
                                  type="range" min="1" max="10" 
                                  value={item.val} onChange={e=>item.set(e.target.value)} 
                                  className="w-full mx-2 accent-blue-600 cursor-pointer" 
                                />
                                <span className="text-xs font-bold text-slate-400">10</span>
                              </div>
                              <div className="text-center text-3xl font-black text-blue-600 drop-shadow-sm leading-none">{item.val}</div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                          <label className="flex items-center gap-2 mb-2 font-bold text-slate-700">
                            <MessageSquare size={18} /> Nhận xét chi tiết
                          </label>
                          <textarea 
                            value={notes} onChange={e=>setNotes(e.target.value)} 
                            placeholder="Ghi chú thêm về ứng viên..."
                            className="w-full flex-1 border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all font-medium text-slate-700"
                          ></textarea>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                          <label className="font-bold text-slate-700 text-base">Tổng điểm trung bình:</label>
                          <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-5 py-1.5 rounded-xl border border-indigo-100 shadow-inner">
                            {((Number(attitude) + Number(skill) + Number(problemSolving)) / 3).toFixed(1)}
                          </span>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="block mb-3 font-bold text-slate-700 text-base">Quyết định cuối cùng</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            {['Đạt', 'Không đạt', 'Cân nhắc thêm'].map(r => (
                              <button 
                                key={r} onClick={() => setResult(r)}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base border-2 transition-all shadow-sm ${result === r ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50/30'}`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                          <button onClick={cancelInterview} className="text-red-500 hover:text-red-700 font-bold px-4 py-3 rounded-xl border-2 border-transparent hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 text-sm md:text-base">
                            <XCircle size={18} /> Hủy & Đưa về hàng chờ
                          </button>
                          <button onClick={submitEvaluation} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center gap-2 text-sm md:text-base">
                            <Save size={18} /> HOÀN TẤT & LƯU
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/50 animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Hàng chờ chung ({boardData.waiting.length})
              </h3>
              <button onClick={() => setShowQueueModal(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 hover:bg-red-50 p-2 rounded-full">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {boardData.waiting.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  <p className="italic font-medium">Chưa có ai trong hàng đợi.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {boardData.waiting.map((c, index) => (
                    <li key={c.interviewCode} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <span className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-black">{index + 1}</span>
                        <div>
                          <span className="font-black text-lg text-slate-700 block">{c.interviewCode}</span>
                          <span className="text-sm font-medium text-slate-500">{c.applicationData?.['Họ và tên'] || ''}</span>
                        </div>
                      </div>
                      
                      {!autoAssign && !currentCandidate && !isBreak && (
                        <button 
                          onClick={() => callCandidate(c.interviewCode)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
                        >
                          <Hand size={18} /> GỌI
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white/50">
              <button onClick={() => setShowQueueModal(false)} className="w-full bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-900 shadow-md active:scale-[0.98] transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget currentUser={user} />
    </div>
  );
}
