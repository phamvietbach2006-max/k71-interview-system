import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Monitor, List, CheckCircle } from 'lucide-react';
import io from 'socket.io-client';
import Board from './Board';
import ChatWidget from '../components/ChatWidget';
import MacBackground from '../components/MacBackground';
import MacWindow from '../components/MacWindow';

export default function ReceptionistView() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [boardData, setBoardData] = useState({ waiting: [], interviewing: [], completed: [] });
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState('board'); // board, candidates
  const [newCandidate, setNewCandidate] = useState({ interviewCode: '', fullName: '' });

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const viewDepartment = user.department || 'TCKT';

  useEffect(() => {
    socketRef.current = io('/');
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'candidates') fetchCandidates();
  }, [activeTab]);

  const fetchCandidates = async () => {
    const res = await fetch('/api/candidates');
    const data = await res.json();
    setCandidates(data);
  };

  const fetchBoard = async () => {
    const query = viewDepartment ? `?department=${viewDepartment}` : '';
    const res = await fetch(`/api/board${query}`);
    const data = await res.json();
    setBoardData({
      ...data,
      waiting: [...(data.moving || []), ...(data.waiting || [])]
    });
  };

  const handleManualCheckIn = () => {
    const code = window.prompt("Nhập MSSV (hoặc Mã PV) của ứng viên để Check-in hộ:");
    if (!code) return;
    
    socketRef.current.emit('candidate_checkin', { interviewCode: code.trim().toUpperCase(), department: viewDepartment });
    alert(`Đã gửi yêu cầu check-in cho ${code.trim().toUpperCase()}`);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.interviewCode || !newCandidate.fullName) return alert('Vui lòng nhập đủ thông tin');
    
    const res = await fetch('/api/candidates/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCandidate, department: viewDepartment })
    });
    const data = await res.json();
    if (data.success) {
      alert('Thêm ứng viên thành công!');
      setNewCandidate({ interviewCode: '', fullName: '' });
      fetchCandidates();
    } else {
      alert(data.message || 'Lỗi thêm ứng viên');
    }
  };

  const filteredCandidates = candidates.filter(c => c.department === viewDepartment || (!c.department && viewDepartment === 'TCKT'));

  if (!user.username || user.role !== 'receptionist') {
    return <div className="min-h-screen flex items-center justify-center">Truy cập bị từ chối. (Cần quyền Lễ Tân)</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 md:p-8 font-sans flex flex-col items-center">
      <MacBackground />

      <MacWindow title={`Lễ Tân Dashboard - ${user.fullName || user.username} (${viewDepartment})`} className="w-full max-w-[1600px] flex-1" contentClassName="p-0 flex flex-col h-full">
        {/* Navigation Tabs */}
        <div className="bg-slate-800 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md shrink-0">
          <div className="flex items-center gap-4">
            <nav className="flex gap-2 bg-slate-900/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'board' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Users size={18} /> Bảng Tiến Độ
              </button>
              <button 
                onClick={() => setActiveTab('candidates')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'candidates' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <List size={18} /> Danh Sách Ứng Viên
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open(`/tv?department=${viewDepartment}`, '_blank')}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Monitor size={16} /> Mở màn hình TV
            </button>
            <button 
              onClick={handleManualCheckIn}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <CheckCircle size={16} /> Check-in Hộ
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 custom-scrollbar">
          {activeTab === 'board' && (
            <div className="animate-fade-in-up h-full">
              <Board data={boardData} department={viewDepartment} />
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-8 animate-fade-in-up">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8 border-b border-slate-100 pb-6">Danh Sách Ứng Viên ({viewDepartment})</h2>
              
              {/* Add New Candidate */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Thêm ứng viên bổ sung</h3>
                <form onSubmit={handleAddCandidate} className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Mã Ứng Viên (MSSV)</label>
                    <input type="text" value={newCandidate.interviewCode} onChange={e => setNewCandidate({...newCandidate, interviewCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white" placeholder="vd: 202513118" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Họ và Tên</label>
                    <input type="text" value={newCandidate.fullName} onChange={e => setNewCandidate({...newCandidate, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Nguyễn Văn A" />
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">Thêm Ứng Viên</button>
                </form>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
                      <th className="p-4 rounded-tl-xl font-black">STT</th>
                      <th className="p-4 font-black">Họ và Tên</th>
                      <th className="p-4 font-black">Mã Sinh Viên</th>
                      <th className="p-4 font-black">Số Điện Thoại</th>
                      <th className="p-4 font-black">Trạng Thái</th>
                      <th className="p-4 rounded-tr-xl font-black text-center">Bàn Phỏng Vấn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c, index) => (
                      <tr key={c._id} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                        <td className="p-4 font-bold text-slate-500 text-center">{index + 1}</td>
                        <td className="p-4 font-bold text-slate-800">{c.applicationData?.['Họ và tên'] || c.applicationData?.['Họ tên'] || c.applicationData?.['fullName'] || '-'}</td>
                        <td className="p-4 font-medium text-slate-600">{c.interviewCode}</td>
                        <td className="p-4 font-medium text-slate-600">{c.applicationData?.['Điện thoại'] || c.applicationData?.['Số điện thoại'] || '-'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            c.status === 'interviewing' ? 'bg-blue-100 text-blue-700' :
                            c.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                            c.status === 'moving' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {c.status === 'completed' ? 'Đã Xong' :
                             c.status === 'interviewing' ? 'Đang PV' :
                             c.status === 'waiting' ? 'Đang Đợi' :
                             c.status === 'moving' ? 'Đang Di Chuyển' : 'Chưa Check-in'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">{c.assignedTable || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </MacWindow>
      <ChatWidget user={user} />
    </div>
  );
}
